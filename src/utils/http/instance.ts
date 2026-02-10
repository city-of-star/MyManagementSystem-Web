/**
 * Axios 实例创建和配置
 *
 * 这是 HTTP 模块的核心文件，负责：
 * - 创建 Axios 实例
 * - 注册请求拦截器（添加 Token）
 * - 注册响应拦截器（处理成功响应和错误）
 */

import axios, { type AxiosInstance } from 'axios'
import { API_BASE_URL, REQUEST_TIMEOUT } from './config'
import { requestInterceptor, requestErrorInterceptor, createResponseInterceptors } from './interceptors'

/**
 * 创建并配置 Axios 实例
 */
export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 注册请求拦截器
http.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

// 创建并注册响应拦截器（传入 http 实例用于错误处理时的重试）
const { successResponseInterceptor, errorResponseInterceptor } = createResponseInterceptors(http)
http.interceptors.response.use(successResponseInterceptor, errorResponseInterceptor)

