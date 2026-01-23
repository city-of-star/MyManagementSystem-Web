<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, login, type LoginRequest } from '@/api/auth/auth.ts'
import { useAuthStore } from '@/store/auth/auth'
import { handleErrorToast } from '@/utils/http'
import {useUserStore} from "@/store/user/user.ts";

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// 表单
const form = ref<LoginRequest>({
  username: '',
  password: '',
})

// 登录动画
const loading = ref(false)

// 登录
const handleSubmit = async () => {
  loading.value = true
  try {
    // 登录
    const data = await login(form.value)
    // 持久化 token
    authStore.setTokens(data.accessToken, data.refreshToken)
    // 获取用户信息
    const user = await getCurrentUser();
    // 持久化用户信息
    userStore.setUser(user)
    // 跳转到首页
    await router.push('/home')
  } catch (error) {
    handleErrorToast(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-container">
      <section class="login-card">
        <header class="login-header">
          <div class="logo-circle">
            <span class="logo-dot"></span>
          </div>
          <div class="login-header-text">
            <h1 class="system-title">My Management System</h1>
            <p class="system-subtitle">通用后台管理系统 · 轻量 · 高效 · 易用</p>
          </div>
        </header>

        <h2 class="title">账号登录</h2>
        <p class="title-sub">请输入用户名和密码登录系统</p>

        <form class="form" @submit.prevent="handleSubmit">
          <label class="field">
            <span class="field-label">用户名</span>
            <input
              v-model="form.username"
              type="text"
              autocomplete="username"
              placeholder="请输入用户名"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">密码</span>
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
              required
            />
          </label>

          <button class="submit" type="submit" :disabled="loading">
            <span v-if="!loading">登 录</span>
            <span v-else>登录中...</span>
          </button>
        </form>

        <footer class="login-footer">
          <span>© {{ new Date().getFullYear() }} My Management System</span>
        </footer>
      </section>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: radial-gradient(circle at top, #eff6ff, #e5e7eb 55%, #dbeafe);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  padding: 28px 26px 24px;
  border-radius: 18px;
  background: linear-gradient(145deg, #ffffff, #f3f4f6);
  box-shadow:
    0 18px 40px rgba(148, 163, 184, 0.35),
    0 0 0 1px rgba(229, 231, 235, 0.9);
}

.login-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #bfdbfe, #60a5fa);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7);
}

.login-header-text {
  display: flex;
  flex-direction: column;
}

.system-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.system-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.title-sub {
  margin: 6px 0 18px;
  font-size: 13px;
  color: #6b7280;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #111827;
}

.field-label {
  margin-bottom: 4px;
}

.field input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 14px;
  transition: all 0.15s ease;
  background: #f9fafb;
  color: #111827;
}

.field input::placeholder {
  color: #9ca3af;
}

.field input:focus {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.4),
    0 0 0 6px rgba(59, 130, 246, 0.18);
  background: #ffffff;
}

.submit {
  margin-top: 6px;
  padding: 9px 0;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 12px 26px rgba(59, 130, 246, 0.35);
}

.submit:hover:not(:disabled) {
  box-shadow: 0 16px 32px rgba(59, 130, 246, 0.45);
  transform: translateY(-1px);
}

.submit:disabled {
  opacity: 0.7;
  cursor: default;
  box-shadow: none;
  transform: none;
}

.error {
  margin-top: 10px;
  color: #ef4444;
  font-size: 13px;
}

.login-footer {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    padding: 22px 18px 20px;
  }

  .system-title {
    font-size: 16px;
  }
}
</style>


