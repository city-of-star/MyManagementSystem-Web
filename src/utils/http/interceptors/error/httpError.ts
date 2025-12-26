/**
 * HTTP 错误处理（有响应的情况）
 */

import type { AxiosError, AxiosInstance } from 'axios'
import type { HttpResponse } from '../../types'
import { BusinessError, NetworkError } from '../../types'
import { HTTP_ERROR_MAP } from '../../config'
import { isHttpResponse } from './types'
import { handle401Error } from './401Error'

/**
 * 处理 HTTP 错误（有响应的情况）
 * 
 * @param error Axios 错误对象
 * @param httpInstance Axios 实例（用于401错误时的token刷新重试）
 */
export async function handleHttpError(
  error: AxiosError<HttpResponse>,
  httpInstance: AxiosInstance
): Promise<never> {
  const { status, data } = error.response!

  // 401错误：尝试刷新token
  if (status === 401) {
    return await handle401Error(error, httpInstance)
  }

  // 其他HTTP错误
  return handleOtherHttpErrors(status, data)
}

/**
 * 处理其他HTTP错误
 */
function handleOtherHttpErrors(status: number, data: unknown): never {
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
export function handleMappedHttpError(status: number, data: unknown): never {
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

