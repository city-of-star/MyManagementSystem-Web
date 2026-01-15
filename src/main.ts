import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import './style.css'
import App from '@/App.vue'
import router, { ensureDynamicRoutesLoaded } from '@/router'
import pinia from '@/store'
import { useAuthStore } from '@/store/auth/auth'

const app = createApp(App)

// 全局注册 Element Plus，并配置中文语言
app.use(ElementPlus, {locale: zhCn})

// 先挂载 Pinia，再根据登录状态预加载动态路由，最后再挂载 Router 和应用
app.use(pinia)

async function bootstrap() {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.accessToken || !!localStorage.getItem('accessToken')

  // 如果已登录，则在应用挂载前预加载动态路由，避免首次解析路由时匹配不到
  if (isLoggedIn) {
    await ensureDynamicRoutesLoaded()
  }

  app.use(router)
  await router.isReady()
  app.mount('#app')
}

void bootstrap()
