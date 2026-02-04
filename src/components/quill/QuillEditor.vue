<!--
  通用富文本编辑器组件
  - 基于 @vueup/vue-quill 封装
  - 统一 toolbar 配置、主题、常用属性
  - 对外使用 v-model 进行双向绑定

  使用示例：
  <QuillEditor v-model="form.description" placeholder="请输入公告内容" />
-->

<script setup lang="ts">
import { computed } from 'vue'
import { QuillEditor as VueQuillEditor } from '@vueup/vue-quill'

type ContentType = 'html' | 'text' | 'delta'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    contentType?: ContentType
    placeholder?: string
    readOnly?: boolean
    height?: string
  }>(),
  {
    modelValue: '',
    contentType: 'html',
    placeholder: '请输入内容',
    readOnly: false,
    height: '260px',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 统一 toolbar 配置（可根据需要继续扩展）
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  [{ color: [] }, { background: [] }],
  ['link'],
  ['clean'],
]

// 内部使用 content 双向绑定，外部暴露为 v-model
const innerContent = computed({
  get: () => props.modelValue,
  set: (value: string | any) => {
    emit('update:modelValue', value as string)
  },
})
</script>

<template>
  <VueQuillEditor
    v-model:content="innerContent"
    :content-type="contentType"
    theme="snow"
    :toolbar="toolbarOptions"
    :placeholder="placeholder"
    :read-only="readOnly"
    :style="{ height }"
  />
</template>

