<!--
  主要操作按钮组件（用于页面主操作、表格外工具栏等场景）

  功能：
  - 基于 Element Plus 的 el-button 封装
  - 统一图标引入和 icon 名称映射
  - 左侧图标 + 右侧文字的常见主按钮样式
  - 支持大小、类型、loading、禁用等常用配置

  使用示例：
  <PrimaryButton icon="Plus" @click="handleCreate">
    新建用户
  </PrimaryButton>

  属性说明（基于 Element Plus 的 ButtonProps）：
  - type: 按钮类型（ButtonProps['type']，默认 primary）
  - size: 按钮大小（ButtonProps['size']，默认 default）
  - icon: 左侧图标名称（在 icons.ts 中统一管理）
  - loading: 是否加载中
  - disabled: 是否禁用
  - ariaLabel: 无障碍访问名称（可用于覆盖按钮文本）
-->

<script setup lang="ts">
import {computed, defineOptions} from 'vue'
import type {ButtonProps} from 'element-plus'
import {iconMap, type IconName} from '@/assets/icon/icons.ts'

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
    icon?: IconName // 左侧图标名称
    loading?: boolean // 是否加载中
    disabled?: boolean // 是否禁用
    ariaLabel?: string // 无障碍访问使用
  }>(),
  {
    type: 'primary',
    size: 'default',
    loading: false,
    disabled: false,
  },
)

const resolvedIcon = computed(() => (props.icon ? iconMap[props.icon] : undefined))
</script>

<template>
  <el-button
    v-bind="$attrs"
    :type="props.type"
    :size="props.size"
    :icon="resolvedIcon"
    :loading="props.loading"
    :disabled="props.disabled"
    :aria-label="props.ariaLabel"
  >
    <slot />
  </el-button>
</template>

