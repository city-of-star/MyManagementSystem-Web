<!--
  日期/时间单值选择器组件

  功能：
  - 封装 el-date-picker 单值场景
  - 支持 date（默认）和 datetime 两种类型
  - 通过 v-model 直接绑定一个字符串（或 null）
  - 可选：type="date" 时自动补齐时间（默认 true）
  - 透传 el-date-picker 的属性与事件（通过 v-bind="$attrs"）

  使用示例：

  // 选年月日 YYYY-MM-DD
  <DateTimePicker v-model="query.loginTime" type="date" />

  // 选年月日时分秒 YYYY-MM-DD HH:mm:ss
  <DateTimePicker v-model="query.loginTime" type="datetime" />

  // 自定义时间格式 YYYY-MM
  <DateTimePicker v-model="query.loginTime" :append-time=false value-format="YYYY-MM" />
-->
<script setup lang="ts">
import { computed } from 'vue'

type PickerType = 'date' | 'datetime'

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined // v-model 绑定的值
    type?: PickerType // 日期类型，date/datetime 等
    valueFormat?: string // 绑定值格式；不传则用组件默认格式
    appendTime?: boolean // 是否自动补齐时分秒
    timeSuffix?: string // 补齐时追加的时分秒内容
    placeholder?: string // 输入框占位
  }>(),
  {
    type: 'date',
    valueFormat: undefined,
    appendTime: true,
    timeSuffix: '00:00:00',
    placeholder: '请选择',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
}>()

/**
 * 默认 value-format（允许通过 props 覆盖）
 */
const resolvedValueFormat = computed(() => {
  if (props.valueFormat) return props.valueFormat
  return props.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
})

/**
 * 组件内部用于展示的值
 */
const innerValue = computed(() => {
  if (!props.modelValue) return null
  if (props.type === 'date' && props.appendTime) return props.modelValue.slice(0, 10)
  return props.modelValue
})

const proxyValue = computed<string | null>({
  get: () => innerValue.value,
  set: (val) => {
    if (!val) {
      emit('update:modelValue', null)
      emit('change', null)
      return
    }

    if (props.type === 'date' && props.appendTime) {
      const full = `${val} ${props.timeSuffix}`
      emit('update:modelValue', full)
      emit('change', full)
      return
    }

    emit('update:modelValue', val)
    emit('change', val)
  },
})
</script>

<template>
  <el-date-picker
    v-model="proxyValue"
    :type="props.type"
    :value-format="resolvedValueFormat"
    :placeholder="props.placeholder"
    v-bind="$attrs"
  />
</template>

