/**
 * UI 层错误处理
 * 
 * 设计目标：
 * - 把「错误分类 / UI 提示」从页面组件里抽出来，做到一处维护，处处使用。
 * - 所有通过 HTTP 请求抛出来的错误，最终都建议走这里来做统一处理。
 * 
 * 常用用法（按场景选择一个快捷方法）：
 * - 静默接口（不打扰用户）：此方法什么都不做，只返回错误消息
 *   try {
 *       await httpPost(...)
 *   } catch (e) {
 *       handleErrorSilent(e)
 *   }
 * 
 * - 普通业务错误（Toast提示）：此方法会使用 ElMessage 弹出错误消息，然后返回错误消息
 *   try {
 *       await httpPost(...)
 *   } catch (e) {
 *       handleErrorToast(e, '保存失败')
 *   }
 * 
 * - 关键操作失败（弹窗提示）：此方法会用 ElMessageBox 弹出提示框显示错误消息，用户需要点击确定，然后返回错误消息
 *   try {
 *       await deleteUser(...)
 *   } catch (e) {
 *       handleErrorModal(e, '删除失败')
 *   }
 */

import { ElMessage, ElMessageBox } from 'element-plus'
import { BusinessError, NetworkError } from './types'

/**
 * 快速错误处理：静默失败（不显示任何提示）
 * 适用于：心跳检测、后台同步、非关键操作
 */
export function handleErrorSilent(error: unknown): void {
  handleError(error, { silent: true, showToast: false, showModal: false })
}

/**
 * 快速错误处理：Toast 提示（默认方式）
 * 适用于：大多数业务错误场景
 */
export function handleErrorToast(error: unknown, customMessage?: string): string {
  return handleError(error, { silent: false, showToast: true, showModal: false, customMessage })
}

/**
 * 快速错误处理：弹窗提示
 * 适用于：关键操作失败、需要用户确认的错误
 */
export function handleErrorModal(error: unknown, customTitle?: string, customMessage?: string): string {
  return handleError(error, { silent: false, showModal: true, showToast: false, customTitle, customMessage })
}

/**
 * 统一错误处理函数
 *
 * @param error 错误对象（BusinessError 或 NetworkError）
 * @param options 错误处理选项
 * @returns 错误消息
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): string {
  // 默认选项
  const defaultOptions: Required<Omit<ErrorHandlerOptions, 'customTitle' | 'customMessage'>> & {
    customMessage: string
    customTitle: string
  } = {
    silent: false,
    showToast: true,
    showModal: false,
    customMessage: '',
    customTitle: '',
  }

  const opts = { ...defaultOptions, ...options }

  // 兜底：把所有未知错误统一转成 NetworkError，保证后面类型统一
  let err: BusinessError | NetworkError
  if (!(error instanceof BusinessError) && !(error instanceof NetworkError)) {
    const unknownError = error instanceof Error ? error : new Error(String(error))
    err = new NetworkError(unknownError.message || '未知错误')
    // 简单记录一下，方便开发调试
    console.error('[未知错误]', error)
  } else {
    err = error as BusinessError | NetworkError
  }

  // 静默处理
  if (opts.silent) {
    return err.message
  }

  // 最终展示给用户的文案
  const errorMessage = opts.customMessage || err.message

  // 弹窗（优先级最高）
  if (opts.showModal) {
    const title = opts.customTitle || (err instanceof BusinessError ? '操作失败' : '系统错误')
    showModal(title, errorMessage)
    return errorMessage
  }

  // Toast 提示
  if (opts.showToast) {
    showToast(errorMessage, 'error')
    return errorMessage
  }

  return errorMessage
}

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  /**
   * 是否静默处理（默认 false）
   */
  silent?: boolean
  /**
   * 是否展示 Toast 提示（默认 true）
   */
  showToast?: boolean
  /**
   * 是否展示弹窗提示（默认 false）
   */
  showModal?: boolean
  /**
   * 自定义错误文案（覆盖后端 message）
   */
  customMessage?: string
  /**
   * 自定义弹窗标题（仅在 showModal 时生效）
   */
  customTitle?: string
}

/**
 * 显示 Toast 提示（使用 Element Plus Message）
 */
function showToast(message: string, type: 'error' | 'warning' | 'info' = 'error') {
  ElMessage({
    message,
    type,
    duration: 3000, // 3 秒后自动关闭
  })
}

/**
 * 显示弹窗提示（使用 Element Plus MessageBox）
 */
function showModal(title: string, message: string) {
  ElMessageBox.alert(message, title, {
    type: 'error',
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: false, // 不使用 HTML，防止 XSS
  })
}

