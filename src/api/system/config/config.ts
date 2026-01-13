import { httpPost, httpPut, httpDelete, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types'

// 分页查询请求 DTO
export interface ConfigPageQuery {
  pageNum?: number
  pageSize?: number
  configKey?: string
  configName?: string
  configType?: string
  status?: number | null
  editable?: number | null
}

// 系统配置信息 VO
export interface ConfigVo {
  id: number
  configKey: string
  configValue?: string
  configType: string
  configName: string
  status?: number
  editable?: number
  remark?: string
}

// 创建系统配置请求 DTO
export interface ConfigCreateRequest {
  configKey: string
  configValue?: string
  configType: string
  configName: string
  status?: number
  editable?: number
  remark?: string
}

// 更新系统配置请求 DTO
export interface ConfigUpdateRequest {
  id: number
  configKey?: string
  configValue?: string
  configType?: string
  configName?: string
  status?: number
  editable?: number
  remark?: string
}

// 切换系统配置状态请求 DTO
export interface ConfigStatusSwitchRequest {
  configId: number
  status: number
}

// 批量删除系统配置请求 DTO
export interface ConfigBatchDeleteRequest {
  configIds: number[]
}

/**
 * 分页查询系统配置
 */
export function getConfigPage(payload: ConfigPageQuery): Promise<PageResult<ConfigVo>> {
  return httpPost<PageResult<ConfigVo>>(SERVICE.BASE, '/config/page', payload)
}

/**
 * 创建系统配置
 */
export function createConfig(payload: ConfigCreateRequest): Promise<ConfigVo> {
  return httpPost<ConfigVo>(SERVICE.BASE, '/config/create', payload)
}

/**
 * 更新系统配置
 */
export function updateConfig(payload: ConfigUpdateRequest): Promise<ConfigVo> {
  return httpPut<ConfigVo>(SERVICE.BASE, '/config/update', payload)
}

/**
 * 删除系统配置
 */
export function deleteConfigApi(configId: number): Promise<void> {
  return httpDelete<void>(SERVICE.BASE, `/config/${configId}`)
}

/**
 * 批量删除系统配置
 */
export function batchDeleteConfig(payload: ConfigBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/config/batch-delete', payload)
}

/**
 * 切换系统配置状态
 */
export function switchConfigStatus(payload: ConfigStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/config/switch-status', payload)
}


