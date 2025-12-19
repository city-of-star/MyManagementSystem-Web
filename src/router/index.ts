import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../views/auth/Login.vue'
import Layout from '../layouts/Layout.vue'
import UserPage from '../views/system/user/UserPage.vue'
import RolePage from '../views/system/role/RolePage.vue'
import MenuPage from '../views/system/menu/MenuPage.vue'
import ParamPage from '../views/system/param/ParamPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/system',
    component: Layout,
    children: [
      { path: 'userPage', name: 'userPage', component: UserPage, meta: { title: '用户管理' } },
      { path: 'rolePage', name: 'rolePage', component: RolePage, meta: { title: '角色管理' } },
      { path: 'menuPage', name: 'menuPage', component: MenuPage, meta: { title: '菜单管理' } },
      { path: 'paramPage', name: 'paramPage', component: ParamPage, meta: { title: '参数管理' } },
      {
        path: '',
        redirect: '/system/userPage',
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 简单登录守卫：没有 accessToken 就不让进系统页
router.beforeEach((to, _from, next) => {
  const isLoggedIn = !!localStorage.getItem('accessToken')
  if (to.path !== '/login' && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/system/userPage')
  } else {
    next()
  }
})

export default router


