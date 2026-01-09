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

/**
 * 将权限树转换为路由配置
 * 目录用于拼接路径前缀，菜单用于实际生成路由；组件加载失败时跳过但继续处理子级
 */
function convertPermissionToRoutes(permissions: PermissionTreeVo[], parentPath = ''): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  const buildFullPath = (base: string, path?: string) => {
    if (!path) return base
    if (path.startsWith('/')) return path
    if (!base) return path.startsWith('/') ? path : `/${path}`
    return base.endsWith('/') ? `${base}${path}` : `${base}/${path}`
  }

  for (const permission of permissions) {
    // 仅处理启用且可见
    if (permission.status !== 1 || permission.visible !== 1) {
      continue
    }

    const currentPath = buildFullPath(parentPath, permission.path)

    // 菜单：有组件且有路径才生成路由
    if (permission.permissionType === 'menu' && permission.component && currentPath) {
      try {
        let childRoutes: RouteRecordRaw[] = []
        if (permission.children && permission.children.length > 0) {
          childRoutes = convertPermissionToRoutes(permission.children, currentPath)
        }

        const componentLoader = loadComponent(permission.component)

        const route: RouteRecordRaw = {
          path: currentPath,
          name: permission.permissionCode || `route_${permission.id}`,
          component: componentLoader,
          meta: {
            title: permission.permissionName,
            icon: permission.icon,
          },
          ...(childRoutes.length > 0 ? { children: childRoutes } : {}),
        }

        routes.push(route)
      } catch (error) {
        console.warn(`[动态路由] 跳过路由 ${currentPath}，组件加载失败:`, error)
        if (permission.children && permission.children.length > 0) {
          const childRoutes = convertPermissionToRoutes(permission.children, parentPath)
          routes.push(...childRoutes)
        }
      }
    }

    // 目录或无组件的菜单：继续向下处理子级，携带路径前缀
    if (permission.children && permission.children.length > 0) {
      const childRoutes = convertPermissionToRoutes(permission.children, currentPath)
      routes.push(...childRoutes)
    }
  }

  return routes
}

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

    // 转换为路由配置
    const dynamicRoutes = convertPermissionToRoutes(permissionTree)

    // 找到第一个有路径的路由作为默认重定向
    const findFirstPath = (routes: RouteRecordRaw[]): string | null => {
      for (const route of routes) {
        if (route.path && route.component) {
          return route.path
        }
        if (route.children) {
          const childPath = findFirstPath(route.children)
          if (childPath) return childPath
        }
      }
      return null
    }

    const defaultPath = findFirstPath(dynamicRoutes) || '/system/userPage'

    // 无论是否有动态路由，都注册 /system 路由
    // 这样即使所有组件都加载失败，至少也有一个可用的路由
    const layoutRoute: RouteRecordRaw = {
      path: '/system',
      component: Layout,
      children: [
        ...dynamicRoutes,
        {
          path: '',
          redirect: defaultPath,
        },
      ],
    }

    router.addRoute(layoutRoute)

    dynamicRoutesLoaded = true
  } catch (error) {
    handleErrorSilent(error)
    console.error('加载动态菜单失败:', error)
  }
}

// 对外暴露，便于登录后主动加载动态路由
export async function ensureDynamicRoutesLoaded() {
  await loadDynamicRoutes()
}

// 重置动态路由状态（登出时调用）
export function resetDynamicRoutesState() {
  dynamicRoutesLoaded = false
}

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

  // 已登录，访问登录页，重定向到系统首页
  if (to.path === '/login' && isLoggedIn) {
    // 先加载动态路由，然后重定向
    if (!dynamicRoutesLoaded) {
      await loadDynamicRoutes()
    }
    next('/system')
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

export default router


