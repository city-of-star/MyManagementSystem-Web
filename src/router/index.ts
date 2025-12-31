import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import Layout from '@/layouts/Layout.vue'
import { useMenuStore } from '@/store/menu/menu'
import { useAuthStore } from '@/store/auth/auth'
import { getPermissionTree } from '@/api/permission/permission'
import { convertPermissionToMenu, loadComponent } from '@/utils/menu/menuUtils'
import { handleErrorSilent } from '@/utils/http'
import type { PermissionTreeVo } from '@/api/permission/permission'

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
 * 如果某个组件加载失败，会跳过该路由但继续处理其他路由
 */
function convertPermissionToRoutes(permissions: PermissionTreeVo[], parentPath = ''): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  for (const permission of permissions) {
    // 只处理菜单类型，且状态为启用，可见性为显示
    if (permission.permissionType !== 'menu' || permission.status !== 1 || permission.visible !== 1) {
      continue
    }

    // 构建完整路径
    const fullPath = permission.path ? (parentPath + permission.path) : ''
    
    // 如果有组件路径，创建路由
    if (permission.component && fullPath) {
      try {
        // 先处理子路由
        let childRoutes: RouteRecordRaw[] = []
        if (permission.children && permission.children.length > 0) {
          childRoutes = convertPermissionToRoutes(permission.children, fullPath)
        }

        // 尝试加载组件，如果失败则跳过该路由
        const componentLoader = loadComponent(permission.component)

        const route: RouteRecordRaw = {
          path: fullPath,
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
        // 组件加载失败，记录错误但继续处理其他路由
        console.warn(`[动态路由] 跳过路由 ${fullPath}，组件加载失败:`, error)
        // 即使组件加载失败，也尝试处理子路由（可能子路由的组件是存在的）
        if (permission.children && permission.children.length > 0) {
          const childRoutes = convertPermissionToRoutes(permission.children, parentPath)
          routes.push(...childRoutes)
        }
      }
    } else if (permission.children && permission.children.length > 0) {
      // 如果没有组件但有子菜单，递归处理子菜单
      const childRoutes = convertPermissionToRoutes(permission.children, parentPath)
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
    // 获取权限树（只获取菜单类型，启用状态，可见的）
    const permissionTree = await getPermissionTree({
      permissionType: 'menu',
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


