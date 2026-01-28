<!--
  字典文本显示组件

  功能：
  - 接收父组件传入的字典选项（options）和字典值（value）
  - 在组件内部将 value 翻译为对应的 label 文本并展示

  使用示例：
  <DictText :options="userGenderOptions" :value="row.gender" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { DictOption } from '@/utils/base/dictUtils.ts'
import { findDictLabel } from '@/utils/base/dictUtils.ts'

const props = withDefaults(
  defineProps<{
    options: DictOption[] // 字典选项列表（由父组件加载并传入）
    value: string | number | null | undefined // 字典值
    placeholder?: string // 找不到时的占位符
  }>(),
  {
    placeholder: '--',
  },
)

const text = computed(() => {
  const label = findDictLabel(props.options, props.value)
  return label || props.placeholder
})
</script>

<template>
  <span>{{ text }}</span>
</template>

