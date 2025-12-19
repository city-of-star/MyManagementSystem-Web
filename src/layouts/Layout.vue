<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth/auth'
import { logout } from '../api/auth/auth'
import { handleErrorSilent } from '../utils/http/errorHandler'
import LayoutHeader from './LayoutHeader.vue'
import LayoutSidebar from './LayoutSidebar.vue'
import LayoutBreadcrumb from './LayoutBreadcrumb.vue'
import { menus } from '../config/menuConfig'

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
        <div class="content-inner">
          <LayoutBreadcrumb />
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
  background: #f3f4f6;
}

.body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.content {
  flex: 1;
  padding: 16px 18px;
  overflow: auto;
}

.content-inner {
  min-height: calc(100vh - 56px - 32px);
  padding: 16px 18px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
}
</style>


