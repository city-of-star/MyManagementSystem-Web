<!--
  通用下拉选择组件

  功能：
  - 封装 el-select，提供常用默认值：clearable / filterable / placeholder / loading
  - 支持 v-model（含 v-model.number），在 change 时按需转 number
  - 支持自定义选项字段名（labelKey / valueKey）
  - 透传 el-select 其余属性与事件（v-bind="$attrs"）

  使用示例：
  <BaseSelect
    v-model.number="query.postId"
    :options="postOptions"
    label-key="postName"
    value-key="id"
    :loading="postLoading"
  />
-->
<script setup lang="ts">
type ModelValue = string | number | null | undefined

type Option = Record<string, any>

const props = withDefaults(
  defineProps<{
    options: Option[]
    modelValue: ModelValue
    modelModifiers?: { number?: boolean }
    labelKey?: string
    valueKey?: string
    loading?: boolean
    placeholder?: string
    clearable?: boolean
    filterable?: boolean
  }>(),
  {
    labelKey: 'label',
    valueKey: 'value',
    loading: false,
    placeholder: '请选择',
    clearable: true,
    filterable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue]
  change: [value: ModelValue]
}>()

const handleChange = (val: any) => {
  let out: ModelValue = val
  if (val !== null && val !== undefined && props.modelModifiers?.number) {
    out = Number(val)
  }
  emit('update:modelValue', out)
  emit('change', out)
}
</script>

<template>
  <el-select
    :model-value="modelValue"
    :loading="loading"
    :placeholder="placeholder"
    :clearable="clearable"
    :filterable="filterable"
    @change="handleChange"
    v-bind="$attrs"
  >
    <el-option
      v-for="opt in options"
      :key="opt[valueKey]"
      :label="opt[labelKey]"
      :value="opt[valueKey]"
    />
  </el-select>
</template>

