/**
 * 按钮组件统一图标映射配置
 *
 * 作用：
 * - 统一管理所有按钮中用到的 Element Plus 图标
 * - 通过对象键名（IconName）作为业务侧使用的图标名称
 * - 避免在各个组件/页面中分散引入图标，方便维护和替换
 *
 * 使用方式：
 * - 在按钮组件中通过 `iconMap[iconName]` 动态解析图标组件
 * - 通过 `IconName = keyof typeof iconMap` 约束 icon prop 的取值范围
 */
import {
  CircleCheck,
  CircleClose,
  Delete,
  Edit,
  Key,
  Lock,
  Plus,
  Refresh,
  Search,
  Switch,
  Unlock,
  User,
} from '@element-plus/icons-vue'

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
}

export type IconName = keyof typeof iconMap
