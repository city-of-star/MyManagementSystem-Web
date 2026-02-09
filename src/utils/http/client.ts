/**
 * HTTP 客户端封装
 * 提供便捷的 HTTP 请求方法
 */

import { type Method, type AxiosRequestConfig } from 'axios'
import { http } from './instance'
import type { HttpResponse } from './types'
import type { ServicePrefix } from './config'

/**
 * 通用 HTTP 请求方法（按服务 + 方法 + 相对路径发送）
 */
async function httpRequest<T = unknown>(options: {
  service: ServicePrefix
  method: Method
  path: string
  params?: Record<string, unknown>
  body?: unknown
  config?: AxiosRequestConfig
}): Promise<T> {
  const { service, method, path, params, body, config } = options
  const url = `${service}${path}`

  const resp = await http.request<HttpResponse<T>>({
    url,
    method,
    params,
    data: body ?? {},
    ...config,
  })

  return resp.data.data
}

/**
 * GET 请求（按服务 + 相对路径）
 */
export function httpGet<T = unknown>(
  service: ServicePrefix,
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  return httpRequest<T>({ service, method: 'GET', path, params })
}

/**
 * POST 请求（按服务 + 相对路径）
 * 支持透传 AxiosRequestConfig（用于 multipart/form-data、blob 等场景）
 */
export function httpPost<T = unknown>(
  service: ServicePrefix,
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return httpRequest<T>({ service, method: 'POST', path, body, config })
}

/**
 * PUT 请求（按服务 + 相对路径）
 */
export function httpPut<T = unknown>(
  service: ServicePrefix,
  path: string,
  body?: unknown
): Promise<T> {
  return httpRequest<T>({ service, method: 'PUT', path, body })
}

/**
 * PATCH 请求（按服务 + 相对路径）
 */
export function httpPatch<T = unknown>(
  service: ServicePrefix,
  path: string,
  body?: unknown
): Promise<T> {
  return httpRequest<T>({ service, method: 'PATCH', path, body })
}

/**
 * DELETE 请求（按服务 + 相对路径）
 */
export function httpDelete<T = unknown>(
  service: ServicePrefix,
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  return httpRequest<T>({ service, method: 'DELETE', path, params })
}

