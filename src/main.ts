import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from '@/App.vue'
import router from '@/router'
import pinia from '@/store'

const app = createApp(App)

// 全局注册 Element Plus（组件 + 指令，例如 v-loading）
app.use(ElementPlus)

app.use(pinia)
app.use(router)

app.mount('#app')
