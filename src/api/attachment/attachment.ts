import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types'

// 附件分页查询请求 DTO
export interface AttachmentPageQuery {
  pageNum?: number
  pageSize?: number
  fileName?: string
  originalName?: string
  fileType?: string
  businessType?: string
  businessId?: number | null
  status?: number | null
  createTimeStart?: string | null
  createTimeEnd?: string | null
}

// 附件分页 VO
export interface AttachmentPageVo {
  id: number
  fileName: string
  originalName: string
  filePath: string
  fileUrl: string
  fileSize: number
  fileType: string
  mimeType: string
  storageType: string
  businessType?: string
  businessId?: number | null
  status?: number
  remark?: string
  createTime?: string
  updateTime?: string
}

// 附件详情 VO（目前与分页结构一致，预留扩展字段）
export type AttachmentDetailVo = AttachmentPageVo

// 创建附件记录（元数据）请求 DTO
export interface AttachmentCreateRequest {
  fileName: string
  originalName: string
  filePath: string
  fileUrl: string
  fileSize: number
  fileType: string
  mimeType: string
  storageType?: string
  businessType?: string
  businessId?: number | null
  status?: number
  remark?: string
}

// 更新附件请求 DTO
export interface AttachmentUpdateRequest {
  id: number
  businessType?: string
  businessId?: number | null
  remark?: string
}

// 批量删除附件请求 DTO
export interface AttachmentBatchDeleteRequest {
  ids: number[]
}

// 切换附件状态请求 DTO
export interface AttachmentStatusSwitchRequest {
  id: number
  status: number
}

/**
 * 分页查询附件
 */
export function getAttachmentPage(payload: AttachmentPageQuery): Promise<PageResult<AttachmentPageVo>> {
  return httpPost<PageResult<AttachmentPageVo>>(SERVICE.BASE, '/attachment/page', payload)
}

/**
 * 根据ID查询附件详情
 */
export function getAttachmentById(attachmentId: number): Promise<AttachmentDetailVo> {
  return httpGet<AttachmentDetailVo>(SERVICE.BASE, `/attachment/${attachmentId}`)
}

/**
 * 创建附件记录（元数据）
 */
export function createAttachment(payload: AttachmentCreateRequest): Promise<AttachmentDetailVo> {
  return httpPost<AttachmentDetailVo>(SERVICE.BASE, '/attachment/create', payload)
}

/**
 * 更新附件信息
 */
export function updateAttachment(payload: AttachmentUpdateRequest): Promise<AttachmentDetailVo> {
  return httpPut<AttachmentDetailVo>(SERVICE.BASE, '/attachment/update', payload)
}

/**
 * 删除附件（逻辑删除）
 */
export function deleteAttachment(attachmentId: number): Promise<void> {
  return httpDelete<void>(SERVICE.BASE, `/attachment/${attachmentId}`)
}

/**
 * 批量删除附件（逻辑删除）
 */
export function batchDeleteAttachment(payload: AttachmentBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/attachment/batch-delete', payload)
}

/**
 * 切换附件状态
 */
export function switchAttachmentStatus(payload: AttachmentStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/attachment/switch-status', payload)
}

/**
 * 上传附件（基础方法，直接接收 FormData）
 * @param formData FormData 对象
 * @returns 附件详情
 */
export function uploadAttachment(formData: FormData): Promise<AttachmentDetailVo> {
  return httpPost<AttachmentDetailVo>(
    SERVICE.BASE,
    '/attachment/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
}

/**
 * 上传附件（增强方法，支持进度回调）
 * @param formData FormData 对象
 * @param onProgress 上传进度回调（0-100）
 * @returns 附件详情
 */
export function uploadAttachmentWithProgress(
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<AttachmentDetailVo> {
  return httpPost<AttachmentDetailVo>(
    SERVICE.BASE,
    '/attachment/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    }
  )
}

