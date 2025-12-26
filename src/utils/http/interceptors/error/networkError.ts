/**
 * 网络错误处理（无响应的情况）
 */

import type { AxiosError } from 'axios'
import { NetworkError } from '../../types'

/**
 * 处理网络错误（无响应的情况）
 */
export function handleNetworkError(error: AxiosError): never {
  const { code, message } = error

  // 超时错误
  if (code === 'ECONNABORTED' || message?.includes('timeout')) {
    throw new NetworkError('请求超时，请稍后重试')
  }

  // 网络连接错误
  if (code === 'ERR_NETWORK' || message?.includes('Network Error')) {
    throw new NetworkError('网络连接失败，请检查网络设置')
  }

  // 其他网络错误
  throw new NetworkError('网络错误，请稍后重试')
}

