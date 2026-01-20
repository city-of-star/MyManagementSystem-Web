import type { Component } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * Element Plus 图标统一映射
 * 说明：
 * - key 为业务使用的 icon 名（与 Element Plus 组件名一致）
 * - value 为对应的图标组件
 * - 全量导入所有 Element Plus 图标，无需手动添加
 */
export const iconMap: Record<string, Component> = {}

// 遍历并填充所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  iconMap[key] = component as Component
}

/**
 * 图标名称类型
 * 表示 iconMap 中所有可用的图标名称
 * 例如：'User' | 'Edit' | 'Delete' | 'Setting' | ...
 */
export type IconName = keyof typeof iconMap

/**
 * 供下拉/网格选择使用的选项列表
 */
export const iconOptions: Array<{ label: string; value: IconName; component: Component }> = Object.entries(iconMap).map(
  ([value, component]) => ({
    label: value,
    value: value as IconName,
    component,
  })
)
