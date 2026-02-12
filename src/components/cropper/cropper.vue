<!--
  通用头像裁剪弹窗组件

  功能：
  - 基于 VuePictureCropper 封装头像裁剪弹窗
  - 支持固定裁剪框、圆形头像（四角透明）
  - 通过 open(rawFile) 打开弹窗并返回裁剪后的 File，与 el-upload 的 before-upload 配合使用

  使用示例：
  <AvatarCropperDialog ref="avatarCropperRef" />
  const avatarCropperRef = ref<{ open: (file: UploadRawFile) => Promise<UploadRawFile> } | null>(null)

  const beforeAvatarUpload = async (rawFile: UploadRawFile) => {
    const valid = await rawBeforeAvatarUpload(rawFile)
    if (!valid || !avatarCropperRef.value) return false
    return avatarCropperRef.value.open(rawFile)
  }
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { UploadRawFile } from 'element-plus'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import { Message } from '@/utils/base/messageUtils.ts'

const visible = ref(false)
const loading = ref(false)
const imgSrc = ref('')

let objectUrl: string | null = null
let resolveFn: ((file: UploadRawFile) => void) | null = null
let rejectFn: ((reason?: any) => void) | null = null

/**
 * 打开裁剪弹窗并返回裁剪后的文件
 */
const open = (rawFile: UploadRawFile) => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }

  objectUrl = URL.createObjectURL(rawFile)
  imgSrc.value = objectUrl
  visible.value = true

  return new Promise<UploadRawFile>((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })
}

/**
 * 确认裁剪
 */
const handleConfirm = async () => {
  if (!cropper) {
    Message.error('裁剪组件未就绪，请重试')
    return
  }

  loading.value = true
  try {
    const size = 256

    const squareCanvas = cropper.getCroppedCanvas({
      width: size,
      height: size,
      imageSmoothingQuality: 'high',
    })

    if (!squareCanvas) {
      Message.error('无法获取裁剪结果')
      return
    }

    const circleCanvas = document.createElement('canvas')
    circleCanvas.width = size
    circleCanvas.height = size
    const ctx = circleCanvas.getContext('2d')

    if (!ctx) {
      Message.error('浏览器不支持 Canvas，请更换浏览器重试')
      return
    }

    ctx.clearRect(0, 0, size, size)
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(squareCanvas, 0, 0, size, size)
    ctx.restore()

    const blob: Blob = await new Promise((resolve, reject) => {
      circleCanvas.toBlob((b) => {
        if (b) {
          resolve(b)
        } else {
          reject(new Error('裁剪失败'))
        }
      }, 'image/png')
    })

    const file = new File([blob], 'avatar.png', { type: 'image/png' })

    visible.value = false
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }

    if (resolveFn) {
      resolveFn(file as UploadRawFile)
      resolveFn = null
      rejectFn = null
    }
  } catch (error) {
    console.error(error)
    Message.error('生成裁剪图片失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 取消裁剪
 */
const handleCancel = () => {
  visible.value = false

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }

  if (rejectFn) {
    rejectFn(new Error('cancel'))
  }

  resolveFn = null
  rejectFn = null
}

defineExpose({
  open,
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="裁剪头像"
    width="480px"
    destroy-on-close
  >
    <VuePictureCropper
      :img="imgSrc"
      :boxStyle="{
        width: '100%',
        height: '320px',
        backgroundColor: '#f7f7f7',
        margin: '0 auto',
      }"
      :autoCrop="true"
      :autoCropWidth="160"
      :autoCropHeight="160"
      :fixed="true"
      :fixedBox="true"
      :centerBox="true"
      :canMoveBox="true"
      :canMove="true"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          确 定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: inline-flex;
  gap: 8px;
}
</style>
