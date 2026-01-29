import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import Layout from '@/layouts/Layout.vue'
import UserProfile from '@/views/profile/UserProfile.vue'
import HomeView from '@/views/HomeView.vue'

import { useMenuStore } from '@/store/menu/menu'
import { useAuthStore } from '@/store/auth/auth'
import { convertPermissionTreeToMenu, convertPermissionToMap} from '@/utils/menu/menuUtils'
import { handleErrorSilent } from '@/utils/http'
import {getCurrentUserPermissionTree} from '@/api/system/permission/permission.ts'
import type { MenuItem } from '@/store/menu/menu'

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
  // 首页路由（不需要权限，所有用户都可以访问）
  {
    path: '/home',
    component: Layout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: '首页', icon: 'Home' },
      },
    ],
  },
  // 个人信息页面（所有登录用户可访问）
  {
    path: '/profile',
    component: Layout,
    children: [
      {
        path: '',
        name: 'profile',
        component: UserProfile,
        meta: { title: '个人信息', icon: 'User' },
      },
    ],
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
    next('/home')
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

    // 转换为菜单（保存到 pinia）
    const menuStore = useMenuStore()
    const dynamicMenus = convertPermissionTreeToMenu(permissionTree)

    // 手动添加首页菜单项到菜单列表最前面（不需要权限）
    const homeMenu: MenuItem = {
      label: '首页',
      icon: 'Home',
      path: '/home',
    }
    menuStore.setMenus([homeMenu, ...dynamicMenus])

    // 转换为 Map（键->父路由路径，值->子路由），用于构建路由
    const routeGroups = convertPermissionToMap(permissionTree)

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


