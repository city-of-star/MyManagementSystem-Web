<!--
  通用树形选择组件

  功能：
  - 封装 el-tree-select，提供常用默认值（clearable/placeholder/loading 等）
  - 支持 v-model 绑定选中值
  - 支持 v-model.number：在 change 时将输出值转为 number
  - 透传 el-tree-select 的其他属性与事件（v-bind="$attrs"）

  使用示例：
  <TreeSelect
    v-model.number="query.deptId"
    :data="deptTree"
    :props="{ label: 'deptName', value: 'id', children: 'children' }"
    node-key="id"
    placeholder="请选择部门"
    :loading="deptLoading"
  />
-->
<script setup lang="ts">
import { computed } from 'vue'

type ModelValue = string | number | null | undefined

const props = withDefaults(
  defineProps<{
    data: any[]
    modelValue: ModelValue
    modelModifiers?: { number?: boolean }
    props?: Record<string, any>
    nodeKey?: string
    loading?: boolean
    placeholder?: string
    clearable?: boolean
    checkStrictly?: boolean
    renderAfterExpand?: boolean
  }>(),
  {
    loading: false,
    placeholder: '请选择',
    clearable: true,
    checkStrictly: true,
    renderAfterExpand: false,
    nodeKey: 'id',
    props: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue]
  change: [value: ModelValue]
}>()

const resolvedProps = computed(() => {
  return (
    props.props ?? {
      label: 'label',
      value: 'value',
      children: 'children',
    }
  )
})

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
  <el-tree-select
    :model-value="modelValue"
    :data="data"
    :props="resolvedProps"
    :node-key="nodeKey"
    :check-strictly="checkStrictly"
    :render-after-expand="renderAfterExpand"
    :loading="loading"
    :placeholder="placeholder"
    :clearable="clearable"
    @change="handleChange"
    v-bind="$attrs"
  />
</template>

