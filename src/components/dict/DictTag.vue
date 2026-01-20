<!--
  字典标签组件

  功能：
  - 根据字典编码和字典值展示对应的标签文本
  - 使用 el-tag 包裹，支持自定义类型映射

  使用示例：
  <DictTag dict-code="common_status" :value="row.status" />
-->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useDict } from '@/utils/base/dictUtils.ts'

const props = withDefaults(
  defineProps<{
    dictCode: string // 字典类型编码
    value: string | number | null | undefined // 字典值
    placeholder?: string // 找不到时的占位符
    typeMap?: Record<string, string> // 根据字典值映射 el-tag 的 type
    defaultType?: string // 默认的 tag 类型（当未命中 typeMap 时使用）
    autoLoad?: boolean // 是否在挂载时自动加载字典
  }>(),
  {
    placeholder: '',
    defaultType: 'info',
    autoLoad: true,
  },
)

const { options, load } = useDict(props.dictCode)

onMounted(() => {
  if (props.autoLoad) {
    load(true)
  }
})

watch(
  () => props.dictCode,
  () => {
    load(false)
  },
)

const label = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return props.placeholder
  }
  const target = options.value.find((opt) => opt.value === String(props.value))
  return target?.label ?? props.placeholder
})

const tagType = computed(() => {
  const key = props.value === null || props.value === undefined ? '' : String(props.value)
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

