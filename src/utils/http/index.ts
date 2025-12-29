/**
 * HTTP 请求模块统一导出入口
 * 
 * 这是 HTTP 模块的主入口文件，导出所有需要对外暴露的内容。
 * 
 * 文件结构说明：
 * - index.ts: 统一导出入口（本文件）
 * - instance.ts: Axios 实例创建和拦截器注册
 * - interceptors.ts: 所有拦截器逻辑（请求+响应+错误处理）
 * - token.ts: Token 刷新相关逻辑
 * - error.ts: UI 层错误处理（Toast、Modal）
 * - client.ts: HTTP 请求方法封装（httpGet, httpPost 等）
 * - config.ts: 配置和常量
 * - types.ts: 类型定义和错误类
 * - utils.ts: 工具函数（handleUnauthorized）
 * 
 * 使用示例：
 * ```typescript
 * // 方式1：使用 Axios 实例
 * import { http } from '@/utils/http'
 * const response = await http.get('/api/users')
 * 
 * // 方式2：使用封装的请求方法
 * import { httpGet, httpPost, SERVICE } from '@/utils/http'
 * const users = await httpGet<User[]>(SERVICE.USERCENTER, '/users')
 * 
 * // 方式3：错误处理
 * import { handleErrorToast } from '@/utils/http'
 * try {
 *   await httpPost(SERVICE.USERCENTER, '/users', data)
 * } catch (error) {
 *   handleErrorToast(error, '保存失败')
 * }
 * ```
 */

// ==================== 核心导出 ====================

// Axios 实例（主要导出）
export { http } from './instance'

// ==================== 类型定义和错误类 ====================

export type { HttpResponse } from './types'
export { BusinessError, NetworkError } from './types'

// ==================== 配置 ====================

export { API_BASE_URL, SUCCESS_CODE, HTTP_ERROR_MAP, REQUEST_TIMEOUT } from './config'
export { SERVICE } from './config'
export type { ServicePrefix } from './config'

// ==================== 客户端方法 ====================

export { httpGet, httpPost, httpPut, httpPatch, httpDelete } from './client'

// ==================== 错误处理 ====================

export {
  handleError,
  handleErrorSilent,
  handleErrorToast,
  handleErrorModal,
  type ErrorHandlerOptions,
} from './error'

