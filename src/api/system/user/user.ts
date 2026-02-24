import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types'
import type { DeptVo } from '@/api/system/dept/dept.ts'
import type { PostVo } from '@/api/system/post/post.ts'

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
  deptId?: string | null
  postId?: string | null
}

// 用户分页 VO
export interface UserPageVo {
  id: string
  username: string
  nickname?: string
  realName?: string
  gender?: number
  phone?: string
  email?: string
  primaryDeptName?: string
  primaryPostName?: string
  status?: number
  locked?: number
  lastLoginTime?: string
  createTime?: string
  remark?: string
}

// 用户详情 VO
export interface UserDetailVo {
  id: string
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
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  primaryDept?: DeptVo | null
  primaryPost?: PostVo | null
  depts?: DeptVo[]
  posts?: PostVo[]
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
  deptIds?: string[]
  primaryDeptId?: string
  postIds?: string[]
  primaryPostId?: string
}

// 更新用户请求 DTO
export interface UserUpdateRequest {
  id: string
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
  primaryDeptId?: string
  primaryPostId?: string
  deptIds?: string[]
  postIds?: string[]
}

// 切换用户状态请求 DTO
export interface UserStatusSwitchRequest {
  userId: string
  status: number
}

// 锁定/解锁用户请求 DTO
export interface UserLockRequest {
  userId: string
  locked: number
  lockReason?: string
}

// 重置用户密码请求 DTO
export interface UserPasswordResetRequest {
  userId: string
}

// 修改密码请求 DTO
export interface UserPasswordChangeRequest {
  oldPassword: string
  newPassword: string
}

// 用户分配角色请求 DTO
export interface UserAssignRoleRequest {
  userId: string
  roleIds: string[]
}

/**
 * 分页查询用户
 */
export function getUserPage(payload: UserPageQuery): Promise<PageResult<UserPageVo>> {
  return httpPost<PageResult<UserPageVo>>(SERVICE.USERCENTER, '/user/page', payload)
}

/**
 * 创建用户
 */
export function createUser(payload: UserCreateRequest): Promise<UserDetailVo> {
  return httpPost<UserDetailVo>(SERVICE.USERCENTER, '/user/create', payload)
}

/**
 * 更新用户
 */
export function updateUser(payload: UserUpdateRequest): Promise<UserDetailVo> {
  return httpPut<UserDetailVo>(SERVICE.USERCENTER, '/user/update', payload)
}

/**
 * 删除用户
 */
export function deleteUser(userId: string): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/user/${userId}`)
}

/**
 * 批量删除用户
 */
export function batchDeleteUser(userIds: string[]): Promise<void> {
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
export function changeUserPassword(payload: UserPasswordChangeRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, `/user/change-password`, payload)
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
export function getUserRoleIds(userId: string): Promise<string[]> {
  return httpGet<string[]>(SERVICE.USERCENTER, `/user/${userId}/role-ids`)
}
