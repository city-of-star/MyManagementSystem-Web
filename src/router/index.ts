import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import Layout from '@/layouts/Layout.vue'
import { useMenuStore } from '@/store/menu/menu'
import { useAuthStore } from '@/store/auth/auth'
import { getCurrentUserPermissionTree } from '@/api/system/permission/permission.ts'
import { convertPermissionToMenu, loadComponent } from '@/utils/menu/menuUtils'
import { handleErrorSilent } from '@/utils/http'
import type { PermissionTreeVo } from '@/api/system/permission/permission.ts'

// 基础路由（不需要权限）
const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
})

// 动态路由是否已加载
let dynamicRoutesLoaded = false

// 路由守卫：处理登录和动态路由加载
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  const isLoggedIn = !!authStore.accessToken || !!localStorage.getItem('accessToken')

  // 未登录，清除菜单和动态路由状态，重定向到登录页
  if (to.path !== '/login' && !isLoggedIn) {
    menuStore.clearMenus()
    dynamicRoutesLoaded = false
    next('/login')
    return
  }

  // 已登录，访问登录页，重定向到首页
  if (to.path === '/login' && isLoggedIn) {
    // 先加载动态路由，然后重定向
    if (!dynamicRoutesLoaded) {
      await loadDynamicRoutes()
    }
    next('/system/userPage')
    return
  }

  // 已登录，加载动态路由
  if (isLoggedIn && !dynamicRoutesLoaded) {
    await loadDynamicRoutes()
    // 动态路由加载后，重新导航到目标路由
    next(to.fullPath)
    return
  }

  next()
})


/**
 * 加载动态菜单和路由
 */
async function loadDynamicRoutes() {
  if (dynamicRoutesLoaded) {
    return
  }

  try {
    // 获取当前用户有权限的权限树（目录+菜单），仅保留启用且可见
    const permissionTree = await getCurrentUserPermissionTree({
      status: 1,
      visible: 1,
    })

    // 转换为菜单项并存储到 store
    const menuStore = useMenuStore()
    const menus = convertPermissionToMenu(permissionTree)
    menuStore.setMenus(menus)

    // 转换为路由配置（数据库路径已经是完整路径，如 /system/userPage）
    const dynamicRoutes = convertPermissionToRoutes(permissionTree)

    // 按路径前缀分组（如 /system、/business），为每个前缀创建 Layout 父路由
    const routeGroups = new Map<string, RouteRecordRaw[]>()

    for (const route of dynamicRoutes) {
      if (!route.path || !route.component) {
        continue
      }

      // 提取路径前缀：/system/userPage -> /system
      const prefix = '/' + route.path.split('/')[1]
      
      // 转换为相对路径：/system/userPage -> userPage
      const relativePath = route.path.replace(prefix, '').replace(/^\//, '') || ''
      
      // 处理子路由的相对路径
      let children = route.children
      if (children && children.length > 0) {
        children = children.map(child => ({
          ...child,
          path: child.path?.replace(prefix, '').replace(/^\//, '') || '',
        }))
      }

      const relativeRoute: RouteRecordRaw = {
        ...route,
        path: relativePath,
        ...(children ? { children } : {}),
      }

      if (!routeGroups.has(prefix)) {
        routeGroups.set(prefix, [])
      }
      routeGroups.get(prefix)!.push(relativeRoute)
    }

    // 为每个前缀创建 Layout 父路由
    for (const [prefix, childRoutes] of routeGroups) {
      router.addRoute({
        path: prefix,
        component: Layout,
        children: childRoutes,
      })
    }

    dynamicRoutesLoaded = true
  } catch (error) {
    handleErrorSilent(error)
    console.error('加载动态菜单失败:', error)
  }
}

/**
 * 将权限树转换为路由配置
 * 数据库中的 path 已经是完整路径（如 /system/userPage），直接使用即可
 */
function convertPermissionToRoutes(permissions: PermissionTreeVo[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  for (const permission of permissions) {
    // 仅处理启用且可见的菜单
    if (permission.status !== 1 || permission.visible !== 1) {
      continue
    }

    // 菜单：有组件且有路径才生成路由
    if (permission.permissionType === 'menu' && permission.component && permission.path) {
      try {
        // 处理子路由
        const childRoutes = permission.children && permission.children.length > 0
          ? convertPermissionToRoutes(permission.children)
          : []

        const componentLoader = loadComponent(permission.component)

        routes.push({
          path: permission.path, // 数据库已经是完整路径
          name: permission.permissionCode || `route_${permission.id}`,
          component: componentLoader,
          meta: {
            title: permission.permissionName,
            icon: permission.icon,
          },
          ...(childRoutes.length > 0 ? { children: childRoutes } : {}),
        })
      } catch (error) {
        console.warn(`[动态路由] 跳过路由 ${permission.path}，组件加载失败:`, error)
        // 组件加载失败，继续处理子路由
        if (permission.children && permission.children.length > 0) {
          routes.push(...convertPermissionToRoutes(permission.children))
        }
      }
    } else {
      // 目录：继续处理子路由
      if (permission.children && permission.children.length > 0) {
        routes.push(...convertPermissionToRoutes(permission.children))
      }
    }
  }

  return routes
}

// 对外暴露，便于登录后主动加载动态路由
export async function ensureDynamicRoutesLoaded() {
  await loadDynamicRoutes()
}

// 重置动态路由状态（登出时调用）
export function resetDynamicRoutesState() {
  dynamicRoutesLoaded = false
}

export default router


