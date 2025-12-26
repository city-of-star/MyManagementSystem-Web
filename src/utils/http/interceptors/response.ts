/**
 * 响应拦截器
 * 处理成功响应和错误响应
 */

import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import type { HttpResponse } from '../types'
import { BusinessError, NetworkError } from '../types'
import { SUCCESS_CODE } from '../config'
import { handleHttpError, handleNetworkError, isAxiosErrorWithResponse, isAxiosErrorWithRequest } from './error'

/**
 * 创建响应拦截器
 * 
 * @param httpInstance Axios 实例（用于错误处理时的重试）
 */
export function createResponseInterceptors(httpInstance: AxiosInstance) {
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
  async function errorResponseInterceptor(error: unknown): Promise<never> {
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

  return {
    successResponseInterceptor,
    errorResponseInterceptor,
  }
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

