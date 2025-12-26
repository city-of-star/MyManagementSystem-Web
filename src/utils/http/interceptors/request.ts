/**
 * 请求拦截器
 * 负责在请求发送前添加认证 token
 */

import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth/auth'

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

