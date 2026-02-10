# 文件上传工具模块

提供通用的文件上传功能封装，简化文件上传的开发工作。

## 📁 文件结构

```
upload/
├── uploadUtils.ts    # 文件上传工具函数
└── README.md         # 使用文档（本文件）
```

## 🎯 功能特性

1. **文件校验**：支持类型、大小校验
2. **FormData 构建**：自动构建上传所需的 FormData
3. **Element Plus 集成**：提供便捷的组件适配函数
4. **进度回调**：支持上传进度监控
5. **类型安全**：完整的 TypeScript 类型定义

## 📖 使用示例（头像上传）

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user/user'
import { updateUser } from '@/api/system/user/user'
import { uploadAttachmentWithProgress } from '@/api/attachment/attachment'
import { createBeforeUploadValidator, createUploadRequest } from '@/utils/upload/uploadUtils'
import { Message } from '@/utils/base/messageUtils'

const userStore = useUserStore()
const user = computed(() => userStore)

// 头像上传前校验
const beforeAvatarUpload = createBeforeUploadValidator({
  accept: 'image/*', // 允许的文件类型
  maxSize: 5, // 允许的文件最大大小（MB）
  validator: (file) => { // 自定义规则
    // 例如再加一个“文件名不能包含空格”的自定义规则
    if (file.name.includes(' ')) {
      return '文件名不能包含空格'
    }
    // 所有自定义规则都通过时，返回 true
    return true
  },
})

// 头像上传处理
const handleAvatarUpload = createUploadRequest(
  // 上传函数：处理实际的上传逻辑
  async (formData, onProgress) => {
    // 校验用户信息
    if (!user.value.id) {
      throw new Error('当前用户信息异常，请重新登录后重试')
    }

    // 调用附件上传 API（支持进度回调）
    const attachment = await uploadAttachmentWithProgress(formData, onProgress)
    const avatarUrl = attachment.fileUrl

    // 更新后端用户头像
    await updateUser({
      id: user.value.id,
      avatar: avatarUrl,
    })

    // 更新前端用户状态
    userStore.setUser({ avatar: avatarUrl })
    Message.success('头像更新成功')

    // 返回附件信息
    return attachment
  },
  // 上传选项：自动构建 FormData 的字段
  {
    businessType: 'USER_AVATAR', // 业务类型
    businessId: () => user.value.id, // 关联业务ID
    remark: '用户头像', // 备注
  }
)
</script>

<template>
  <el-upload
    class="avatar-uploader"
    :show-file-list="false"
    :http-request="handleAvatarUpload"
    :before-upload="beforeAvatarUpload"
    accept="image/*"
  >
    <img v-if="user.avatar" :src="user.avatar" class="avatar" />
    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
  </el-upload>
</template>
```
