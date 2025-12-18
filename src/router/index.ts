import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../views/auth/Login.vue'
import SystemLayout from '../views/SystemLayout.vue'
import UserPage from '../views/system/user/UserPage.vue'
import RolePage from '../views/system/role/RolePage.vue'
import MenuPage from '../views/system/menu/MenuPage.vue'
import ParamPage from '../views/system/param/ParamPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/system',
    name: 'system',
    component: SystemLayout,
    children: [
      { path: 'userPage', name: 'userPage', component: UserPage },
      { path: 'rolePage', name: 'rolePage', component: RolePage },
      { path: 'menuPage', name: 'menuPage', component: MenuPage },
      { path: 'paramPage', name: 'paramPage', component: ParamPage },
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
    next('/system/user')
  } else {
    next()
  }
})

export default router


