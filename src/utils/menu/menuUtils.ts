import type { PermissionTreeVo } from '@/api/system/permission/permission.ts'

// 菜单项类型，供菜单转换与 store 复用
export interface MenuItem {
  path?: string
  label: string
  icon?: string
  children?: MenuItem[]
}

/**
 * 将后端权限树转换为前端菜单项
 */
export function convertPermissionToMenu(permissions: PermissionTreeVo[]): MenuItem[] {
  return permissions
    .flatMap(permission => {
      // 目录/菜单，且启用可见
      const isAllowedType = permission.permissionType === 'menu' || permission.permissionType === 'catalog'
      if (!isAllowedType || permission.status !== 1 || permission.visible !== 1) {
        return []
      }

      const children = permission.children ? convertPermissionToMenu(permission.children) : []

      // 目录：仅作为分组，即使没有子项也展示，不设置 path（避免被当作普通菜单重复渲染）
      if (permission.permissionType === 'catalog') {
        return [{
          label: permission.permissionName,
          icon: permission.icon,
          children,
        }]
      }

      // 菜单：保留 path，附带子菜单
      const menuItem: MenuItem = {
        label: permission.permissionName,
        icon: permission.icon,
        path: permission.path,
      }
      if (children.length) {
        menuItem.children = children
      }
      return [menuItem]
    })
}

/**
 * 使用 import.meta.glob 预加载所有 views 下的组件
 * 这样 Vite 可以在构建时知道所有需要打包的组件
 */
const componentModules = import.meta.glob('@/views/**/*.vue', { eager: false })

/**
 * 标准化组件路径，用于匹配（大小写不敏感）
 */
function normalizePathForMatch(path: string): string {
  // 移除 @/views/ 前缀（如果有）
  let normalized = path.replace(/^@\/views\//, '').replace(/^.*\/views\//, '')
  // 移除 .vue 后缀（如果有）
  normalized = normalized.replace(/\.vue$/, '')
  // 统一使用正斜杠
  normalized = normalized.replace(/\\/g, '/')
  // 去掉开头的斜杠，兼容后端返回类似 "/system/user/UserPage" 的写法
  normalized = normalized.replace(/^\/+/, '')
  // 转换为小写用于匹配（但保留原始路径用于实际导入）
  return normalized.toLowerCase()
}

/**
 * 从完整路径中提取相对路径（保留原始大小写）
 */
function extractRelativePath(fullPath: string): string {
  // 移除 @/views/ 前缀（如果有）
  let relative = fullPath.replace(/^@\/views\//, '').replace(/^.*\/views\//, '')
  // 移除 .vue 后缀（如果有）
  relative = relative.replace(/\.vue$/, '')
  // 统一使用正斜杠
  relative = relative.replace(/\\/g, '/')
  return relative
}

/**
 * 根据组件路径动态导入组件
 * component 格式示例: "/system/user/UserPage" 或 "/system/user/UserPage.vue"
 * 支持大小写不敏感匹配
 */
export function loadComponent(component: string) {
  // 移除 .vue 后缀（如果有）
  const componentPath = component.replace(/\.vue$/, '').trim()

  // 如果路径为空，抛出错误
  if (!componentPath) {
    throw new Error('组件路径不能为空')
  }

  // 标准化目标路径（用于匹配）
  const normalizedTarget = normalizePathForMatch(componentPath)

  // 查找匹配的组件模块（大小写不敏感）
  const moduleKey = Object.keys(componentModules).find(key => {
    const normalizedKey = normalizePathForMatch(key)
    return normalizedKey === normalizedTarget
  })

  if (moduleKey && componentModules[moduleKey]) {
    // 返回动态导入函数
    return componentModules[moduleKey] as () => Promise<any>
  }

  // 如果找不到，输出调试信息并抛出错误
  const availablePaths = Object.keys(componentModules).map(k => extractRelativePath(k))
  console.error(`[动态路由] 组件未找到: ${componentPath}`)
  console.error(`[动态路由] 标准化后的路径: ${normalizedTarget}`)
  console.error(`[动态路由] 可用的组件路径:`, availablePaths)
  throw new Error(
    `无法加载组件: ${componentPath}\n` +
    `请检查后端权限配置中的 component 字段是否正确。\n` +
    `格式应为: "/system/user/UserPage.vue" (相对于 @/views 目录)\n` +
    `可用的组件: ${availablePaths.join(', ')}`
  )
}

