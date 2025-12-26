/**
 * 错误处理相关的类型守卫和类型定义
 */

import type { AxiosError } from 'axios'
import type { HttpResponse } from '../../types'

/**
 * 检查是否为带响应的 Axios 错误
 */
export function isAxiosErrorWithResponse(error: unknown): error is AxiosError<HttpResponse> {
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
export function isAxiosErrorWithRequest(error: unknown): error is AxiosError {
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
export function isHttpResponse(data: unknown): data is HttpResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'message' in data
  )
}

