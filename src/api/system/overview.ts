import { httpGet, SERVICE } from '@/utils/http'

// 系统运行总览 VO（需与后端 SystemOverviewVo 对应）
export interface SystemOverview {
  status: 'UP' | 'DEGRADED' | 'DOWN'
  mysqlOk: boolean
  dbOk: boolean
  redisOk: boolean
  onlineUsers: number
  uptime: string
  jvmMemoryUsedMb: number
  jvmMemoryTotalMb: number
  jvmMemoryUsagePercent: number
  configTotal: number
  nacosServerAddr: string
  nacosNamespace: string
  nacosGroup: string
}

/**
 * 获取系统运行总览信息
 */
export function getSystemOverview(): Promise<SystemOverview> {
  return httpGet<SystemOverview>(SERVICE.BASE, '/system/overview')
}

