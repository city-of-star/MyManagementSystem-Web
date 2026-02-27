import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types.ts'

// 分页查询请求 DTO
export interface JobPageQuery {
  pageNum?: number
  pageSize?: number
  serviceName?: string
  jobCode?: string
  jobName?: string
  jobType?: string,
  enabled?: number | null
  createTimeStart?: string | null
  createTimeEnd?: string | null
}

// 定时任务分页 VO / 详情 VO
export interface JobVo {
  id: string
  serviceName: string
  jobCode: string
  jobName: string
  jobType: string
  cronExpr: string
  runMode: string
  enabled: number
  timeoutMs: number
  remark?: string
  paramsJson?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

// 创建定时任务请求 DTO
export interface JobCreateRequest {
  serviceName: string
  jobCode: string
  jobName: string
  jobType: string
  cronExpr: string
  runMode: string
  enabled?: number
  timeoutMs?: number
  remark?: string
  paramsJson?: string
}

// 更新定时任务请求 DTO
export interface JobUpdateRequest {
  id: string
  serviceName?: string
  jobName?: string
  jobType?: string
  cronExpr?: string
  runMode?: string
  enabled?: number
  timeoutMs?: number
  remark?: string
  paramsJson?: string
}

// 切换启用状态请求 DTO
export interface JobStatusSwitchRequest {
  jobId: string
  enabled: number
}

// 批量删除请求 DTO
export interface JobBatchDeleteRequest {
  jobIds: string[]
}

/**
 * 分页查询定时任务
 */
export function getJobPage(payload: JobPageQuery): Promise<PageResult<JobVo>> {
  return httpPost<PageResult<JobVo>>(SERVICE.JOB, '/job/page', payload)
}

/**
 * 根据 ID 查询定时任务详情
 */
export function getJobById(jobId: string): Promise<JobVo> {
  return httpGet<JobVo>(SERVICE.JOB, `/job/${jobId}`)
}

/**
 * 创建定时任务
 */
export function createJob(payload: JobCreateRequest): Promise<JobVo> {
  return httpPost<JobVo>(SERVICE.JOB, '/job/create', payload)
}

/**
 * 更新定时任务
 */
export function updateJob(payload: JobUpdateRequest): Promise<JobVo> {
  return httpPut<JobVo>(SERVICE.JOB, '/job/update', payload)
}

/**
 * 删除定时任务
 */
export function deleteJob(jobId: string): Promise<void> {
  return httpDelete<void>(SERVICE.JOB, `/job/${jobId}`)
}

/**
 * 批量删除定时任务
 */
export function batchDeleteJob(payload: JobBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.JOB, '/job/batch-delete', payload)
}

/**
 * 切换定时任务启用状态
 */
export function switchJobStatus(payload: JobStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.JOB, '/job/switch-status', payload)
}

