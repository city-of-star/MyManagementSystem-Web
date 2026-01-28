<!--
  字典下拉选择组件

  功能：
  - 接收字典选项列表，通过 v-model 绑定选中值
  - 默认支持清空（clearable），默认占位符为"请选择"
  - 透传 el-select 的常用属性和事件

  使用示例：
  <DictSelect :options="statusOptions" v-model="query.status" />
  <DictSelect :options="statusOptions" v-model.number="query.status" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { DictOption } from '@/utils/base/dictUtils.ts'

const props = withDefaults(
  defineProps<{
    options: DictOption[] // 字典选项列表
    modelValue: string | number | null | undefined // v-model 绑定值
    modelModifiers?: { number?: boolean } // 支持 v-model.number
    loading?: boolean // 加载状态
    placeholder?: string // 占位符文本
    clearable?: boolean // 是否可清空
  }>(),
  {
    loading: false,
    placeholder: '请选择',
    clearable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | undefined]
  change: [value: string | number | null | undefined]
}>()

const innerModelValue = computed(() => {
  const v = props.modelValue
  if (v === null || v === undefined) return v
  return String(v)
})

const handleChange = (val: string | number | null | undefined) => {
  let out: string | number | null | undefined = val
  if (val !== null && val !== undefined && props.modelModifiers?.number) {
    out = Number(val)
  }
  emit('update:modelValue', out)
  emit('change', out)
}
</script>

<template>
  <el-select
    :model-value="innerModelValue"
    :loading="loading"
    :placeholder="placeholder"
    :clearable="clearable"
    @change="handleChange"
    v-bind="$attrs"
  >
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</template>

