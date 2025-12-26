/**
 * HTTP 工具函数
 */

import router from '@/router'
import { useAuthStore } from '@/store/auth/auth'

/**
 * 处理未授权：清除 token 并跳转登录页
 */
export function handleUnauthorized(): void {
  const authStore = useAuthStore()
  authStore.clearTokens()

  // 避免在登录页重复跳转
  if (router.currentRoute.value.path !== '/login') {
    router.push({ name: 'login' })
  }
}

