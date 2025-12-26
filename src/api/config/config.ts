import { httpPost, httpPut, httpDelete, SERVICE } from '@/utils/http/request'

export interface ConfigPageQuery {
  pageNum?: number
  pageSize?: number
  configKey?: string
  configName?: string
  configType?: string
  status?: number | null
  editable?: number | null
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

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

export interface ConfigCreateRequest {
  configKey: string
  configValue?: string
  configType: string
  configName: string
  status?: number
  editable?: number
  remark?: string
}

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

export interface ConfigStatusSwitchRequest {
  configId: number
  status: number
}

export interface ConfigBatchDeleteRequest {
  configIds: number[]
}

export function getConfigPage(payload: ConfigPageQuery): Promise<PageResult<ConfigVo>> {
  return httpPost<PageResult<ConfigVo>>(SERVICE.BASE, '/config/page', payload)
}

export function createConfig(payload: ConfigCreateRequest): Promise<ConfigVo> {
  return httpPost<ConfigVo>(SERVICE.BASE, '/config/create', payload)
}

export function updateConfig(payload: ConfigUpdateRequest): Promise<ConfigVo> {
  return httpPut<ConfigVo>(SERVICE.BASE, '/config/update', payload)
}

export function deleteConfigApi(configId: number): Promise<void> {
  return httpDelete<void>(SERVICE.BASE, `/config/${configId}`)
}

export function batchDeleteConfig(payload: ConfigBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/config/batch-delete', payload)
}

export function switchConfigStatus(payload: ConfigStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/config/switch-status', payload)
}


