import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 开发环境：将 /usercenter 代理到本地网关，避免浏览器跨域问题
      '/usercenter': {
        target: 'http://localhost:5092',
        changeOrigin: true,
      },
    },
  },
})

