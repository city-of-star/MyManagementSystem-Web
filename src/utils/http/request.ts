/**
 * HTTP 请求模块统一导出
 * 
 * 此文件作为 HTTP 模块的主入口，导出所有需要对外暴露的内容
 * 实际实现已按职责拆分为多个模块：
 * - config/: 配置和常量
 * - types/: 类型定义
 * - core/: 核心实例
 * - client/: HTTP 请求方法封装
 * - error/: UI 层错误处理
 * - interceptors/: 请求/响应拦截器
 * - token/: Token 刷新相关逻辑
 * - utils/: 工具函数
 */

// 导出 Axios 实例（主要导出）
export { http } from './core/instance'

// 导出类型定义和错误类
export type { HttpResponse } from './types'
export { BusinessError, NetworkError } from './types'

// 导出配置
export { API_BASE_URL, SUCCESS_CODE, HTTP_ERROR_MAP, REQUEST_TIMEOUT } from './config'
export { SERVICE } from './config'
export type { ServicePrefix } from './config'

// 导出客户端方法
export { httpGet, httpPost, httpPut, httpPatch, httpDelete } from './client'

// 导出错误处理
export {
  handleError,
  handleErrorSilent,
  handleErrorToast,
  handleErrorModal,
  type ErrorHandlerOptions,
} from './error'
