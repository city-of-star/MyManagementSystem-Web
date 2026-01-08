import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { UserVo } from '@/api/system/user/user'

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

/**
 * 获取角色已分配的权限ID列表
 */
export function getRolePermissionIds(roleId: number): Promise<number[]> {
  return httpGet<number[]>(SERVICE.USERCENTER, `/role/${roleId}/permission-ids`)
}

export interface RoleRemoveUserRequest {
  roleId: number
  userId: number
}

/**
 * 获取角色关联的用户列表
 */
export function getRoleUsers(roleId: number): Promise<UserVo[]> {
  return httpGet<UserVo[]>(SERVICE.USERCENTER, `/role/${roleId}/users`)
}

/**
 * 移除角色的用户关联
 */
export function removeUserFromRole(payload: RoleRemoveUserRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/role/remove-user', payload)
}

