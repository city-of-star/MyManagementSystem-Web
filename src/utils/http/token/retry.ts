/**
 * Token 刷新后重试请求
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { TokenRefreshResult } from './types'
import type { HttpResponse } from '../types'

/**
 * 使用新 token 重试请求
 * 
 * @param httpInstance Axios 实例（通过参数传入避免循环依赖）
 * @param config 原始请求配置
 * @param refreshResult Token 刷新结果
 * @returns 重试请求的响应（成功时返回响应，失败时抛出错误）
 */
export async function retryRequestWithNewTokens(
  httpInstance: AxiosInstance,
  config: AxiosRequestConfig,
  refreshResult: TokenRefreshResult
): Promise<AxiosResponse<HttpResponse>> {
  const { accessToken, refreshToken: newRefreshToken } = refreshResult

  // 更新请求头
  config.headers = config.headers || {}
  config.headers.Authorization = `Bearer ${accessToken}`

  // 更新请求体中的 refreshToken（如果存在）
  updateRefreshTokenInRequestData(config, newRefreshToken)

  // 重试请求（会经过完整的拦截器链，包括响应拦截器）
  // 如果成功，响应拦截器的成功拦截器会返回 response
  // 如果失败，响应拦截器的错误拦截器会抛出错误
  const response = await httpInstance.request(config)
  // 重试成功，直接返回响应（不需要抛出，因为已经经过拦截器处理）
  return response
}

/**
 * 更新请求体中的 refreshToken 字段
 */
function updateRefreshTokenInRequestData(config: AxiosRequestConfig, newRefreshToken: string): void {
  if (!config.data || !newRefreshToken) {
    return
  }

  try {
    const requestData = parseRequestData(config.data)
    if (!requestData || !('refreshToken' in requestData)) {
      return
    }

    // 更新 refreshToken
    requestData.refreshToken = newRefreshToken

    // 重新赋值给 config.data
    config.data = typeof config.data === 'string' ? JSON.stringify(requestData) : requestData
  } catch (error) {
    // 更新失败，记录警告但继续执行
    console.warn('Failed to update refreshToken in request data:', error)
  }
}

/**
 * 解析请求数据（支持字符串和对象）
 */
function parseRequestData(data: unknown): Record<string, unknown> | null {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as Record<string, unknown>
    } catch {
      return null
    }
  }

  if (typeof data === 'object' && data !== null) {
    // 深拷贝避免修改原对象
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>
  }

  return null
}

