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

// 统一 toolbar 配置
// - 文本格式：bold, italic, underline, strike
// - 标题：header (1-6 或 false 表示段落)
// - 列表：list (ordered/bullet)
// - 缩进：indent (-1/+1)
// - 对齐：align (left/center/right/justify)
// - 颜色：color (文字颜色), background (背景色)
// - 字体：font (字体族选择)
// - 字号：size (small/false/large/huge)
// - 代码：code (行内代码), code-block (代码块)
// - 引用：blockquote
// - 链接：link
// - 图片：image (需要自定义上传 handler)
// - 视频：video (需要自定义上传 handler)
// - 清除：clean (清除格式)
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['code', 'code-block'],
  ['blockquote'],
  ['link'],
  ['image'],
  ['video'],
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

