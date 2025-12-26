import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/auth/auth'
import router from '@/router'
import { type HttpResponse, BusinessError, NetworkError } from '@/utils/http/type.ts'
import { refreshToken } from '@/api/auth/auth'

// API 地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
// 成功状态码
const SUCCESS_CODE = Number(import.meta.env.VITE_SUCCESS_CODE) || 200

// 刷新token的请求队列，防止并发刷新
let isRefreshing = false
let refreshSubscribers: Array<(result: TokenRefreshResult | null) => void> = []

/**
 * Token刷新结果
 */
interface TokenRefreshResult {
  accessToken: string
  refreshToken: string
}

// HTTP 状态码错误映射表
const HTTP_ERROR_MAP: Record<number, { message: string; isBusinessError: boolean }> = {
  401: { message: '登录信息已过期，请重新登录', isBusinessError: true },
  403: { message: '没有操作权限', isBusinessError: true },
  404: { message: '接口不存在', isBusinessError: false },
  405: { message: '请求方法不被支持', isBusinessError: false },
  502: { message: '网关连接下游服务失败', isBusinessError: false },
  503: { message: '服务不可用', isBusinessError: false },
  504: { message: '网关超时', isBusinessError: false },
}

// axios 实例：若 BASE_URL 为空，使用相对路径，交给 Vite 代理处理
const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：统一携带 Access Token
http.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken || localStorage.getItem('accessToken')

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理响应和错误
http.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const data = response.data

    // 成功
    if (data.code === SUCCESS_CODE) {
      return response
    }

    // 业务失败
    const error = new BusinessError(data.code, data.message, data.traceId)
    return Promise.reject(error)
  },
  async (error: unknown) => {
    // 检查是否为 AxiosError
    const isAxiosError = (err: unknown): err is AxiosError<HttpResponse> => {
      return typeof err === 'object' && err !== null && 'isAxiosError' in err
    }

    // 处理 AxiosError（HTTP 错误响应）
    if (isAxiosError(error) && error.response) {
      const { status, data, config } = error.response

      // 401 未授权：尝试使用 refreshToken 刷新 accessToken
      if (status === 401) {
        // 排除刷新token接口本身，避免无限循环
        if (config?.url?.includes('/auth/refresh')) {
          handleUnauthorized()
          const message = data?.message || '登录信息已过期，请重新登录'
          const code = (data as HttpResponse | undefined)?.code ?? 401
          return Promise.reject(new BusinessError(code, message, (data as HttpResponse | undefined)?.traceId))
        }

        // 尝试刷新token
        try {
          const refreshResult = await handleTokenRefresh()
          if (refreshResult && config) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResult

            // 更新请求头中的token
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${accessToken}`

            // 如果请求body中包含refreshToken字段（如logout请求），也需要更新
            // 注意：axios可能已经将data序列化为JSON字符串，需要先解析
            if (config.data && newRefreshToken) {
              try {
                let requestData: Record<string, unknown>
                let isString = false

                if (typeof config.data === 'string') {
                  // 如果是字符串，尝试解析为JSON
                  isString = true
                  requestData = JSON.parse(config.data) as Record<string, unknown>
                } else if (typeof config.data === 'object') {
                  // 如果是对象，深拷贝避免修改原对象
                  requestData = JSON.parse(JSON.stringify(config.data)) as Record<string, unknown>
                } else {
                  // 其他类型，跳过
                  requestData = null as unknown as Record<string, unknown>
                }

                // 更新refreshToken字段
                if (requestData && 'refreshToken' in requestData) {
                  requestData.refreshToken = newRefreshToken
                  // 重新赋值给config.data
                  if (isString) {
                    config.data = JSON.stringify(requestData)
                  } else {
                    config.data = requestData
                  }
                }
              } catch (e) {
                // 解析或更新失败，记录警告但继续执行
                console.warn('Failed to update refreshToken in request data:', e)
              }
            }

            // 重试原始请求
            return http.request(config)
          }
        } catch (refreshError) {
          // 刷新失败，清除token并跳转登录
          handleUnauthorized()
          const message = data?.message || '登录信息已过期，请重新登录'
          const code = (data as HttpResponse | undefined)?.code ?? 401
          return Promise.reject(new BusinessError(code, message, (data as HttpResponse | undefined)?.traceId))
        }
      }

      // 使用映射表处理已知的HTTP状态码
      if (HTTP_ERROR_MAP[status]) {
        const errorConfig = HTTP_ERROR_MAP[status]
        const responseData = data as HttpResponse | undefined
        const message = responseData?.message || errorConfig.message
        const code = responseData?.code ?? status

        if (errorConfig.isBusinessError) {
          return Promise.reject(new BusinessError(code, message, responseData?.traceId))
        } else {
          return Promise.reject(new NetworkError(message, responseData?.traceId))
        }
      }

      // 其他 HTTP 错误：如果后端返回了统一格式的 Response，就按业务错误处理
      if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
        const responseData = data as HttpResponse
        return Promise.reject(new BusinessError(responseData.code, responseData.message, responseData.traceId))
      }

      // 其他 HTTP 错误：没有统一格式，使用状态码+简单文案
      const responseData = data as HttpResponse | undefined
      const message = responseData?.message || `请求失败 (${status})`
      return Promise.reject(new NetworkError(message, responseData?.traceId))
    }

    // 处理 AxiosError（网络错误，无响应）
    if (isAxiosError(error) && error.request) {
      const errorCode = error.code
      const errorMessage = error.message || ''

      // 超时错误
      if (errorCode === 'ECONNABORTED' || errorMessage.includes('timeout')) {
        return Promise.reject(new NetworkError('请求超时，请稍后重试'))
      }

      // 网络连接错误
      if (errorCode === 'ERR_NETWORK' || errorMessage.includes('Network Error')) {
        return Promise.reject(new NetworkError('网络连接失败，请检查网络设置'))
      }

      // 其他网络错误
      return Promise.reject(new NetworkError('网络错误，请稍后重试'))
    }

    // 处理普通 Error
    if (error instanceof Error) {
      return Promise.reject(new NetworkError(error.message || '未知错误，请稍后重试'))
    }

    // 其他未知错误
    return Promise.reject(new NetworkError('未知错误，请稍后重试'))
  }
)

/**
 * 处理Token刷新（防止并发刷新）
 */
async function handleTokenRefresh(): Promise<TokenRefreshResult | null> {
  const authStore = useAuthStore()
  const currentRefreshToken = authStore.refreshToken || localStorage.getItem('refreshToken')

  if (!currentRefreshToken) {
    return null
  }

  // 如果正在刷新，等待刷新完成
  if (isRefreshing) {
    return new Promise<TokenRefreshResult | null>((resolve) => {
      refreshSubscribers.push((result: TokenRefreshResult | null) => {
        resolve(result)
      })
    })
  }

  isRefreshing = true
  refreshSubscribers = []

  try {
    const response = await refreshToken({ refreshToken: currentRefreshToken })
    const { accessToken, refreshToken: newRefreshToken } = response

    // 更新store和localStorage
    authStore.setTokens(accessToken, newRefreshToken)

    const result: TokenRefreshResult = { accessToken, refreshToken: newRefreshToken }

    // 通知所有等待的请求
    refreshSubscribers.forEach((callback) => callback(result))
    refreshSubscribers = []

    return result
  } catch (error) {
    // 刷新失败，通知所有等待的请求
    refreshSubscribers.forEach((callback) => callback(null))
    refreshSubscribers = []
    throw error
  } finally {
    isRefreshing = false
  }
}

/**
 * 处理 401 未授权：清除 token 并跳转登录页
 */
function handleUnauthorized() {
  const authStore = useAuthStore()
  authStore.clearTokens()

  // 避免在登录页重复跳转
  if (router.currentRoute.value.path !== '/login') {
    router.push({ name: 'login' })
  }
}

// 导出 http 实例
export { http }
