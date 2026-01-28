import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types.ts'

// 部门分页查询请求 DTO
export interface DeptPageQuery {
  pageNum?: number
  pageSize?: number
  deptName?: string
  deptCode?: string
  parentId?: number
  status?: number | null
  createTimeStart?: string | null
  createTimeEnd?: string | null
}

// 部门树查询请求 DTO（非分页）
export interface DeptTreeQuery {
  deptName?: string
  deptCode?: string
  status?: number | null
}

// 部门信息 VO
export interface DeptVo {
  id: number
  parentId?: number
  deptName: string
  deptCode: string
  leader?: string
  phone?: string
  email?: string
  sortOrder?: number
  status?: number
  remark?: string
  createBy?: number
  createTime?: string
  updateBy?: number
  updateTime?: string
  children?: DeptVo[]
}

// 创建部门请求 DTO
export interface DeptCreateRequest {
  parentId?: number
  deptName: string
  deptCode: string
  leader?: string
  phone?: string
  email?: string
  sortOrder?: number
  status?: number
  remark?: string
}

// 更新部门请求 DTO
export interface DeptUpdateRequest {
  id: number
  parentId?: number
  deptName?: string
  deptCode?: string
  leader?: string
  phone?: string
  email?: string
  sortOrder?: number
  status?: number
  remark?: string
}

// 部门状态切换请求 DTO
export interface DeptStatusSwitchRequest {
  deptId: number
  status: number
}

// 批量删除部门请求 DTO
export interface DeptBatchDeleteRequest {
  deptIds: number[]
}

/**
 * 分页查询部门
 */
export function getDeptPage(payload: DeptPageQuery): Promise<PageResult<DeptVo>> {
  return httpPost<PageResult<DeptVo>>(SERVICE.USERCENTER, '/dept/page', payload)
}

/**
 * 查询部门树（全量）
 */
export function getDeptTree(payload: DeptTreeQuery = {}): Promise<DeptVo[]> {
  return httpPost<DeptVo[]>(SERVICE.USERCENTER, '/dept/tree', payload)
}

/**
 * 根据ID查询部门详情
 */
export function getDeptById(deptId: number): Promise<DeptVo> {
  return httpGet<DeptVo>(SERVICE.USERCENTER, `/dept/${deptId}`)
}

/**
 * 创建部门
 */
export function createDept(payload: DeptCreateRequest): Promise<DeptVo> {
  return httpPost<DeptVo>(SERVICE.USERCENTER, '/dept/create', payload)
}

/**
 * 更新部门
 */
export function updateDept(payload: DeptUpdateRequest): Promise<DeptVo> {
  return httpPut<DeptVo>(SERVICE.USERCENTER, '/dept/update', payload)
}

/**
 * 删除部门
 */
export function deleteDept(deptId: number): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/dept/${deptId}`)
}

/**
 * 批量删除部门
 */
export function batchDeleteDept(payload: DeptBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/dept/batch-delete', payload)
}

/**
 * 切换部门状态
 */
export function switchDeptStatus(payload: DeptStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/dept/switch-status', payload)
}

