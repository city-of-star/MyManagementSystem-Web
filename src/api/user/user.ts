import { httpPost, httpPut, httpDelete, SERVICE } from '@/utils/http'

// 分页查询请求 DTO（与后端 UserPageQueryDto 字段对齐，日期用字符串承载）
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
}

// 后端使用 MyBatis-Plus Page，前端只关心这几个字段
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

// 用户信息 VO（与后端 UserVo 字段对齐，时间字段统一用字符串）
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
}

// 切换状态
export interface UserStatusSwitchRequest {
  userId: number
  status: number
}

// 锁定/解锁
export interface UserLockRequest {
  userId: number
  locked: number
  lockReason?: string
}

// 重置密码
export interface UserPasswordResetRequest {
  userId: number
  newPassword: string
}

// 修改密码（当前页面主要用于管理员操作，留接口备用）
export interface UserPasswordChangeRequest {
  oldPassword: string
  newPassword: string
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


