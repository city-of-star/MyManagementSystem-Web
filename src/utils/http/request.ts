import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/auth/auth'
import router from '@/router'
import { type HttpResponse, BusinessError, NetworkError } from '@/utils/http/type.ts'

// API 地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
// 成功状态码
const SUCCESS_CODE = Number(import.meta.env.VITE_SUCCESS_CODE) || 200

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
  (error: unknown) => {
    // 检查是否为 AxiosError
    const isAxiosError = (err: unknown): err is AxiosError<HttpResponse> => {
      return typeof err === 'object' && err !== null && 'isAxiosError' in err
    }

    // 处理 AxiosError（HTTP 错误响应）
    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response

      // 401 未授权：token 无效或过期
      if (status === 401) {
        handleUnauthorized()
        const message = data?.message || '登录信息已过期，请重新登录'
        const code = (data as HttpResponse | undefined)?.code ?? 401
        return Promise.reject(new BusinessError(code, message, (data as HttpResponse | undefined)?.traceId))
      }

      // 403 无权限：当作业务错误
      if (status === 403) {
        const responseData = data as HttpResponse | undefined
        const message = responseData?.message || '没有操作权限'
        const code = responseData?.code ?? 403
        return Promise.reject(new BusinessError(code, message, responseData?.traceId))
      }

      // 404 / 405 / 502 / 503 / 504：当作网络/系统错误
      if (status === 404) {
        const message = (data as HttpResponse | undefined)?.message || '接口不存在'
        return Promise.reject(new NetworkError(message, (data as HttpResponse | undefined)?.traceId))
      }

      if (status === 405) {
        const message = (data as HttpResponse | undefined)?.message || '请求方法不被支持'
        return Promise.reject(new NetworkError(message, (data as HttpResponse | undefined)?.traceId))
      }

      if (status === 502) {
        const message = (data as HttpResponse | undefined)?.message || '网关连接下游服务失败'
        return Promise.reject(new NetworkError(message, (data as HttpResponse | undefined)?.traceId))
      }

      if (status === 503) {
        const message = (data as HttpResponse | undefined)?.message || '服务不可用'
        return Promise.reject(new NetworkError(message, (data as HttpResponse | undefined)?.traceId))
      }

      if (status === 504) {
        const message = (data as HttpResponse | undefined)?.message || '网关超时'
        return Promise.reject(new NetworkError(message, (data as HttpResponse | undefined)?.traceId))
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
 * 处理 401 未授权：清除 token 并跳转登录页
 */
function handleUnauthorized() {
  const authStore = useAuthStore()
  authStore.clearTokens()

  // 避免在登录页重复跳转
  if (router.currentRoute.value.path !== '/login') {
    router.push({name : 'login'})
  }
}

// 导出 http 实例
export { http }
