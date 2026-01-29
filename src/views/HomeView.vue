<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { getSystemOverview, type SystemOverview } from '@/api/system/overview'
import { getRecentFailedLoginLogs, type UserLoginLog } from '@/api/auth/loginLog'

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const overview = ref<SystemOverview | null>(null)

const loadingLogs = ref(false)
const logsErrorMsg = ref<string | null>(null)
const recentFailedLogs = ref<UserLoginLog[]>([])

const statusText = computed(() => {
  if (!overview.value) return '未知'
  switch (overview.value.status) {
    case 'UP':
      return '运行正常'
    case 'DEGRADED':
      return '部分异常'
    case 'DOWN':
      return '故障'
    default:
      return '未知'
  }
})

const statusTagClass = computed(() => {
  if (!overview.value) return 'status-tag default'
  switch (overview.value.status) {
    case 'UP':
      return 'status-tag success'
    case 'DEGRADED':
      return 'status-tag warning'
    case 'DOWN':
      return 'status-tag danger'
    default:
      return 'status-tag default'
  }
})

const loadOverview = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const data = await getSystemOverview()
    overview.value = data
  } catch (e) {
    errorMsg.value = '获取系统运行信息失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const loadFailedLogs = async () => {
  loadingLogs.value = true
  logsErrorMsg.value = null
  try {
    const data = await getRecentFailedLoginLogs(5)
    recentFailedLogs.value = data
  } catch (e) {
    logsErrorMsg.value = '获取登录告警记录失败'
  } finally {
    loadingLogs.value = false
  }
}

onMounted(() => {
  loadOverview()
  loadFailedLogs()
})
</script>

<template>
  <div class="home-page">
    <!-- 顶部系统状态 -->
    <section class="overview-header">
      <div class="header-left">
        <div class="title-row">
          <h1 class="page-title">系统运行总览</h1>
          <span :class="statusTagClass">{{ statusText }}</span>
        </div>
        <p class="page-desc">
          这里展示当前管理系统的整体运行状态、MySQL / Redis / Nacos 等关键组件的可用性，以及基础资源占用情况。
        </p>
        <div class="uptime" v-if="overview">
          <span class="uptime-label">已稳定运行：</span>
          <span class="uptime-value">{{ overview.uptime }}</span>
        </div>
      </div>
      <div class="header-right" v-if="overview">
        <div class="status-card">
          <div class="status-title">MySQL</div>
          <div class="status-value" :class="overview.mysqlOk ? 'ok' : 'error'">
            {{ overview.mysqlOk ? '连接正常' : '连接异常' }}
          </div>
          <div class="status-desc">通过系统配置表进行实时连通性检测</div>
        </div>
        <div class="status-card">
          <div class="status-title">Redis</div>
          <div class="status-value" :class="overview.redisOk ? 'ok' : 'error'">
            {{ overview.redisOk ? '连接正常' : '连接异常' }}
          </div>
          <div class="status-desc">通过 PING 检测缓存服务健康状态</div>
        </div>
      </div>
    </section>

    <!-- 加载/错误状态 -->
    <section v-if="loading || errorMsg" class="state-section">
      <div v-if="loading" class="state-text">正在加载系统运行数据...</div>
      <div v-else class="state-text error">{{ errorMsg }}</div>
    </section>

    <!-- 运行指标 + 告警列表 -->
    <section v-else-if="overview" class="content-section">
      <div class="metrics-section">
        <div class="metric-card">
          <div class="metric-title">JVM 内存使用</div>
          <div class="metric-main">
            <div class="metric-number">
              {{ overview.jvmMemoryUsedMb }} / {{ overview.jvmMemoryTotalMb }} MB
            </div>
            <div class="metric-sub">使用率 {{ overview.jvmMemoryUsagePercent }}%</div>
          </div>
          <div class="progress-bar">
            <div
              class="progress-inner"
              :style="{ width: Math.min(overview.jvmMemoryUsagePercent, 100) + '%' }"
            />
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-title">在线用户数</div>
          <div class="metric-main">
            <div class="metric-number">{{ overview.onlineUsers ?? 0 }}</div>
            <div class="metric-sub">基于有效 Refresh Token 统计当前在线账号数量</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-title">系统配置数量</div>
          <div class="metric-main">
            <div class="metric-number">{{ overview.configTotal ?? 0 }}</div>
            <div class="metric-sub">包含业务参数、系统参数等基础配置</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-title">Nacos 配置中心</div>
          <ul class="metric-list small">
            <li>
              <span>服务器</span>
              <span class="mono-text">{{ overview.nacosServerAddr }}</span>
            </li>
            <li>
              <span>命名空间</span>
              <span class="mono-text">{{ overview.nacosNamespace }}</span>
            </li>
            <li>
              <span>分组</span>
              <span class="mono-text">{{ overview.nacosGroup }}</span>
            </li>
          </ul>
        </div>

        <div class="metric-card">
          <div class="metric-title">服务健康小结</div>
          <ul class="metric-list">
            <li>
              <span>核心服务</span>
              <span :class="overview.status === 'DOWN' ? 'danger-text' : 'success-text'">
                {{ statusText }}
              </span>
            </li>
            <li>
              <span>MySQL</span>
              <span :class="overview.mysqlOk ? 'success-text' : 'danger-text'">
                {{ overview.mysqlOk ? '连接正常' : '连接异常' }}
              </span>
            </li>
            <li>
              <span>Redis</span>
              <span :class="overview.redisOk ? 'success-text' : 'danger-text'">
                {{ overview.redisOk ? '连接正常' : '连接异常' }}
              </span>
            </li>
            <li>
              <span>内存压力</span>
              <span
                :class="
                  overview.jvmMemoryUsagePercent >= 85
                    ? 'danger-text'
                    : overview.jvmMemoryUsagePercent >= 70
                      ? 'warning-text'
                      : 'success-text'
                "
              >
                {{ overview.jvmMemoryUsagePercent }}%
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="logs-section">
        <div class="logs-card">
          <div class="logs-header">
            <div class="logs-title">最近登录告警</div>
            <div class="logs-subtitle">展示最近的登录失败记录，便于排查安全风险</div>
          </div>
          <div v-if="loadingLogs" class="logs-state">正在加载登录告警记录...</div>
          <div v-else-if="logsErrorMsg" class="logs-state error">{{ logsErrorMsg }}</div>
          <ul v-else class="logs-list">
            <li v-if="recentFailedLogs.length === 0" class="logs-empty">
              近期没有登录失败记录，一切正常。
            </li>
            <li v-for="item in recentFailedLogs" :key="item.id" class="logs-item">
              <div class="logs-main">
                <span class="logs-time">{{ item.loginTime }}</span>
                <span class="logs-user">{{ item.username || '未知用户' }}</span>
                <span class="logs-ip">IP: {{ item.loginIp }}</span>
              </div>
              <div class="logs-message">{{ item.loginMessage || '登录失败' }}</div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1677ff 0%, #2f54eb 50%, #0958d9 100%);
  color: #ffffff;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.status-tag {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.status-tag.success {
  background: rgba(82, 196, 26, 0.2);
  border-color: rgba(82, 196, 26, 0.8);
}

.status-tag.warning {
  background: rgba(250, 173, 20, 0.2);
  border-color: rgba(250, 173, 20, 0.8);
}

.status-tag.danger {
  background: rgba(245, 34, 45, 0.2);
  border-color: rgba(245, 34, 45, 0.8);
}

.page-desc {
  margin: 0;
  margin-bottom: 8px;
  font-size: 13px;
  opacity: 0.9;
}

.uptime {
  margin-top: 4px;
  font-size: 13px;
}

.uptime-label {
  opacity: 0.9;
}

.uptime-value {
  font-weight: 600;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.status-card {
  min-width: 220px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.status-title {
  font-size: 13px;
  opacity: 0.9;
}

.status-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 600;
}

.status-value.ok {
  color: #95de64;
}

.status-value.error {
  color: #ffccc7;
}

.status-desc {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.9;
}

.state-section {
  padding: 16px 18px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #f0f2f5;
}

.state-text {
  font-size: 13px;
  color: #4b5563;
}

.state-text.error {
  color: #d93025;
}

.content-section {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 16px 18px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #f0f2f5;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-title {
  font-size: 13px;
  color: #8c8c8c;
}

.metric-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-number {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.metric-sub {
  font-size: 12px;
  color: #9ca3af;
}

.progress-bar {
  margin-top: 6px;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #f0f2f5;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #52c41a, #faad14, #f5222d);
  transition: width 0.3s ease;
}

.metric-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.metric-list.small {
  font-size: 12px;
}

.metric-list li {
  display: flex;
  justify-content: space-between;
  color: #4b5563;
}

.success-text {
  color: #52c41a;
}

.warning-text {
  color: #faad14;
}

.danger-text {
  color: #f5222d;
}

.mono-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

.logs-section {
  display: flex;
  flex-direction: column;
}

.logs-card {
  padding: 16px 18px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #f0f2f5;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logs-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logs-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2933;
}

.logs-subtitle {
  font-size: 12px;
  color: #9ca3af;
}

.logs-state {
  font-size: 13px;
  color: #4b5563;
}

.logs-state.error {
  color: #d93025;
}

.logs-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.logs-empty {
  font-size: 13px;
  color: #9ca3af;
}

.logs-item {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
}

.logs-main {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #4b5563;
}

.logs-time {
  color: #6b7280;
}

.logs-user {
  font-weight: 500;
}

.logs-ip {
  color: #6b7280;
}

.logs-message {
  margin-top: 4px;
  font-size: 12px;
  color: #b91c1c;
}

@media (max-width: 1024px) {
  .overview-header {
    flex-direction: column;
  }

  .header-right {
    align-self: flex-start;
  }

  .content-section {
    grid-template-columns: 1fr;
  }

  .metrics-section {
    grid-template-columns: 1fr;
  }
}
</style>
