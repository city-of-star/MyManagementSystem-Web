/**
 * Axios 实例创建和配置
 */

import axios, { type AxiosInstance } from 'axios'
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config'
import { requestInterceptor, requestErrorInterceptor } from '../interceptors/request'
import { createResponseInterceptors } from '../interceptors/response'

/**
 * 创建并配置 Axios 实例
 */
export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 注册请求拦截器
http.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

// 创建并注册响应拦截器（传入 http 实例用于错误处理时的重试）
const { successResponseInterceptor, errorResponseInterceptor } = createResponseInterceptors(http)
http.interceptors.response.use(successResponseInterceptor, errorResponseInterceptor)

