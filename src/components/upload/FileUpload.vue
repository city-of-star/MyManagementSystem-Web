<!--
  附件上传组件

  功能：
  - 基于 Element Plus 的 el-upload 封装
  - 支持多文件上传
  - 支持拖拽上传
  - 显示文件列表、上传进度
  - 支持文件类型限制、大小限制
  - 使用 v-model 绑定附件列表

  使用示例：
  <FileUpload
    v-model="form.attachments"
    :max-size="10"
    :accept="['doc', 'docx', 'pdf', 'txt']"
    upload-url="/api/files/upload"
  />

  属性说明：
  - modelValue: 附件列表（数组）
  - uploadUrl: 上传接口地址（必填）
  - maxSize: 单个文件最大大小（MB，默认 10）
  - maxCount: 最大文件数量（默认不限制）
  - accept: 允许的文件类型（数组，如 ['doc', 'docx', 'pdf']）
  - disabled: 是否禁用
  - showFileList: 是否显示文件列表（默认 true）
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElIcon } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { http } from '@/utils/http'
import type { UploadFile, UploadFiles, UploadProps, UploadRequestOptions } from 'element-plus'

// 附件项类型定义
export interface AttachmentItem {
  id?: string | number
  // 前端展示的文件名（优先使用后端返回的 originalName）
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  // 可选：后端存储用的文件名（如 UUID），方便后续调试/排查
  storedFileName?: string
  uid?: string | number
}

const props = withDefaults(
  defineProps<{
    modelValue?: AttachmentItem[] // 附件列表（数组）
    uploadUrl: string // 上传接口地址（必填）
    maxSize?: number // 单个文件最大大小（MB，默认 10）
    maxCount?: number // 最大文件数量（默认不限制）
    accept?: string[] // 允许的文件类型（数组，如 ['doc', 'docx', 'pdf']）
    disabled?: boolean // 是否禁用
    showFileList?: boolean // 是否显示文件列表（默认 true）
    businessType?: string // 业务类型（可选，对应后端的 businessType）
    businessId?: string | number // 业务ID（可选，对应后端的 businessId）
    remark?: string // 备注（可选，对应后端的 remark）
  }>(),
  {
    modelValue: () => [],
    maxSize: 10,
    maxCount: undefined,
    accept: () => [],
    disabled: false,
    showFileList: true,
    businessType: undefined,
    businessId: undefined,
    remark: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: AttachmentItem[]]
  'upload-success': [file: AttachmentItem]
  'upload-error': [error: Error]
  'remove': [file: AttachmentItem]
}>()

// 文件列表（用于 el-upload）
const fileList = ref<UploadFiles>([])

// 将 modelValue 转换为 el-upload 需要的格式
const initFileList = () => {
  if (!props.modelValue || props.modelValue.length === 0) {
    fileList.value = []
    return
  }

  fileList.value = props.modelValue.map((item, index) => ({
    uid: typeof (item.uid || item.id) === 'number'
      ? (item.uid || item.id) as number
      : Number(item.uid || item.id) || Date.now() + index,
    name: item.fileName,
    url: item.fileUrl,
    status: 'success' as const,
    size: item.fileSize,
  }))
}

// 初始化文件列表
initFileList()

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  () => {
    initFileList()
  },
  { deep: true }
)

// 文件类型限制
const acceptTypes = computed(() => {
  if (!props.accept || props.accept.length === 0) {
    return undefined
  }
  return props.accept.map((type) => `.${type}`).join(',')
})

// 检查文件类型
const checkFileType = (file: File): boolean => {
  if (!props.accept || props.accept.length === 0) {
    return true
  }

  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1)
  return props.accept.some((type) => type.toLowerCase() === fileExtension.toLowerCase())
}

// 检查文件大小
const checkFileSize = (file: File): boolean => {
  const maxSizeBytes = props.maxSize * 1024 * 1024 // 转换为字节
  return file.size <= maxSizeBytes
}

// 检查文件数量
const checkFileCount = (): boolean => {
  if (!props.maxCount) {
    return true
  }
  return fileList.value.length < props.maxCount
}

// 文件上传前的验证
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 检查文件类型
  if (!checkFileType(file)) {
    ElMessage.error(`文件类型不支持，仅支持：${props.accept.join(', ')}`)
    return false
  }

  // 检查文件大小
  if (!checkFileSize(file)) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  // 检查文件数量
  if (!checkFileCount()) {
    ElMessage.error(`最多只能上传 ${props.maxCount} 个文件`)
    return false
  }

  return true
}

// 自定义上传方法
const handleUpload = async (options: UploadRequestOptions) => {
  const { file, onSuccess, onError, onProgress } = options

  try {
    const formData = new FormData()
    // 与后端接口字段对齐：file / businessType / businessId / remark
    formData.append('file', file)
    if (props.businessType) {
      formData.append('businessType', props.businessType)
    }
    if (props.businessId !== undefined && props.businessId !== null) {
      formData.append('businessId', String(props.businessId))
    }
    if (props.remark) {
      formData.append('remark', props.remark)
    }

    // 使用 http 实例上传文件（需要设置 Content-Type 为 multipart/form-data）
    const response = await http.post<{
      code: number
      data: {
        id: string | number
        fileName: string // 存储用文件名（UUID 等）
        originalName?: string // 原始文件名（用于前端展示）
        fileUrl: string
        fileSize: number
        fileType: string
      }
      message: string
    }>(props.uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.({ percent } as any)
        }
      },
    })

    if (response.data.code === 200 && response.data.data) {
      const resp = response.data.data
      // 前端显示用原始文件名，若后端未返回 originalName，则退回 fileName
      const displayName = resp.originalName || resp.fileName

      const attachment: AttachmentItem = {
        id: resp.id,
        fileName: displayName,
        fileUrl: resp.fileUrl,
        fileSize: resp.fileSize,
        fileType: resp.fileType,
        storedFileName: resp.fileName,
      }

      // 更新文件列表
      const newFileList = [...fileList.value]
      const uploadedFile = newFileList.find((f) => f.uid === file.uid)
      if (uploadedFile) {
        uploadedFile.status = 'success'
        uploadedFile.url = attachment.fileUrl
      }

      // 更新 modelValue
      const newAttachments = [...(props.modelValue || []), attachment]
      emit('update:modelValue', newAttachments)
      emit('upload-success', attachment)

      onSuccess?.(response.data.data as any)
      ElMessage.success('文件上传成功')
    } else {
      throw new Error(response.data.message || '上传失败')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '上传失败'
    ElMessage.error(errorMessage)
    emit('upload-error', error)
    onError?.(error)
  }
}

// 文件移除
const handleRemove = (file: UploadFile) => {
  const attachment = props.modelValue?.find(
    (item) => (item.uid || item.id) === file.uid || item.fileName === file.name
  )

  if (attachment) {
    const newAttachments = props.modelValue?.filter(
      (item) => (item.uid || item.id) !== (attachment.uid || attachment.id)
    ) || []
    emit('update:modelValue', newAttachments)
    emit('remove', attachment)
  }
}

// 文件超出数量限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.maxCount} 个文件`)
}

// 格式化文件大小
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>

<template>
  <div class="file-upload">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :before-upload="beforeUpload"
      :http-request="handleUpload"
      :accept="acceptTypes"
      :disabled="disabled"
      :limit="maxCount"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :show-file-list="showFileList"
      drag
      multiple
      class="file-upload__container"
    >
      <el-icon class="el-icon--upload">
        <UploadFilled />
      </el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          <div v-if="accept && accept.length > 0">
            支持的文件类型：{{ accept.join(', ') }}
          </div>
          <div>单个文件大小不超过 {{ maxSize }}MB</div>
          <div v-if="maxCount">最多上传 {{ maxCount }} 个文件</div>
        </div>
      </template>
    </el-upload>

    <!-- 文件列表（自定义样式） -->
    <div v-if="showFileList && fileList.length > 0" class="file-upload__list">
      <div
        v-for="file in fileList"
        :key="file.uid"
        class="file-upload__item"
      >
        <el-icon class="file-upload__icon">
          <Document />
        </el-icon>
        <div class="file-upload__info">
          <div class="file-upload__name" :title="file.name">{{ file.name }}</div>
          <div class="file-upload__size">{{ formatFileSize(file.size) }}</div>
        </div>
        <el-button
          v-if="!disabled"
          link
          type="danger"
          size="small"
          @click="handleRemove(file)"
        >
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-upload {
  width: 100%;
}

.file-upload__container {
  width: 100%;
}

.file-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
  line-height: 1.5;
}

.file-upload__list {
  margin-top: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.file-upload__item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-upload__item:last-child {
  margin-bottom: 0;
}

.file-upload__icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.file-upload__info {
  flex: 1;
  min-width: 0;
}

.file-upload__name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-upload__size {
  font-size: 12px;
  color: #909399;
}
</style>
