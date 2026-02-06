<script setup lang="ts">
import logoImg from '@/assets/mms.svg'
import { logout } from '@/api/auth/auth'
import { handleErrorSilent } from '@/utils/http'
import router, { resetDynamicRoutesState } from '@/router'
import { useAuthStore } from '@/store/auth/auth'
import { useMenuStore } from '@/store/menu/menu'
import { useTabsStore } from '@/store/tabs/tabs'
import { useUserStore } from '@/store/user/user'

const authStore = useAuthStore()
const userStore = useUserStore()
const menuStore = useMenuStore()
const tabsStore = useTabsStore()

// 退出登录
const handleLogout = async () => {
  const refreshToken = authStore.refreshToken || localStorage.getItem('refreshToken')

  try {
    if (refreshToken) {
      await logout({ refreshToken })
    }
  } catch (error) {
    handleErrorSilent(error)
  } finally {
    // 清除相关数据
    authStore.clearTokens()
    userStore.clearUser()
    menuStore.clearMenus()
    tabsStore.closeAllTabs()
    // 重置路由状态
    resetDynamicRoutesState()
    await router.push('/login')
  }
}

// 下拉菜单指令
const handleUserCommand = async (command: string) => {
  if (command === 'profile') {
    await router.push('/profile')
  } else if (command === 'logout') {
    await handleLogout()
  }
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo-area">
        <img :src="logoImg" alt="Logo" class="logo-mark" />
        <div class="logo-text">
          <div class="name">My Management System</div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click" @command="handleUserCommand">
        <div class="user-info">
          <div class="user-avatar">
            <img
              v-if="userStore.avatar"
              :src="userStore.avatar"
              alt="头像"
              class="user-avatar-img"
            />
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="username">{{ userStore.nickname || userStore.username || '未登录' }}</span>
          <span class="caret">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  border-bottom: 1px solid #e8ebf0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
  display: block;
}

.logo-text .name {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #1677ff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.user-info:hover {
  background: #f5f7fa;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff 0%, #722ed1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(22, 119, 255, 0.2);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.caret {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b0b3b8;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e8ebf0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e8ebf0;
  background: #ffffff;
  color: #595959;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #fff1f0;
  border-color: #ffccc7;
  color: #cf1322;
}

.logout-btn svg {
  flex-shrink: 0;
}
</style>
