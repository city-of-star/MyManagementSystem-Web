<!--
  字典标签组件

  功能：
  - 接收父组件传入的字典选项（options）和字典值（value）
  - 在组件内部将 value 翻译为对应的 label 文本，并用 el-tag 展示
  - 支持通过 typeMap 将不同的 value 映射为不同的 el-tag type

    typeMap 说明：
  - 作用：根据字典值映射 el-tag 的类型，从而控制不同状态的颜色样式
  - 用法：key -> 字典值; value -> 类型
    - 示例：  :type-map="{ '1': 'success', '0': 'info' }"
    - 示例：  :type-map="{ '1': 'danger', '0': 'success' }"
  - 可选类型：primary | success | info | warning | danger
  - 不传此属性或者未命中类型时则用默认类型 info

  使用示例：
  <DictTag :options="commonStatusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }"/>
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
    typeMap?: Record<string, string> // 根据字典值映射 el-tag 的 type
    defaultType?: string // 默认的 tag 类型（当未命中 typeMap 时使用）
  }>(),
  {
    placeholder: '--',
    defaultType: 'info',
  },
)

const label = computed(() => {
  const text = findDictLabel(props.options, props.value)
  return text || props.placeholder
})

const tagType = computed(() => {
  const key = props.value === null || props.value === undefined ? '--' : String(props.value)
  if (props.typeMap && key in props.typeMap) {
    return props.typeMap[key]
  }
  return props.defaultType
})
</script>

<template>
  <el-tag :type="tagType">
    {{ label }}
  </el-tag>
</template>

