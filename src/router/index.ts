import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import SystemLayout from '../views/SystemLayout.vue'
import UserPage from '../views/system/UserPage.vue'
import RolePage from '../views/system/RolePage.vue'
import MenuPage from '../views/system/MenuPage.vue'
import ParamPage from '../views/system/ParamPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    redirect: '/system/user',
  },
  {
    path: '/system',
    component: SystemLayout,
    children: [
      { path: 'user', name: 'SystemUser', component: UserPage },
      { path: 'role', name: 'SystemRole', component: RolePage },
      { path: 'menu', name: 'SystemMenu', component: MenuPage },
      { path: 'param', name: 'SystemParam', component: ParamPage },
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


