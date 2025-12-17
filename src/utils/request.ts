import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '../store/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
const API_PREFIX = import.meta.env.VITE_API_PREFIX as string | undefined

// axios 实例：若 BASE_URL 为空，使用相对路径，交给 Vite 代理处理
const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：统一携带 Access Token
http.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.accessToken || localStorage.getItem('accessToken')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 响应拦截器：简单透传，后续可在这里做全局错误处理
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    return Promise.reject(error)
  }
)

function buildUrl(path: string): string {
  const prefix = API_PREFIX ?? ''
  return `${prefix}${path}`
}

export interface HttpResponse<T = unknown> {
  code: number
  message: string
  data: T
  traceId?: string
}

export async function httpPost<T = unknown>(path: string, body?: unknown): Promise<HttpResponse<T>> {
  const url = buildUrl(path)
  const resp = await http.post<HttpResponse<T>>(url, body ?? {})
  return resp.data
}
