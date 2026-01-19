import type { Component } from 'vue'
import {
  CircleCheck,
  CircleClose,
  Collection,
  DataLine,
  Delete,
  Document,
  Edit,
  Folder,
  Grid,
  Key,
  Lock,
  Menu,
  Plus,
  Refresh,
  Search,
  Setting,
  Switch,
  Unlock,
  User,
} from '@element-plus/icons-vue'

/**
 * Element Plus 图标统一映射
 * 说明：
 * - key 为业务使用的 icon 名（与 Element Plus 组件名一致）
 * - value 为对应的图标组件
 */
export const iconMap = {
  Plus,
  Edit,
  Delete,
  User,
  Key,
  Lock,
  Unlock,
  CircleCheck,
  CircleClose,
  Switch,
  Search,
  Refresh,
  Setting,
  Menu,
  Grid,
  Folder,
  Document,
  Collection,
  DataLine,
}

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
