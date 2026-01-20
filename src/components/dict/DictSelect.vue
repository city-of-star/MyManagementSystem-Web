<!--
  字典下拉选择组件

  功能：
  - 根据字典编码自动加载字典项
  - 通过 v-model 绑定选中值
  - 透传 el-select 的常用属性和事件

  使用示例：
  <DictSelect dict-code="common_status" v-model="query.status" placeholder="全部" clearable />
-->
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useDict } from '@/utils/base/dictUtils.ts'

const props = withDefaults(
  defineProps<{
    dictCode: string // 字典类型编码
    modelValue: string | number | null | undefined // v-model 绑定值
    valueAsNumber?: boolean // 是否将选项值转成 Number
    autoLoad?: boolean // 是否在挂载时自动加载字典
  }>(),
  {
    valueAsNumber: true,
    autoLoad: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | undefined]
  change: [value: string | number | null | undefined]
}>()

// 使用字典工具加载选项
const { options, loading, load } = useDict(props.dictCode)

onMounted(() => {
  if (props.autoLoad) {
    load(true)
  }
})

// 当字典编码变化时，重新加载
watch(
  () => props.dictCode,
  () => {
    load(false)
  },
)

const handleChange = (val: string | number | null | undefined) => {
  let value: string | number | null | undefined = val
  if (props.valueAsNumber && value !== null && value !== undefined && value !== '') {
    const num = Number(value)
    value = Number.isNaN(num) ? value : num
  }
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <el-select
    :model-value="modelValue"
    :loading="loading"
    @change="handleChange"
    v-bind="$attrs"
  >
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="valueAsNumber ? Number(opt.value) : opt.value"
    />
  </el-select>
</template>

