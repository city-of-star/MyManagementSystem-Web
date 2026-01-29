import { httpGet, SERVICE } from '@/utils/http'

// 系统运行总览 VO（需与后端 SystemOverviewVo 对应）
export interface SystemOverview {
  status: 'UP' | 'DEGRADED' | 'DOWN'
  dbOk: boolean
  uptime: string
  jvmMemoryUsedMb: number
  jvmMemoryTotalMb: number
  jvmMemoryUsagePercent: number
  configTotal: number
}

/**
 * 获取系统运行总览信息
 */
export function getSystemOverview(): Promise<SystemOverview> {
  return httpGet<SystemOverview>(SERVICE.BASE, '/system/overview')
}

