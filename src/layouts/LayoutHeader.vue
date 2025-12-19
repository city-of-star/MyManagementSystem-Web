<script setup lang="ts">
import { defineEmits } from 'vue'
import logoImg from '../assets/mms.svg'

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const handleLogout = () => {
  emit('logout')
}
</script>

<template>
  <header class="app-header">
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
</template>

<style scoped>
.app-header {
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
</style>


