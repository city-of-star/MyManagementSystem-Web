<script setup lang="ts">
import logoImg from '@/assets/mms.svg'
import {logout} from "@/api/auth/auth.ts";
import {handleErrorSilent} from "@/utils/http";
import router, { resetDynamicRoutesState } from "@/router";
import {useAuthStore} from "@/store/auth/auth.ts";
import {useMenuStore} from "@/store/menu/menu.ts";
import {useTabsStore} from "@/store/tabs/tabs.ts";
import {useUserStore} from "@/store/user/user.ts";

const authStore = useAuthStore()
const userStore = useUserStore()
const menuStore = useMenuStore()
const tabsStore = useTabsStore()

// 退出按钮
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
      <div class="user-info">
        <div class="user-avatar">
          <svg
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
        <span class="username">{{ userStore.nickname }}</span>
      </div>
      <div class="divider" />
      <button class="logout-btn" type="button" @click="handleLogout">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>退出</span>
      </button>
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
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.user-info:hover {
  background: #f5f7fa;
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

.username {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
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
