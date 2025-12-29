import { httpPost, httpPut, httpDelete, SERVICE } from '@/utils/http'

export interface PermissionPageQuery {
  pageNum?: number
  pageSize?: number
  parentId?: number
  permissionType?: string
  permissionName?: string
  permissionCode?: string
  status?: number | null
  visible?: number | null
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

export interface PermissionVo {
  id: number
  parentId?: number
  permissionType: string
  permissionName: string
  permissionCode: string
  path?: string
  component?: string
  icon?: string
  apiUrl?: string
  apiMethod?: string
  sortOrder?: number
  visible?: number
  status?: number
  remark?: string
}

export interface PermissionCreateRequest {
  parentId?: number
  permissionType: string
  permissionName: string
  permissionCode: string
  path?: string
  component?: string
  icon?: string
  apiUrl?: string
  apiMethod?: string
  sortOrder?: number
  visible?: number
  status?: number
  remark?: string
}

export interface PermissionUpdateRequest {
  id: number
  parentId?: number
  permissionType?: string
  permissionName?: string
  permissionCode?: string
  path?: string
  component?: string
  icon?: string
  apiUrl?: string
  apiMethod?: string
  sortOrder?: number
  visible?: number
  status?: number
  remark?: string
}

export interface PermissionStatusSwitchRequest {
  permissionId: number
  status: number
}

export interface PermissionBatchDeleteRequest {
  permissionIds: number[]
}

export function getPermissionPage(payload: PermissionPageQuery): Promise<PageResult<PermissionVo>> {
  return httpPost<PageResult<PermissionVo>>(SERVICE.USERCENTER, '/permission/page', payload)
}

export function createPermission(payload: PermissionCreateRequest): Promise<PermissionVo> {
  return httpPost<PermissionVo>(SERVICE.USERCENTER, '/permission/create', payload)
}

export function updatePermission(payload: PermissionUpdateRequest): Promise<PermissionVo> {
  return httpPut<PermissionVo>(SERVICE.USERCENTER, '/permission/update', payload)
}

export function deletePermission(permissionId: number): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/permission/${permissionId}`)
}

export function batchDeletePermission(payload: PermissionBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/permission/batch-delete', payload)
}

export function switchPermissionStatus(payload: PermissionStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/permission/switch-status', payload)
}


