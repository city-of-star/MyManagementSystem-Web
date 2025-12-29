<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'
import { logout } from '@/api/auth/auth'
import { handleErrorSilent } from '@/utils/http'
import LayoutHeader from '@/layouts/LayoutHeader.vue'
import LayoutSidebar from '@/layouts/LayoutSidebar.vue'
import LayoutTabs from '@/layouts/LayoutTabs.vue'
import { menus } from '@/config/menu/menuConfig'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  const refreshToken = authStore.refreshToken || localStorage.getItem('refreshToken')

  try {
    if (refreshToken) {
      await logout({ refreshToken })
    }
  } catch (error) {
    handleErrorSilent(error)
  } finally {
    authStore.clearTokens()
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="app-layout">
    <LayoutHeader @logout="handleLogout" />
    <div class="body">
      <LayoutSidebar :menus="menus" />
      <main class="content">
        <LayoutTabs />
        <div class="content-inner">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
}

.body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
}

.content-inner {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f0f2f5;
}

/* 滚动条样式 */
.content-inner::-webkit-scrollbar {
  width: 8px;
}

.content-inner::-webkit-scrollbar-track {
  background: transparent;
}

.content-inner::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 4px;
}

.content-inner::-webkit-scrollbar-thumb:hover {
  background: #8c8c8c;
}
</style>
