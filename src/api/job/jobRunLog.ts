import { httpPost, httpGet, httpDelete, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types.ts'

// 分页查询请求 DTO
export interface JobRunLogPageQuery {
  pageNum?: number
  pageSize?: number
  jobId?: string | number | null
  runId?: string
  status?: string | null
  startTimeStart?: string | null
  startTimeEnd?: string | null
}

// 定时任务执行记录 VO
export interface JobRunLogVo {
  id: string
  jobId: string
  jobName?: string
  runId: string
  status: string
  startTime?: string
  endTime?: string
  durationMs?: number
  instanceId?: string
  host?: string
  errorMessage?: string
  errorStack?: string
  resultJson?: string
  createTime?: string
  updateTime?: string
}

// 批量删除请求 DTO
export interface JobRunLogBatchDeleteRequest {
  logIds: string[]
}

/**
 * 分页查询定时任务执行记录
 */
export function getJobRunLogPage(payload: JobRunLogPageQuery): Promise<PageResult<JobRunLogVo>> {
  return httpPost<PageResult<JobRunLogVo>>(SERVICE.JOB, '/job/run-log/page', payload)
}

/**
 * 根据 ID 查询定时任务执行记录详情
 */
export function getJobRunLogById(logId: string): Promise<JobRunLogVo> {
  return httpGet<JobRunLogVo>(SERVICE.JOB, `/job/run-log/${logId}`)
}

/**
 * 删除单条定时任务执行记录
 */
export function deleteJobRunLog(logId: string): Promise<void> {
  return httpDelete<void>(SERVICE.JOB, `/job/run-log/${logId}`)
}

/**
 * 批量删除定时任务执行记录
 */
export function batchDeleteJobRunLog(payload: JobRunLogBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.JOB, '/job/run-log/batch-delete', payload)
}

/**
 * 导出定时任务执行记录（暂未实现，后端会抛出未实现异常）
 */
export function exportJobRunLog(payload: JobRunLogPageQuery): Promise<void> {
  return httpPost<void>(SERVICE.JOB, '/job/run-log/export', payload)
}

/**
 * 重试执行定时任务（暂未实现，后端会抛出未实现异常）
 */
export function retryJobRun(logId: string): Promise<void> {
  return httpPost<void>(SERVICE.JOB, `/job/run-log/${logId}/retry`, {})
}

/**
 * 终止执行定时任务（暂未实现，后端会抛出未实现异常）
 */
export function terminateJobRun(logId: string): Promise<void> {
  return httpPost<void>(SERVICE.JOB, `/job/run-log/${logId}/terminate`, {})
}

