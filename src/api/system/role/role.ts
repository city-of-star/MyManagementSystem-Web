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

export interface RoleRemoveUserRequest {
  roleId: number
  userId: number
}

/**
 * 分页查询角色列表
 */
export function getRolePage(payload: RolePageQuery): Promise<PageResult<RoleVo>> {
  return httpPost<PageResult<RoleVo>>(SERVICE.USERCENTER, '/role/page', payload)
}

/**
 * 创建角色
 */
export function createRole(payload: RoleCreateRequest): Promise<RoleVo> {
  return httpPost<RoleVo>(SERVICE.USERCENTER, '/role/create', payload)
}

/**
 * 更新角色
 */
export function updateRole(payload: RoleUpdateRequest): Promise<RoleVo> {
  return httpPut<RoleVo>(SERVICE.USERCENTER, '/role/update', payload)
}

/**
 * 删除角色
 */
export function deleteRole(roleId: number): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/role/${roleId}`)
}

/**
 * 批量删除角色
 */
export function batchDeleteRole(payload: RoleBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/role/batch-delete', payload)
}

/**
 * 切换角色状态
 */
export function switchRoleStatus(payload: RoleStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/role/switch-status', payload)
}

/**
 * 给指定角色分配权限（覆盖）
 */
export function assignRolePermissions(payload: RoleAssignPermissionRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/role/assign-permissions', payload)
}

/**
 * 获取角色已分配的权限ID列表
 */
export function getRolePermissionIds(roleId: number): Promise<number[]> {
  return httpGet<number[]>(SERVICE.USERCENTER, `/role/${roleId}/permission-ids`)
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

