<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { logoutApi } from '../api/auth'
import { useAuthStore } from '../store/auth'
import logoImg from '../assets/mms.svg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activePath = computed(() => route.path)

const handleLogout = async () => {
  const refreshToken = authStore.refreshToken || localStorage.getItem('refreshToken')

  try {
    if (refreshToken) {
      await logoutApi({ refreshToken })
    }
  } catch (e) {
    // 登出失败也不阻塞前端清理
    console.error('调用登出接口失败:', e)
  }

  // 清理本地 token
  authStore.clearTokens()

  // 跳转到登录页
  await router.push('/login')
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="logo-area">
        <img :src="logoImg" alt="Logo" class="logo-mark" />
        <div class="logo-text">
          <div class="name">My Management System</div>
          <div class="sub">系统管理中心</div>
        </div>
      </div>
      <div class="header-right">
        <span class="welcome">欢迎回来，管理员</span>
        <button class="logout-btn" type="button" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <div class="body">
      <aside class="sider">
        <div class="sider-title">系统管理</div>
        <nav class="menu">
          <RouterLink
            to="/system/user"
            class="menu-item"
            :class="{ active: activePath === '/system/user' }"
          >
            <span class="dot"></span>
            <span>用户管理</span>
          </RouterLink>
          <RouterLink
            to="/system/role"
            class="menu-item"
            :class="{ active: activePath === '/system/role' }"
          >
            <span class="dot"></span>
            <span>角色管理</span>
          </RouterLink>
          <RouterLink
            to="/system/menu"
            class="menu-item"
            :class="{ active: activePath === '/system/menu' }"
          >
            <span class="dot"></span>
            <span>菜单管理</span>
          </RouterLink>
          <RouterLink
            to="/system/param"
            class="menu-item"
            :class="{ active: activePath === '/system/param' }"
          >
            <span class="dot"></span>
            <span>参数管理</span>
          </RouterLink>
        </nav>
      </aside>

      <main class="content">
        <div class="content-inner">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header {
  height: 56px;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #111827, #1f2937);
  color: #e5e7eb;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.4);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: contain;
  display: block;
}

.logo-text .name {
  font-size: 14px;
  font-weight: 600;
}

.logo-text .sub {
  font-size: 11px;
  color: #9ca3af;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.welcome {
  color: #d1d5db;
}

.logout-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(248, 113, 113, 0.9);
  background: transparent;
  color: #fecaca;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  background: rgba(248, 113, 113, 0.16);
}

.body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.sider {
  width: 220px;
  background: #111827;
  border-right: 1px solid #1f2937;
  padding: 14px 10px;
  color: #9ca3af;
}

.sider-title {
  margin: 0 0 10px;
  padding: 0 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  color: #e5e7eb;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.12s ease, color 0.12s ease;
}

.menu-item .dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid #4b5563;
}

.menu-item:hover {
  background: #1f2937;
}

.menu-item.active {
  background: linear-gradient(90deg, #1d4ed8, #3b82f6);
  color: #ffffff;
}

.menu-item.active .dot {
  background: #ffffff;
  border-color: #ffffff;
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


