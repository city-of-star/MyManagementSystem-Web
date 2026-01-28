<!--
  字典下拉选择组件

  功能：
  - 接收字典选项列表，通过 v-model 绑定选中值
  - 默认支持清空（clearable），默认占位符为"请选择"
  - 透传 el-select 的常用属性和事件

  使用示例：
  <DictSelect :options="statusOptions" v-model="query.status" placeholder="全部" />
-->
<script setup lang="ts">
import type { DictOption } from '@/utils/base/dictUtils.ts'

withDefaults(
  defineProps<{
    options: DictOption[] // 字典选项列表
    modelValue: string | number | null | undefined // v-model 绑定值
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
  'update:modelValue': [value: string | null | undefined]
  change: [value: string | null | undefined]
}>()

const handleChange = (val: string | null | undefined) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<template>
  <el-select
    :model-value="modelValue"
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

