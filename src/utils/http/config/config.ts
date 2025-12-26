/**
 * HTTP 请求配置和常量
 */

/**
 * API 基础地址
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

/**
 * 成功状态码
 */
export const SUCCESS_CODE = Number(import.meta.env.VITE_SUCCESS_CODE) || 200

/**
 * HTTP 错误码映射表
 */
export const HTTP_ERROR_MAP: Record<number, { message: string; isBusinessError: boolean }> = {
  401: { message: '登录信息已过期，请重新登录', isBusinessError: true },
  403: { message: '没有操作权限', isBusinessError: true },
  404: { message: '接口不存在', isBusinessError: false },
  405: { message: '请求方法不被支持', isBusinessError: false },
  502: { message: '网关连接下游服务失败', isBusinessError: false },
  503: { message: '服务不可用', isBusinessError: false },
  504: { message: '网关超时', isBusinessError: false },
}

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 10_000

