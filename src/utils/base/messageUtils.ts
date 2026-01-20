/**
 * 消息提示工具
 *
 * 统一管理业务消息提示，与错误处理（error.ts）分离
 * - error.ts：专门处理 HTTP 请求错误
 * - messageUtils.ts：专门处理业务操作的成功/警告/信息提示
 *
 * 使用示例：
 * - 成功提示：message.success('操作成功')
 * - 警告提示：message.warning('请填写用户名')
 * - 信息提示：message.info('请先选择要删除的用户')
 * - 错误提示：message.error('操作失败')
 * - 确认对话框：await message.confirm('确定要删除吗？')
 */

import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 消息提示配置
 */
const MESSAGE_CONFIG = {
  duration: 3000, // 默认显示时长（毫秒）
  confirmButtonText: '确定',
  cancelButtonText: '取消',
}

/**
 * 显示成功消息
 */
export function showSuccess(message: string, duration?: number) {
  ElMessage({
    message,
    type: 'success',
    duration: duration ?? MESSAGE_CONFIG.duration,
  })
}

/**
 * 显示警告消息
 */
export function showWarning(message: string, duration?: number) {
  ElMessage({
    message,
    type: 'warning',
    duration: duration ?? MESSAGE_CONFIG.duration,
  })
}

/**
 * 显示信息消息
 */
export function showInfo(message: string, duration?: number) {
  ElMessage({
    message,
    type: 'info',
    duration: duration ?? MESSAGE_CONFIG.duration,
  })
}

/**
 * 显示错误消息（用于业务错误，非 HTTP 错误）
 * 注意：HTTP 错误请使用 error.ts 中的 handleErrorToast
 */
export function showError(message: string, duration?: number) {
  ElMessage({
    message,
    type: 'error',
    duration: duration ?? MESSAGE_CONFIG.duration,
  })
}

/**
 * 确认对话框
 * @param message 提示消息
 * @param title 标题，默认为 '提示'
 * @param options 额外配置选项
 * @returns Promise，用户点击确定时 resolve，取消时 reject
 */
export function showConfirm(
  message: string,
  title: string = '提示',
  options?: {
    type?: 'warning' | 'info' | 'error' | 'success'
    confirmButtonText?: string
    cancelButtonText?: string
    dangerouslyUseHTMLString?: boolean
  }
): Promise<void> {
  return ElMessageBox.confirm(message, title, {
    type: options?.type ?? 'warning',
    confirmButtonText: options?.confirmButtonText ?? MESSAGE_CONFIG.confirmButtonText,
    cancelButtonText: options?.cancelButtonText ?? MESSAGE_CONFIG.cancelButtonText,
    dangerouslyUseHTMLString: options?.dangerouslyUseHTMLString ?? false,
  }).then(() => {})
}

/**
 * 统一的消息工具对象
 * 提供更简洁的 API
 */
export const Message = {
  success: showSuccess,
  warning: showWarning,
  info: showInfo,
  error: showError,
  confirm: showConfirm,
}
