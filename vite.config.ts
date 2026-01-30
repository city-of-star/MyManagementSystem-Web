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

    // ------ 这些配置将来需要删除 ------
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: {
      host: '192.168.237.157' ,
      port: 5173,
    },
    // ------ 这些配置将来需要删除 ------


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

