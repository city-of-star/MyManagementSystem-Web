import { httpPost, httpPut, httpDelete, SERVICE } from '@/utils/http'

export interface RolePageQuery {
  pageNum?: number
  pageSize?: number
  roleCode?: string
  roleName?: string
  roleType?: string
  status?: number | null
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

export interface RoleVo {
  id: number
  roleCode: string
  roleName: string
  roleType?: string
  sortOrder?: number
  status?: number
  remark?: string
}

export interface RoleCreateRequest {
  roleCode: string
  roleName: string
  roleType?: string
  sortOrder?: number
  status?: number
  remark?: string
  permissionIds?: number[]
}

export interface RoleUpdateRequest {
  id: number
  roleCode?: string
  roleName?: string
  roleType?: string
  sortOrder?: number
  status?: number
  remark?: string
  permissionIds?: number[]
}

export interface RoleStatusSwitchRequest {
  roleId: number
  status: number
}

export interface RoleBatchDeleteRequest {
  roleIds: number[]
}

export interface RoleAssignPermissionRequest {
  roleId: number
  permissionIds: number[]
}

export function getRolePage(payload: RolePageQuery): Promise<PageResult<RoleVo>> {
  return httpPost<PageResult<RoleVo>>(SERVICE.USERCENTER, '/role/page', payload)
}

export function createRole(payload: RoleCreateRequest): Promise<RoleVo> {
  return httpPost<RoleVo>(SERVICE.USERCENTER, '/role/create', payload)
}

export function updateRole(payload: RoleUpdateRequest): Promise<RoleVo> {
  return httpPut<RoleVo>(SERVICE.USERCENTER, '/role/update', payload)
}

export function deleteRole(roleId: number): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/role/${roleId}`)
}

export function batchDeleteRole(payload: RoleBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/role/batch-delete', payload)
}

export function switchRoleStatus(payload: RoleStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/role/switch-status', payload)
}

export function assignRolePermissions(payload: RoleAssignPermissionRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/role/assign-permissions', payload)
}


