import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import Layout from '@/layouts/Layout.vue'
import { useMenuStore } from '@/store/menu/menu'
import { useAuthStore } from '@/store/auth/auth'
import { convertPermissionToMenu, loadComponent } from '@/utils/menu/menuUtils'
import { handleErrorSilent } from '@/utils/http'
import {getCurrentUserPermissionTree, type PermissionTreeVo} from '@/api/system/permission/permission.ts'

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
    if (!dynamicRoutesLoaded) {
      await loadDynamicRoutes()
    }
    next('/system/userPage')
    return
  }

  // 已登录，加载动态路由
  if (isLoggedIn && !dynamicRoutesLoaded) {
    await loadDynamicRoutes()
    next(to.fullPath)
    return
  }

  next()
})

/**
 * 加载动态菜单和路由
 * 核心逻辑：后端返回权限树 → 转换为菜单
 *                     → 注册为路由
 */
async function loadDynamicRoutes() {
  if (dynamicRoutesLoaded) return

  try {
    // 获取权限树（后端已固定返回启用、可见、目录或菜单类型的权限）
    const permissionTree = await getCurrentUserPermissionTree()

    // 转换为菜单（用于侧边栏）
    const menuStore = useMenuStore()
    menuStore.setMenus(convertPermissionToMenu(permissionTree))

    // 定义 Map（键->父路由路径，值->子路由）
    const routeGroups = new Map<string, RouteRecordRaw[]>()

    // 将权限树转换成 Map 结构
    function processPermissions(permissions: PermissionTreeVo[]) {
      for (const p of permissions) {
        // 只处理菜单类型的权限
        if (p.permissionType === 'menu' && p.path && p.component) {
          try {
            // 提取前缀：/system/userPage -> /system
            const prefix = '/' + p.path.split('/')[1]
            // 相对路径：/system/userPage -> userPage
            const relativePath = p.path.replace(prefix, '').replace(/^\//, '') || ''

            // 创建路由
            const route: RouteRecordRaw = {
              path: relativePath,
              name: p.permissionCode || `route_${p.id}`,
              component: loadComponent(p.component),
              meta: { title: p.permissionName, icon: p.icon },
            }

            // 根据菜单路径的前缀来设置父路由的路径
            if (!routeGroups.has(prefix)) {
              routeGroups.set(prefix, [])
            }
            routeGroups.get(prefix)!.push(route)
          } catch (error) {
            console.warn(error)
          }
        }

        // 递归处理子节点
        if (p.children) processPermissions(p.children)
      }
    }

    processPermissions(permissionTree)

    // 注册路由（prefix为父路由路径，routes为子路由）
    for (const [prefix, routes] of routeGroups) {
      router.addRoute({ path: prefix, component: Layout, children: routes })
    }

    dynamicRoutesLoaded = true
  } catch (error) {
    handleErrorSilent(error)
    console.error('加载动态路由失败:', error)
  }
}

// 对外暴露，用于加载路由
export async function ensureDynamicRoutesLoaded() {
  await loadDynamicRoutes()
}

// 对外暴露，用于重置路由加载状态
export function resetDynamicRoutesState() {
  dynamicRoutesLoaded = false
}

export default router


