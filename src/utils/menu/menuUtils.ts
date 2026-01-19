import type { PermissionTreeVo } from '@/api/system/permission/permission.ts'
import type { MenuItem } from "@/store/menu/menu.ts";

/**
 * 将后端权限树转换为前端菜单项
 */
export function convertPermissionToMenu(permissions: PermissionTreeVo[]): MenuItem[] {
  return permissions
    .map(p => ({
      label: p.permissionName,
      icon: p.icon,
      ...(p.permissionType === 'menu' && p.path ? { path: p.path } : {}),
      ...(p.children?.length ? { children: convertPermissionToMenu(p.children) } : {}),
    }))
}

/**
 * 根据组件路径动态导入组件
 * component 格式: "/system/user/UserPage.vue" 或 "/system/user/UserPage"
 * 支持大小写不敏感匹配
 */
export function loadComponent(component: string) {

  // 检查路径是否为空
  if (!component) {
    throw new Error('组件路径不能为空')
  }

  // 标准化目标路径用于匹配
  const targetPath = normalizePath(component)

  // 查找匹配的组件
  const moduleKey = Object.keys(componentModules).find(key =>
       targetPath === normalizePath(key)
  )

  // 如果找到了就返回
  if (moduleKey && componentModules[moduleKey]) {
    return componentModules[moduleKey] as () => Promise<any>
  }

  // 如果找不到抛出异常
  throw new Error(
      `无法加载组件: ${component}\n` +
      `请检查后端权限配置中的 component 字段是否正确\n` +
      `格式应为: "/system/user/UserPage.vue" (相对于 @/views 目录)`
  )
}

/**
 * 组件列表
 * 使用 import.meta.glob 预加载所有 views 下的组件
 * 这样 Vite 可以在构建时知道所有需要打包的组件
 */
const componentModules = import.meta.glob('@/views/**/*.vue', { eager: false })

/**
 * 标准化路径用于匹配
 */
function normalizePath(path: string): string {
  return path
    .replace(/^@\/views\//, '') // 移除 @/views/ 前缀（如果存在）
    .replace(/^.*\/views\//, '') // 移除任意前缀直到 /views/ 的部分
    .replace(/\.vue$/, '') // 移除 .vue 后缀
    .replace(/\\/g, '/') // 将反斜杠统一为正斜杠（处理 Windows 路径）
    .replace(/^\/+/, '') // 移除开头的多个斜杠
}

