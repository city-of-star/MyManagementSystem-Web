import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // 开发环境：将 /usercenter 代理到本地网关，避免浏览器跨域问题
      '/usercenter': {
        target: 'http://localhost:5092',
        changeOrigin: true,
      },
      // 开发环境：将 /base 代理到本地网关，避免浏览器跨域问题
      '/base': {
        target: 'http://localhost:5092',
        changeOrigin: true,
      },
    },
  },
})

