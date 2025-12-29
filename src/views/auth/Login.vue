<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, type LoginRequest } from '@/api/auth/auth'
import { useAuthStore } from '@/store/auth/auth'
import { handleErrorToast } from '@/utils/http'

const router = useRouter()
const authStore = useAuthStore()

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
    // 跳转到用户管理页面
    await router.push({name: 'userPage'})
  } catch (error) {
    handleErrorToast(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-panel">
      <section class="login-left">
        <h1 class="system-title">My Management System</h1>
        <p class="system-subtitle">通用后台管理系统 · 用户 / 角色 / 菜单 / 参数管理</p>
        <ul class="feature-list">
          <li>基于 Vue3 + Vite + TypeScript</li>
          <li>后端 Spring Boot 微服务架构</li>
          <li>支持 JWT 双 Token 认证</li>
        </ul>
      </section>

      <section class="login-card">
        <h2 class="title">账号登录</h2>
        <p class="title-sub">请输入用户名和密码登录系统</p>

        <form class="form" @submit.prevent="handleSubmit">
          <label class="field">
            <span>用户名</span>
            <input v-model="form.username" type="text" autocomplete="username" placeholder="请输入用户名" required />
          </label>

          <label class="field">
            <span>密码</span>
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
              required
            />
          </label>

          <button class="submit" type="submit" :disabled="loading">
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </form>
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
  background: radial-gradient(circle at top left, #1d4ed8, #0f172a 55%, #020617);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-panel {
  width: 100%;
  max-width: 1080px;
  margin: 32px auto;
  padding: 32px 40px;
  border-radius: 22px;
  background: radial-gradient(circle at top left, #0f172a, #020617 65%);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.9);
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 32px;
  color: #e5e7eb;
}

.login-left {
  border-right: 1px solid rgba(75, 85, 99, 0.6);
  padding-right: 32px;
}

.system-title {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: #e5e7eb;
}

.system-subtitle {
  margin: 0 0 20px;
  font-size: 14px;
  color: #9ca3af;
}

.feature-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.7;
}

.login-card {
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 55%);
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
}

.title-sub {
  margin: 6px 0 18px;
  font-size: 13px;
  color: #9ca3af;
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
  color: #374151;
}

.field span {
  margin-bottom: 4px;
}

.field input {
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  outline: none;
  font-size: 14px;
  transition: all 0.15s ease;
}

.field input::placeholder {
  color: #9ca3af;
}

.field input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.12);
}

.submit {
  margin-top: 10px;
  padding: 9px 0;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.submit:hover:not(:disabled) {
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
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

@media (max-width: 900px) {
  .login-panel {
    width: 100%;
    margin: 0 16px;
    grid-template-columns: 1fr;
    padding: 24px 22px;
  }

  .login-left {
    border-right: none;
    border-bottom: 1px solid #eef2ff;
    padding-right: 0;
    padding-bottom: 18px;
    margin-bottom: 10px;
  }
}
</style>


