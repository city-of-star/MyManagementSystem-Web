import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types'

// 分页查询请求 DTO
export interface UserPageQuery {
  pageNum?: number
  pageSize?: number
  username?: string
  nickname?: string
  realName?: string
  email?: string
  phone?: string
  status?: number | null
  locked?: number | null
  gender?: number | null
  createTimeStart?: string | null
  createTimeEnd?: string | null
  lastLoginTimeStart?: string | null
  lastLoginTimeEnd?: string | null
  // 所属部门（用于列表筛选）
  deptId?: number | null
  // 所属岗位（用于列表筛选）
  postId?: number | null
}

// 用户信息 VO
export interface UserVo {
  id: number
  username: string
  nickname?: string
  realName?: string
  avatar?: string
  email?: string
  phone?: string
  gender?: number
  birthday?: string
  status?: number
  locked?: number
  lockTime?: string
  lockReason?: string
  lastLoginTime?: string
  lastLoginIp?: string
  passwordUpdateTime?: string
  remark?: string
  createBy?: number
  createTime?: string
  updateBy?: number
  updateTime?: string
  primaryDept?: any
  primaryPost?: any
  depts?: any[]
  posts?: any[]
  primaryDeptId?: number
  primaryPostId?: number
  deptIds?: number[]
  postIds?: number[]
}

// 创建用户请求 DTO
export interface UserCreateRequest {
  username: string
  password: string
  nickname?: string
  realName?: string
  avatar?: string
  email?: string
  phone?: string
  gender?: number
  birthday?: string
  status?: number
  remark?: string
  deptIds?: number[]
  primaryDeptId?: number
  postIds?: number[]
  primaryPostId?: number
}

// 更新用户请求 DTO
export interface UserUpdateRequest {
  id: number
  username?: string
  nickname?: string
  realName?: string
  avatar?: string
  email?: string
  phone?: string
  gender?: number
  birthday?: string
  status?: number
  remark?: string
  primaryDeptId?: number
  primaryPostId?: number
  deptIds?: number[]
  postIds?: number[]
}

// 切换用户状态请求 DTO
export interface UserStatusSwitchRequest {
  userId: number
  status: number
}

// 锁定/解锁用户请求 DTO
export interface UserLockRequest {
  userId: number
  locked: number
  lockReason?: string
}

// 重置用户密码请求 DTO
export interface UserPasswordResetRequest {
  userId: number
}

// 修改密码请求 DTO
export interface UserPasswordChangeRequest {
  oldPassword: string
  newPassword: string
}

// 用户分配角色请求 DTO
export interface UserAssignRoleRequest {
  userId: number
  roleIds: number[]
}

/**
 * 分页查询用户
 */
export function getUserPage(payload: UserPageQuery): Promise<PageResult<UserVo>> {
  return httpPost<PageResult<UserVo>>(SERVICE.USERCENTER, '/user/page', payload)
}

/**
 * 创建用户
 */
export function createUser(payload: UserCreateRequest): Promise<UserVo> {
  return httpPost<UserVo>(SERVICE.USERCENTER, '/user/create', payload)
}

/**
 * 更新用户
 */
export function updateUser(payload: UserUpdateRequest): Promise<UserVo> {
  return httpPut<UserVo>(SERVICE.USERCENTER, '/user/update', payload)
}

/**
 * 删除用户
 */
export function deleteUser(userId: number): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/user/${userId}`)
}

/**
 * 批量删除用户
 */
export function batchDeleteUser(userIds: number[]): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/user/batch-delete', { userIds })
}

/**
 * 切换用户状态
 */
export function switchUserStatus(payload: UserStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/user/switch-status', payload)
}

/**
 * 锁定/解锁用户
 */
export function lockOrUnlockUser(payload: UserLockRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/user/lock', payload)
}

/**
 * 重置用户密码
 */
export function resetUserPassword(payload: UserPasswordResetRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/user/reset-password', payload)
}

/**
 * 修改指定用户密码
 */
export function changeUserPassword(
  userId: number,
  payload: UserPasswordChangeRequest,
): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, `/user/change-password/${userId}`, payload)
}

/**
 * 为用户分配角色
 */
export function assignUserRoles(payload: UserAssignRoleRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/user/assign-roles', payload)
}

/**
 * 获取用户已分配的角色ID列表
 */
export function getUserRoleIds(userId: number): Promise<number[]> {
  return httpGet<number[]>(SERVICE.USERCENTER, `/user/${userId}/role-ids`)
}
