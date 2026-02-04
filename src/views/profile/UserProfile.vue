<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/store/user/user'
import { getCurrentUser } from '@/api/auth/auth'
import { changeUserPassword, type UserPasswordChangeRequest } from '@/api/system/user/user'
import { handleErrorSilent, handleErrorToast } from '@/utils/http'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const user = computed(() => userStore)

// 修改密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordLoading = ref(false)
const passwordDialogVisible = ref(false)

const handleChangePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请输入旧密码和新密码')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }

  if (!user.value.id) {
    ElMessage.error('当前用户信息异常，请重新登录后重试')
    return
  }

  const payload: UserPasswordChangeRequest = {
    oldPassword: passwordForm.value.oldPassword,
    newPassword: passwordForm.value.newPassword,
  }

  passwordLoading.value = true
  try {
    await changeUserPassword(payload)
    ElMessage.success('修改密码成功')
    passwordForm.value.oldPassword = ''
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
    passwordDialogVisible.value = false
  } catch (error) {
    handleErrorToast(error)
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  try {
    const data = await getCurrentUser()
    userStore.setUser(data)
  } catch (error) {
    handleErrorSilent(error)
  }
})
</script>

<template>
  <main class="profile-page">
    <section class="profile-card">
      <header class="profile-header">
        <div class="avatar">
          <span v-if="user.avatar" class="avatar-image">
            <img :src="user.avatar" alt="头像" />
          </span>
          <span v-else class="avatar-fallback">
            {{ (user.nickname || user.username || 'U').charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="profile-main">
          <h1 class="name">
            {{ user.nickname || user.realName || user.username || '未设置昵称' }}
          </h1>
          <p class="sub">
            账号：{{ user.username || '-' }}
          </p>
        </div>
      </header>

      <section class="sections">
        <section class="profile-section profile-section--wide">
          <header class="section-header">
            <h2 class="section-title">基本信息</h2>
            <p class="section-subtitle">当前账号的基础资料</p>
          </header>
          <div class="info-list">
            <div class="info-row">
              <div class="info-label">昵称</div>
              <div class="info-value">{{ user.nickname || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">真实姓名</div>
              <div class="info-value">{{ user.realName || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">邮箱</div>
              <div class="info-value">{{ user.email || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">手机号</div>
              <div class="info-value">{{ user.phone || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">性别</div>
              <div class="info-value">
                <span v-if="user.gender === 1">男</span>
                <span v-else-if="user.gender === 2">女</span>
                <span v-else>未知</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">状态</div>
              <div class="info-value">
                <span
                  class="status"
                  :class="user.status === 1 ? 'status-active' : 'status-inactive'"
                >
                  {{ user.status === 1 ? '启用' : '禁用' }}
                </span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">主部门</div>
              <div class="info-value">
                {{ user.primaryDept?.deptName || '-' }}
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">主岗位</div>
              <div class="info-value">
                {{ user.primaryPost?.postName || '-' }}
              </div>
            </div>
          </div>
        </section>

        <section class="profile-section profile-section--half">
          <header class="section-header">
            <h2 class="section-title">登录信息</h2>
            <p class="section-subtitle">最近一次登录记录</p>
          </header>
          <div class="info-list">
            <div class="info-row">
              <div class="info-label">最后登录时间</div>
              <div class="info-value">{{ user.lastLoginTime || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">最后登录 IP</div>
              <div class="info-value">{{ user.lastLoginIp || '-' }}</div>
            </div>
          </div>
        </section>

        <section class="profile-section profile-section--half">
          <header class="section-header section-header--inline">
            <div>
              <h2 class="section-title">账户安全</h2>
              <p class="section-subtitle">建议定期修改密码，保障账号安全</p>
            </div>
            <el-button size="small" type="primary" text @click="passwordDialogVisible = true">
              修改密码
            </el-button>
          </header>
          <ul class="security-tips">
            <li>密码长度不少于 8 位，包含大小写字母、数字、特殊字符中的至少3种</li>
            <li>避免与其他系统使用相同密码</li>
          </ul>
        </section>
      </section>

      <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        width="420px"
        destroy-on-close
      >
        <div class="password-form">
          <div class="password-field">
            <label class="password-label">旧密码</label>
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入旧密码"
            />
          </div>
          <div class="password-field">
            <label class="password-label">新密码</label>
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码"
            />
          </div>
          <div class="password-field">
            <label class="password-label">确认新密码</label>
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
            />
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="passwordDialogVisible = false">取 消</el-button>
            <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
              确 定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </section>
  </main>
</template>

<style scoped>
.profile-page {
  padding: 20px 24px;
}

.profile-card {
  max-width: 880px;
  margin: 0 auto;
  padding: 16px 18px 14px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.06),
    0 0 0 1px rgba(226, 232, 240, 0.9);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  overflow: hidden;
}

.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.profile-main .name {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.profile-main .sub {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.profile-section {
  margin-top: 20px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.sections {
  margin-top: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 10px 12px;
}

.profile-section--wide {
  grid-column: 1 / -1;
}

.profile-section--half {
  align-self: flex-start;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}

.section-header--inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.section-subtitle {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px 18px;
}

.info-list {
  border-top: 1px solid #e5e7eb;
  margin-top: 4px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.info-label {
  min-width: 72px;
  color: #6b7280;
}

.info-value {
  flex: 1;
  text-align: right;
  color: #111827;
  word-break: break-all;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.label {
  color: #9ca3af;
}

.value {
  color: #111827;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  font-size: 12px;
  border-radius: 999px;
}

.status-active {
  background: #ecfdf3;
  color: #15803d;
}

.status-inactive {
  background: #fef2f2;
  color: #b91c1c;
}

.security-tips {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: #6b7280;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.password-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.password-label {
  font-size: 13px;
  color: #4b5563;
}

.dialog-footer {
  display: inline-flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .profile-card {
    padding: 14px 12px 12px;
  }

  .profile-header {
    align-items: flex-start;
  }

  .sections {
    grid-template-columns: minmax(0, 1fr);
  }

  .profile-section--wide {
    grid-column: auto;
  }
}
</style>

