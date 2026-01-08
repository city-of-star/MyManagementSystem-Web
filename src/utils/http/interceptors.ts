/**
 * 拦截器逻辑
 *
 * 包含：
 * - 请求拦截器：添加 Token
 * - 响应拦截器：处理成功响应
 * - 错误拦截器：处理各种错误（401、网络错误等）
 *
 * 所有拦截器逻辑集中在一个文件中，便于理解和维护
 */

import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth/auth'
import type { HttpResponse } from './types'
import { BusinessError, NetworkError } from './types'
import { SUCCESS_CODE, HTTP_ERROR_MAP } from './config'
import { handleTokenRefresh, retryRequestWithNewTokens } from './token'
import { handleUnauthorized } from './utils'

// ==================== 请求拦截器 ====================

/**
 * 请求拦截器
 * 自动添加 Authorization header
 */
export function requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const authStore = useAuthStore()
  const token = authStore.accessToken || localStorage.getItem('accessToken')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}

/**
 * 请求错误拦截器
 */
export function requestErrorInterceptor(error: unknown): Promise<never> {
  return Promise.reject(error)
}

// ==================== 响应拦截器 ====================

/**
 * 处理成功响应
 */
function successResponseInterceptor(response: AxiosResponse<HttpResponse>): AxiosResponse<HttpResponse> {
  const { code, message, traceId } = response.data

  if (code === SUCCESS_CODE) {
    return response
  }

  // 业务失败
  throw new BusinessError(code, message, traceId)
}

/**
 * 处理错误响应（主入口，负责路由分发）
 */
async function errorResponseInterceptor(error: unknown, httpInstance: AxiosInstance): Promise<never> {
  // HTTP错误（有响应）
  if (isAxiosErrorWithResponse(error)) {
    return handleHttpError(error, httpInstance)
  }

  // 网络错误（无响应）
  if (isAxiosErrorWithRequest(error)) {
    return handleNetworkError(error)
  }

  // 未知错误
  return handleUnknownError(error)
}

/**
 * 创建响应拦截器
 *
 * @param httpInstance Axios 实例（用于错误处理时的重试）
 */
export function createResponseInterceptors(httpInstance: AxiosInstance) {
  return {
    successResponseInterceptor,
    errorResponseInterceptor: (error: unknown) => errorResponseInterceptor(error, httpInstance),
  }
}

// ==================== 错误处理 ====================

/**
 * 处理 HTTP 错误（有响应的情况）
 */
async function handleHttpError(
  error: AxiosError<HttpResponse>,
  httpInstance: AxiosInstance
): Promise<never> {
  const { status, data } = error.response!

  // 401错误：尝试刷新token
  if (status === 401) {
    return await handle401Error(error, httpInstance)
  }

  // 其他HTTP错误
  return handleOtherHttpErrors(error, status, data)
}

/**
 * 处理401错误：尝试刷新token并重试
 */
async function handle401Error(
  error: AxiosError<HttpResponse>,
  httpInstance: AxiosInstance
): Promise<never> {
  const { data, config } = error.response!

  // 如果是刷新token接口本身，直接跳转登录
  if (config?.url?.includes('/auth/refresh')) {
    handleUnauthorized()
    return createBusinessError(data, 401)
  }

  // 尝试刷新token
  try {
    const refreshResult = await handleTokenRefresh()
    if (!refreshResult || !config) {
      return handleUnauthorizedAndReject(data)
    }

    // 使用新token重试请求（现在直接返回响应，不再抛出）
    const response = await retryRequestWithNewTokens(httpInstance, config, refreshResult)
    // 重试成功，直接返回 Promise.resolve，让 Axios 将其视为成功响应
    // 使用类型断言绕过 Promise<never> 的类型限制
    return Promise.resolve(response) as any as never
  } catch (error) {
    // 真正的刷新失败，跳转登录
    return handleUnauthorizedAndReject(data)
  }
}

/**
 * 处理其他HTTP错误
 */
function handleOtherHttpErrors(
  error: AxiosError<HttpResponse>,
  status: number,
  data: unknown
): never {
  
  // 刷新token失败，跳转登录页并抛出异常
  if (error.config?.url?.includes('/auth/refresh')) {
    return handleUnauthorizedAndReject(data)
  }

  // 使用映射表处理已知状态码
  if (HTTP_ERROR_MAP[status]) {
    return handleMappedHttpError(status, data)
  }

  // 检查是否为统一格式的响应
  if (isHttpResponse(data)) {
    throw new BusinessError(data.code, data.message, data.traceId)
  }

  // 其他情况
  const responseData = data as HttpResponse | undefined
  const message = responseData?.message || `请求失败 (${status})`
  throw new NetworkError(message, responseData?.traceId)
}

/**
 * 处理映射表中的HTTP错误
 */
function handleMappedHttpError(status: number, data: unknown): never {
  const errorConfig = HTTP_ERROR_MAP[status]
  if (!errorConfig) {
    // 理论上不会到这里，但为了类型安全
    const responseData = data as HttpResponse | undefined
    const message = responseData?.message || `请求失败 (${status})`
    throw new NetworkError(message, responseData?.traceId)
  }

  const responseData = data as HttpResponse | undefined
  const message = responseData?.message || errorConfig.message
  const code = responseData?.code ?? status

  if (errorConfig.isBusinessError) {
    throw new BusinessError(code, message, responseData?.traceId)
  } else {
    throw new NetworkError(message, responseData?.traceId)
  }
}

/**
 * 处理网络错误（无响应的情况）
 */
function handleNetworkError(error: AxiosError): never {
  const { code, message } = error

  // 超时错误
  if (code === 'ECONNABORTED' || message?.includes('timeout')) {
    throw new NetworkError('请求超时，请稍后重试')
  }

  // 网络连接错误
  if (code === 'ERR_NETWORK' || message?.includes('Network Error')) {
    throw new NetworkError('网络连接失败，请检查网络设置')
  }

  // 其他网络错误
  throw new NetworkError('网络错误，请稍后重试')
}

/**
 * 处理未知错误
 */
function handleUnknownError(error: unknown): never {
  if (error instanceof Error) {
    throw new NetworkError(error.message || '未知错误，请稍后重试')
  }

  throw new NetworkError('未知错误，请稍后重试')
}

/**
 * 处理未授权并拒绝请求
 */
function handleUnauthorizedAndReject(data: unknown): never {
  handleUnauthorized()
  return createBusinessError(data, 401)
}

/**
 * 创建业务错误
 */
function createBusinessError(data: unknown, defaultCode: number): never {
  const responseData = data as HttpResponse | undefined
  const message = responseData?.message || HTTP_ERROR_MAP[defaultCode]?.message || '请求失败'
  const code = responseData?.code ?? defaultCode
  throw new BusinessError(code, message, responseData?.traceId)
}

// ==================== 类型守卫 ====================

/**
 * 检查是否为带响应的 Axios 错误
 */
function isAxiosErrorWithResponse(error: unknown): error is AxiosError<HttpResponse> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    'response' in error &&
    error.response !== undefined
  )
}

/**
 * 检查是否为带请求的 Axios 错误（网络错误）
 */
function isAxiosErrorWithRequest(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    'request' in error &&
    error.request !== undefined
  )
}

/**
 * 检查是否为统一格式的 HTTP 响应
 */
function isHttpResponse(data: unknown): data is HttpResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'message' in data
  )
}

