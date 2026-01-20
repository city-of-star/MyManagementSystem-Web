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
 * - 普通业务错误（Toast提示）：此方法会使用统一的消息工具弹出错误消息，然后返回错误消息
 *   try {
 *       await httpPost(...)
 *   } catch (e) {
 *       handleErrorToast(e) // 如果后端返回了错误消息，会直接显示
 *       handleErrorToast(e, '保存失败') // 也可以自定义消息来覆盖
 *   }
 */

import { Message } from '@/utils/base/messageUtils.ts'
import { BusinessError, NetworkError } from './types'

/**
 * 快速错误处理：静默失败（不显示任何提示）
 * 适用于：心跳检测、后台同步、非关键操作
 */
export function handleErrorSilent(error: unknown): void {
  handleError(error, { silent: true, showToast: false })
}

/**
 * 快速错误处理：Toast 提示（默认方式）
 * 适用于：大多数业务错误场景
 */
export function handleErrorToast(error: unknown, customMessage?: string): string {
  return handleError(error, { silent: false, showToast: true, customMessage })
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
  const defaultOptions: Required<Omit<ErrorHandlerOptions, 'customMessage'>> & {
    customMessage: string
  } = {
    silent: false,
    showToast: true,
    customMessage: '',
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

  // Toast 提示
  if (opts.showToast) {
    Message.error(errorMessage)
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
   * 自定义错误文案（覆盖后端 message）
   */
  customMessage?: string
}

