<!--
  图标按钮组件（常用于表格“操作”列等场景）

  功能：
  - 基于 Element Plus 的 el-button 封装，只展示图标
  - 内置 Tooltip，统一图标引入和名称映射
  - 默认适合放在表格单元格中，支持大小、链接样式、圆形等配置

  使用示例：
  <IconButton
    type="primary"
    icon="Edit"
    tooltip="编辑"
    @click="handleEdit(row)"
  />

  属性说明（基于 Element Plus 的 ButtonProps）：
  - type: 按钮类型（ButtonProps['type']）
  - size: 按钮大小（ButtonProps['size']，默认 large）
  - icon: 图标名称（在 icons.ts 中统一管理）
  - tooltip: 悬浮提示文本（必填，同时作为无障碍名称的默认值）
  - disabled: 是否禁用
  - link: 是否为链接样式（默认 true）
  - circle: 是否为圆形按钮（默认 false）
  - ariaLabel: 自定义无障碍名称（优先级高于 tooltip）
-->

<script setup lang="ts">
import {computed, defineOptions} from 'vue'
import type {ButtonProps} from 'element-plus'
import {iconMap, type IconName} from '@/components/button/icons'

defineOptions({
  inheritAttrs: false,
})

// 使用 Element Plus 的类型定义按钮类型和大小
type ButtonType = ButtonProps['type']
type ButtonSize = ButtonProps['size']

const props = withDefaults(
  defineProps<{
    type?: ButtonType // 按钮类型
    size?: ButtonSize // 按钮大小
    icon: IconName // 按钮图标
    tooltip: string // 按钮悬浮提示内容
    disabled?: boolean // 是否禁用
    link?: boolean // 是否为链接样式
    circle?: boolean // 是否为圆形按钮
    ariaLabel?: string // 无障碍访问使用
  }>(),
  {
    type: 'primary',
    disabled: false,
    size: 'large',
    link: true,
    circle: false,
  },
)

const resolvedIcon = computed(() => iconMap[props.icon])
</script>

<template>
  <el-tooltip :content="props.tooltip" placement="top">
    <el-button
      v-bind="$attrs"
      :type="props.type"
      :size="props.size"
      :icon="resolvedIcon"
      :disabled="props.disabled"
      :circle="props.circle"
      :link="props.link"
      :aria-label="props.ariaLabel ?? props.tooltip"
    />
  </el-tooltip>
</template>

