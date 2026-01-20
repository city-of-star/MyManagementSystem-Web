<!--
  日期/时间范围选择器组件

  功能：
  - 封装 el-date-picker 范围模式
  - 支持 date（默认）和 datetime 两种类型
  - 通过 v-model:start + v-model:end 绑定范围值（用于查询 DTO 的 start/end）
  - date 类型可选自动补齐 00:00:00 / 23:59:59
  - 透传 el-date-picker 的属性与事件（通过 v-bind="$attrs"）

  使用示例：

  // 选年月日 YYYY-MM-DD
  <DateRangePicker
    v-model:start="query.createTimeStart"
    v-model:end="query.createTimeEnd"
    type="date"
  />

  // 选年月日时分秒 YYYY-MM-DD HH:mm:ss
  <DateRangePicker
    v-model:start="query.createTimeStart"
    v-model:end="query.createTimeEnd"
    type="datetime"
  />

  // 自定义时间格式 YYYY-MM
  <DateRangePicker
    v-model:start="query.createTimeStart"
    v-model:end="query.createTimeEnd"
    :append-time=false
    value-format="YYYY-MM"
  />
-->
<script setup lang="ts">
import { computed } from 'vue'

type PickerType = 'date' | 'datetime'

const props = withDefaults(
  defineProps<{
    start?: string | null // v-model 绑定的开始值
    end?: string | null // v-model 绑定的结束值
    type?: PickerType // 日期类型，date/datetime 等
    valueFormat?: string // 绑定值格式；不传则用组件默认格式
    appendTime?: boolean // 是否自动补齐时分秒
    startPlaceholder?: string // 开始输入框占位
    rangeSeparator?: string // 分隔符文案
    endPlaceholder?: string // 结束输入框占位
  }>(),
  {
    type: 'date',
    appendTime: true,
    startPlaceholder: '开始日期',
    rangeSeparator: '至',
    endPlaceholder: '结束日期',
    valueFormat: undefined,
  },
)

const emit = defineEmits<{
  'update:start': [value: string | null]
  'update:end': [value: string | null]
  change: [value: [string, string] | null]
}>()

/**
 * 计算 el-date-picker 的 type
 */
const pickerType = computed(() => {
  return props.type === 'datetime' ? 'datetimerange' : 'daterange'
})

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
const innerValue = computed<[string, string] | null>(() => {
  if (!props.start || !props.end) return null
  if (props.type === 'date' && props.appendTime) {
    return [props.start.slice(0, 10), props.end.slice(0, 10)]
  }
  return [props.start, props.end]
})

/**
 * 将 picker 值写回 start/end（并按需补齐时间）
 */
const updateStartEndByPickerValue = (val: [string, string] | null) => {
  if (val && val.length === 2) {
    if (props.type === 'date' && props.appendTime) {
      emit('update:start', val[0] ? `${val[0]} 00:00:00` : null)
      emit('update:end', val[1] ? `${val[1]} 23:59:59` : null)
    } else {
      emit('update:start', val[0] || null)
      emit('update:end', val[1] || null)
    }
  } else {
    emit('update:start', null)
    emit('update:end', null)
  }
}

const proxyValue = computed<[string, string] | null>({
  get: () => innerValue.value,
  set: (val) => {
    updateStartEndByPickerValue(val)
    emit('change', val)
  },
})
</script>

<template>
  <el-date-picker
    v-model="proxyValue"
    :type="pickerType"
    :range-separator="props.rangeSeparator"
    :start-placeholder="props.startPlaceholder"
    :end-placeholder="props.endPlaceholder"
    :value-format="resolvedValueFormat"
    v-bind="$attrs"
  />
</template>

