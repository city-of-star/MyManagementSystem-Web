<!--
  字典文本显示组件

  功能：
  - 根据字典编码和字典值显示对应的标签文本
  - 内部自动加载字典并使用缓存

  使用示例：
  <DictText dict-code="user_gender" :value="row.gender" />
-->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useDict } from '@/utils/base/dictUtils.ts'

const props = withDefaults(
  defineProps<{
    dictCode: string // 字典类型编码
    value: string | number | null | undefined // 字典值
    placeholder?: string // 找不到时的占位符
    autoLoad?: boolean // 是否在挂载时自动加载字典
  }>(),
  {
    placeholder: '',
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

const text = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return props.placeholder
  }
  const target = options.value.find((opt) => opt.value === String(props.value))
  return target?.label ?? props.placeholder
})
</script>

<template>
  <span>{{ text }}</span>
</template>

