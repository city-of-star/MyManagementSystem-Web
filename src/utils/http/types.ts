/**
 * HTTP 相关类型定义和错误类
 */

/**
 * 统一响应接口（与后端 Response<T> 保持一致）
 */
export interface HttpResponse<T = unknown> {
  code: number
  message: string
  data: T
  traceId?: string
}

/**
 * 业务错误类
 * 用于表示后端返回的业务错误（code !== 200）
 */
export class BusinessError extends Error {
  code: number
  traceId?: string

  constructor(code: number, message: string, traceId?: string) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.traceId = traceId
  }
}

/**
 * 网络错误类
 * 用于表示网络连接、超时等系统级错误
 */
export class NetworkError extends Error {
  traceId?: string

  constructor(message: string, traceId?: string) {
    super(message)
    this.name = 'NetworkError'
    this.traceId = traceId
  }
}

