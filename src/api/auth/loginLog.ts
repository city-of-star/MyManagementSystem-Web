import { httpGet, SERVICE } from '@/utils/http'

export interface UserLoginLog {
  id: number
  userId: number | null
  username: string
  loginIp: string
  loginLocation: string
  userAgent: string
  loginStatus: number
  loginMessage: string
  loginTime: string
}

/**
 * 获取最近的登录失败记录（用于首页告警列表）
 */
export function getRecentFailedLoginLogs(limit = 5): Promise<UserLoginLog[]> {
  return httpGet<UserLoginLog[]>(SERVICE.USERCENTER, `/auth/login-log/recent-failed?limit=${limit}`)
}

