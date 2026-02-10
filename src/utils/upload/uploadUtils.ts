/**
 * 文件上传工具函数
 *
 * 提供通用的文件上传功能封装，包括：
 * - 文件校验（大小、类型）
 * - FormData 构建
 * - 上传进度回调
 * - 错误处理
 */

import type { UploadRequestOptions } from 'element-plus'
import { Message } from "@/utils/base/messageUtils.ts";

/**
 * 文件校验规则
 */
export interface FileValidateRule {
  /** 允许的文件类型（MIME 类型或扩展名），如 'image/*' 或 ['image/jpeg', 'image/png'] */
  accept?: string | string[]
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 最小文件大小（MB） */
  minSize?: number
  /** 自定义校验函数 */
  validator?: (file: File) => boolean | string
}

/**
 * 文件上传选项
 */
export interface UploadOptions {
  /** 文件对象 */
  file: File
  /** 业务类型 */
  businessType?: string
  /** 业务ID */
  businessId?: number | string
  /** 备注 */
  remark?: string
  /** 上传进度回调 */
  onProgress?: (percent: number) => void
}

/**
 * 校验文件是否符合规则
 * @param file 文件对象
 * @param rule 校验规则
 * @returns 校验通过返回 true，失败返回错误信息
 */
export function validateFile(file: File, rule: FileValidateRule): true | string {
  // 类型校验
  if (rule.accept) {
    const accepts = Array.isArray(rule.accept) ? rule.accept : [rule.accept]
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    const isValidType = accepts.some(accept => {
      if (accept.includes('/*')) {
        // 支持通配符，如 'image/*'
        const baseType = accept.split('/')[0]
        return fileType.startsWith(baseType + '/')
      } else if (accept.startsWith('.')) {
        // 扩展名匹配，如 '.jpg'
        return fileName.endsWith(accept.toLowerCase())
      } else {
        // 精确 MIME 类型匹配
        return fileType === accept
      }
    })

    if (!isValidType) {
      return `文件类型不支持，仅支持：${accepts.join('、')}`
    }
  }

  // 大小校验
  const fileSizeMB = file.size / 1024 / 1024

  if (rule.maxSize !== undefined && fileSizeMB > rule.maxSize) {
    return `文件大小不能超过 ${rule.maxSize}MB`
  }

  if (rule.minSize !== undefined && fileSizeMB < rule.minSize) {
    return `文件大小不能小于 ${rule.minSize}MB`
  }

  // 自定义校验
  if (rule.validator) {
    const result = rule.validator(file)
    if (result !== true) {
      return typeof result === 'string' ? result : '文件校验失败'
    }
  }

  return true
}

/**
 * 构建文件上传的 FormData
 * @param options 上传选项
 * @returns FormData 对象
 */
export function buildUploadFormData(options: UploadOptions): FormData {
  const { file, businessType, businessId, remark } = options
  const formData = new FormData()
  // 添加文件
  formData.append('file', file)
  // 添加业务相关字段
  if (businessType) {
    formData.append('businessType', businessType)
  }
  if (businessId !== undefined && businessId !== null) {
    formData.append('businessId', String(businessId))
  }
  if (remark) {
    formData.append('remark', remark)
  }
  return formData
}

/**
 * Element Plus Upload 组件的 beforeUpload 校验函数生成器
 * @param rule 校验规则
 * @param errorMessage 是否显示错误提示（默认 true）
 * @returns beforeUpload 函数
 */
export function createBeforeUploadValidator(
  rule: FileValidateRule,
  errorMessage: boolean = true
) {
  return (file: File): boolean => {
    const result = validateFile(file, rule)
    if (result !== true) {
      if (errorMessage) {
        Message.error(result)
      }
      return false
    }
    return true
  }
}

/**
 * Element Plus Upload 组件的 http-request 函数生成器
 * @param uploadFn 上传函数，接收 FormData 并返回 Promise
 * @param options 上传选项（部分字段会从 UploadRequestOptions 中获取）
 * @returns http-request 函数
 */
export function createUploadRequest<T = any>(
  uploadFn: (formData: FormData, onProgress?: (percent: number) => void) => Promise<T>,
  options?: {
    businessType?: string | (() => string | undefined)
    businessId?: number | string | (() => number | string | undefined)
    remark?: string | ((file: File) => string)
  }
) {
  return async (uploadOptions: UploadRequestOptions): Promise<void> => {
    const { file, onError, onSuccess, onProgress } = uploadOptions

    try {
      // 动态获取业务类型（支持函数形式）
      const businessType = typeof options?.businessType === 'function'
        ? options.businessType()
        : options?.businessType
      // 动态获取业务ID（支持函数形式）
      const businessId = typeof options?.businessId === 'function'
        ? options.businessId()
        : options?.businessId
      // 动态获取备注（支持函数形式）
      const remark = typeof options?.remark === 'function'
        ? options.remark(file)
        : options?.remark
      // 构建 FormData
      const formData = buildUploadFormData({
        file,
        businessType,
        businessId,
        remark,
      })
      // 上传进度回调包装
      let uploadProgress: ((percent: number) => void) | undefined
      if (onProgress) {
        uploadProgress = (percent: number) => {
          onProgress({ percent } as any)
        }
      }
      // 执行上传
      const result = await uploadFn(formData, uploadProgress)
      // 成功回调
      onSuccess?.(result as any)
    } catch (error: any) {
      // 错误回调
      onError?.(error as any)
      throw error
    }
  }
}
