import { httpGet, httpPost, httpPut, httpDelete, SERVICE } from '@/utils/http'
import type { RoleVo } from '@/api/system/role/role'

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

// 扩展 PermissionVo 以支持 children
export interface PermissionTreeVo extends PermissionVo {
  children?: PermissionTreeVo[]
}

// 获取权限树（全量，用于管理场景如角色分配）
export function getPermissionTree(params?: {
  permissionType?: string
  status?: number
  visible?: number
}): Promise<PermissionTreeVo[]> {
  const queryParams: Record<string, unknown> = {}
  if (params?.permissionType) queryParams.permissionType = params.permissionType
  if (params?.status !== undefined) queryParams.status = params.status
  if (params?.visible !== undefined) queryParams.visible = params.visible
  
  return httpGet<PermissionTreeVo[]>(SERVICE.USERCENTER, '/permission/tree', Object.keys(queryParams).length > 0 ? queryParams : undefined)
}

// 获取当前用户的权限树（用于前端菜单展示）
export function getCurrentUserPermissionTree(params?: {
  permissionType?: string
  status?: number
  visible?: number
}): Promise<PermissionTreeVo[]> {
  const queryParams: Record<string, unknown> = {}
  if (params?.permissionType) queryParams.permissionType = params.permissionType
  if (params?.status !== undefined) queryParams.status = params.status
  if (params?.visible !== undefined) queryParams.visible = params.visible
  
  return httpGet<PermissionTreeVo[]>(SERVICE.USERCENTER, '/permission/tree/current-user', Object.keys(queryParams).length > 0 ? queryParams : undefined)
}

/**
 * 获取权限关联的角色列表
 */
export function getPermissionRoles(permissionId: number): Promise<RoleVo[]> {
  return httpGet<RoleVo[]>(SERVICE.USERCENTER, `/permission/${permissionId}/roles`)
}

export interface PermissionRemoveRoleRequest {
  permissionId: number
  roleId: number
}

/**
 * 移除权限与角色的关联
 */
export function removeRoleFromPermission(payload: PermissionRemoveRoleRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/permission/remove-role', payload)
}


