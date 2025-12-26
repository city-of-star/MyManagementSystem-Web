/**
 * Token 刷新队列管理
 * 防止并发刷新 token
 */

import type { TokenRefreshResult } from './types'

/**
 * 是否正在刷新 token
 */
let isRefreshing = false

/**
 * 等待 token 刷新的订阅者队列
 */
let refreshSubscribers: Array<(result: TokenRefreshResult | null) => void> = []

/**
 * 获取刷新状态
 */
export function getRefreshingStatus(): boolean {
  return isRefreshing
}

/**
 * 设置刷新状态
 */
export function setRefreshingStatus(status: boolean): void {
  isRefreshing = status
}

/**
 * 等待正在进行的 token 刷新
 */
export function waitForTokenRefresh(): Promise<TokenRefreshResult | null> {
  return new Promise<TokenRefreshResult | null>((resolve) => {
    refreshSubscribers.push((result) => resolve(result))
  })
}

/**
 * 通知所有等待 token 刷新的请求
 */
export function notifyRefreshSubscribers(result: TokenRefreshResult | null): void {
  refreshSubscribers.forEach((callback) => callback(result))
  refreshSubscribers = []
}

/**
 * 清空订阅者队列（用于开始新的刷新时）
 */
export function clearRefreshSubscribers(): void {
  refreshSubscribers = []
}

