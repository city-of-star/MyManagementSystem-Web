/**
 * 401 错误处理：Token 刷新和重试逻辑
 */

import type { AxiosError, AxiosInstance } from 'axios'
import type { HttpResponse } from '../../types'
import { BusinessError } from '../../types'
import { handleTokenRefresh } from '../../token/refresh'
import { retryRequestWithNewTokens } from '../../token/retry'
import { handleUnauthorized } from '../../utils'
import { HTTP_ERROR_MAP } from '../../config'

/**
 * 处理401错误：尝试刷新token并重试
 * 
 * @param error Axios 错误对象
 * @param httpInstance Axios 实例（用于重试请求）
 */
export async function handle401Error(
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

    // 使用新token重试请求
    return await retryRequestWithNewTokens(httpInstance, config, refreshResult)
  } catch {
    // 刷新失败，跳转登录
    return handleUnauthorizedAndReject(data)
  }
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

