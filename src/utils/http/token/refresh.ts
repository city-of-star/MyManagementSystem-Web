/**
 * Token 刷新逻辑
 */

import { refreshToken } from '@/api/auth/auth'
import { useAuthStore } from '@/store/auth/auth'
import type { TokenRefreshResult } from './types'
import {
  getRefreshingStatus,
  setRefreshingStatus,
  waitForTokenRefresh,
  notifyRefreshSubscribers,
  clearRefreshSubscribers,
} from './queue'

/**
 * 处理 Token 刷新（防止并发刷新）
 */
export async function handleTokenRefresh(): Promise<TokenRefreshResult | null> {
  const authStore = useAuthStore()
  const currentRefreshToken = authStore.refreshToken || localStorage.getItem('refreshToken')

  if (!currentRefreshToken) {
    return null
  }

  // 如果正在刷新，等待刷新完成
  if (getRefreshingStatus()) {
    return waitForTokenRefresh()
  }

  // 开始刷新
  return performTokenRefresh(currentRefreshToken)
}

/**
 * 执行 token 刷新
 */
async function performTokenRefresh(currentRefreshToken: string): Promise<TokenRefreshResult | null> {
  setRefreshingStatus(true)
  clearRefreshSubscribers()

  try {
    const response = await refreshToken({ refreshToken: currentRefreshToken })
    const { accessToken, refreshToken: newRefreshToken } = response

    // 更新 store 和 localStorage
    const authStore = useAuthStore()
    authStore.setTokens(accessToken, newRefreshToken)

    const result: TokenRefreshResult = { accessToken, refreshToken: newRefreshToken }

    // 通知所有等待的请求
    notifyRefreshSubscribers(result)

    return result
  } catch (error) {
    // 刷新失败，通知所有等待的请求
    notifyRefreshSubscribers(null)
    throw error
  } finally {
    setRefreshingStatus(false)
  }
}

