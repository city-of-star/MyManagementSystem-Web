<!--
  通用弹窗组件

  功能：
  - 封装 el-dialog，提供统一的 footer（取消/确定）
  - 支持 v-model
  - 支持内容区域 loading（用于列表/表单加载）
  - 透传 el-dialog 其余属性与事件（v-bind="$attrs"）

  使用示例：
  <BaseDialog v-model="visible" title="新增" width="560px" @confirm="handleSubmit">
    <el-form>...</el-form>
  </BaseDialog>
-->
<script setup lang="ts">
type Width = string | number

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    width?: Width
    loading?: boolean
    destroyOnClose?: boolean
    showFooter?: boolean
    cancelText?: string
    confirmText?: string
    confirmLoading?: boolean
    closeOnClickModal?: boolean
  }>(),
  {
    title: '',
    width: '560px',
    loading: false,
    destroyOnClose: true,
    showFooter: true,
    cancelText: '取 消',
    confirmText: '确 定',
    confirmLoading: false,
    closeOnClickModal: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  cancel: []
  confirm: []
}>()

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    :title="props.title"
    :width="props.width"
    :destroy-on-close="props.destroyOnClose"
    :close-on-click-modal="props.closeOnClickModal"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
    v-bind="$attrs"
  >
    <div v-loading="props.loading">
      <slot />
    </div>

    <template v-if="props.showFooter" #footer>
      <slot name="footer">
        <span class="dialog-footer">
          <el-button @click="handleCancel">{{ props.cancelText }}</el-button>
          <el-button type="primary" :loading="props.confirmLoading" @click="handleConfirm">
            {{ props.confirmText }}
          </el-button>
        </span>
      </slot>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

