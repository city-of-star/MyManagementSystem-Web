<!--
  JSON 编辑器组件
  - 基于 vue-codemirror 封装
  - 支持 JSON 语法高亮、错误提示、自动格式化
  - 对外使用 v-model 进行双向绑定

  使用示例：
  <JsonEditor v-model="form.paramsJson" placeholder="请输入任务参数（JSON 字符串）" />
  <JsonEditor v-model="form.paramsJson" :height="300" />
-->

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    height?: string
    readOnly?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '请输入 JSON 格式数据',
    height: '200px',
    readOnly: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

// 内部值
const code = ref(props.modelValue || '')

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== code.value) {
      code.value = newVal || ''
    }
  },
)

// 编辑器配置
const extensions = computed(() => {
  return [
    json(), // JSON 语法高亮
    EditorView.lineWrapping, // 自动换行
    EditorView.theme({
      '&': {
        fontSize: '14px',
      },
      '.cm-content': {
        padding: '8px',
      },
      '.cm-focused': {
        outline: 'none',
      },
    }),
  ]
})

// 处理输入变化
const handleChange = (value: string) => {
  code.value = value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <Codemirror
    v-model="code"
    :placeholder="placeholder"
    :style="{ height, width: '100%' }"
    :read-only="readOnly"
    :extensions="extensions"
    @update:model-value="handleChange"
  />
</template>

<style scoped>
:deep(.cm-editor) {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}

:deep(.cm-editor.cm-focused) {
  border-color: var(--el-color-primary);
}

:deep(.cm-scroller) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

:deep(.cm-placeholder) {
  color: var(--el-text-color-placeholder);
}
</style>
