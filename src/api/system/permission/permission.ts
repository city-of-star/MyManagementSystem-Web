import { httpGet, httpPost, httpPut, httpDelete, SERVICE } from '@/utils/http'
import type { RoleVo } from '@/api/system/role/role'
import type { PageResult } from '@/api/common/types'

// 分页查询请求 DTO
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

// 权限信息 VO
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

// 创建权限请求 DTO
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

// 更新权限请求 DTO
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

// 切换权限状态请求 DTO
export interface PermissionStatusSwitchRequest {
  permissionId: number
  status: number
}

// 批量删除权限请求 DTO
export interface PermissionBatchDeleteRequest {
  permissionIds: number[]
}

// 权限移除角色请求 DTO
export interface PermissionRemoveRoleRequest {
  permissionId: number
  roleId: number
}

// 权限树 VO（扩展 PermissionVo 以支持 children）
export interface PermissionTreeVo extends PermissionVo {
  children?: PermissionTreeVo[]
}

/**
 * 分页查询权限列表
 */
export function getPermissionPage(payload: PermissionPageQuery): Promise<PageResult<PermissionVo>> {
  return httpPost<PageResult<PermissionVo>>(SERVICE.USERCENTER, '/permission/page', payload)
}

/**
 * 创建权限
 */
export function createPermission(payload: PermissionCreateRequest): Promise<PermissionVo> {
  return httpPost<PermissionVo>(SERVICE.USERCENTER, '/permission/create', payload)
}

/**
 * 更新权限
 */
export function updatePermission(payload: PermissionUpdateRequest): Promise<PermissionVo> {
  return httpPut<PermissionVo>(SERVICE.USERCENTER, '/permission/update', payload)
}

/**
 * 删除权限
 */
export function deletePermission(permissionId: number): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/permission/${permissionId}`)
}

/**
 * 批量删除权限
 */
export function batchDeletePermission(payload: PermissionBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/permission/batch-delete', payload)
}

/**
 * 切换权限状态
 */
export function switchPermissionStatus(payload: PermissionStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/permission/switch-status', payload)
}

/**
 * 获取权限关联的角色列表
 */
export function getPermissionRoles(permissionId: number): Promise<RoleVo[]> {
  return httpGet<RoleVo[]>(SERVICE.USERCENTER, `/permission/${permissionId}/roles`)
}

/**
 * 移除权限与角色的关联
 */
export function removeRoleFromPermission(payload: PermissionRemoveRoleRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/permission/remove-role', payload)
}

/**
 * 获取权限树（全量，用于管理场景如角色分配）
 */
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

/**
 * 获取当前用户的权限树（用于前端菜单展示）
 * 后端固定返回：启用、可见、目录或菜单类型的权限
 */
export function getCurrentUserPermissionTree(): Promise<PermissionTreeVo[]> {
  return httpGet<PermissionTreeVo[]>(SERVICE.USERCENTER, '/permission/tree/current-user')
}


