<script setup lang="ts">
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// 监听路由变化，自动添加标签页
watch(
  () => route.fullPath,
  () => {
    if (route.meta?.title && route.path !== '/login') {
      tabsStore.addTab(route)
    }
  },
  { immediate: true }
)

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed(() => tabsStore.activeTab)

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuTab = ref<{ fullPath: string } | null>(null)

const hideContextMenu = () => {
  contextMenuVisible.value = false
  contextMenuTab.value = null
}

const handleOutsideClick = () => {
  if (contextMenuVisible.value) {
    hideContextMenu()
  }
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleOutsideClick)
})

const handleTabClick = (tab: { fullPath: string }) => {
  tabsStore.setActiveTab(tab.fullPath)
  router.push(tab.fullPath)
  hideContextMenu()
}

const closeTab = (tab: { fullPath: string }) => {
  const currentIndex = tabs.value.findIndex(t => t.fullPath === tab.fullPath)
  const isActive = activeTab.value === tab.fullPath

  // 如果关闭的是当前活动标签，需要先确定跳转目标
  if (isActive) {
    // 优先跳转到右侧标签，如果没有则跳转到左侧
    const nextTab = tabs.value[currentIndex + 1] || tabs.value[currentIndex - 1]

    tabsStore.removeTab(tab.fullPath)

    if (nextTab) {
      router.push(nextTab.fullPath)
    } else if (tabs.value.length > 0) {
      // 如果还有其他标签，跳转到第一个
      router.push(tabs.value[0].fullPath)
    } else {
      // 如果没有标签了，跳转到首页
      router.push('/home')
    }
  } else {
    tabsStore.removeTab(tab.fullPath)
  }
}

const handleTabClose = (e: MouseEvent, tab: { fullPath: string }) => {
  e.stopPropagation()
  closeTab(tab)
  hideContextMenu()
}

const handleContextMenu = (e: MouseEvent, tab: { fullPath: string }) => {
  e.preventDefault()
  contextMenuVisible.value = true
  contextMenuTab.value = tab
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
}

// 右键菜单操作
const handleRefreshPage = () => {
  if (!contextMenuTab.value) {
    hideContextMenu()
    return
  }

  const target = contextMenuTab.value
  const isCurrent = route.fullPath === target.fullPath

  if (!isCurrent) {
    // 如果选择的不是当前标签：先切换过去，不立即刷新
    router.push(target.fullPath)
  } else {
    // 刷新当前激活标签：通过 tabsStore 控制 RouterView 重新挂载
    tabsStore.refreshActiveTab()
  }

  hideContextMenu()
}

const handleCloseCurrent = () => {
  if (contextMenuTab.value) {
    closeTab(contextMenuTab.value)
  }
  hideContextMenu()
}

const handleCloseOthers = () => {
  if (!contextMenuTab.value) return

  const targetPath = contextMenuTab.value.fullPath

  // 关闭除当前外的其他标签
  tabs.value
    .filter(t => t.fullPath !== targetPath)
    .forEach(t => tabsStore.removeTab(t.fullPath))

  tabsStore.setActiveTab(targetPath)
  router.push(targetPath)
  hideContextMenu()
}

const handleCloseAll = () => {
  tabs.value.forEach(t => tabsStore.removeTab(t.fullPath))
  hideContextMenu()
  router.push('/home')
}
</script>

<template>
  <div class="layout-tabs" v-if="tabs.length > 0">
    <div class="tabs-container">
      <div
        v-for="tab in tabs"
        :key="tab.fullPath"
        class="tab-item"
        :class="{ active: activeTab === tab.fullPath }"
        @click="handleTabClick(tab)"
        @contextmenu="handleContextMenu($event, tab)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <span
          v-if="tabs.length > 1"
          class="tab-close"
          @click="handleTabClose($event, tab)"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenuVisible"
      class="tab-context-menu"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="handleRefreshPage">刷新页面</div>
      <div class="menu-divider" />
      <div class="menu-item" @click="handleCloseCurrent">关闭当前</div>
      <div class="menu-item" @click="handleCloseOthers">关闭其他</div>
      <div class="menu-divider" />
      <div class="menu-item danger" @click="handleCloseAll">全部关闭</div>
    </div>
  </div>
</template>

<style scoped>
.layout-tabs {
  background: #ffffff;
  border-bottom: 1px solid #e8ebf0;
  padding: 0 16px;
  height: 42px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tabs-container {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;
}

.tabs-container::-webkit-scrollbar {
  height: 4px;
}

.tabs-container::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-container::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}

.tabs-container::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  background: #f5f7fa;
  color: #595959;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid transparent;
  position: relative;
  min-width: 80px;
  max-width: 200px;
}

.tab-item:hover {
  background: #f0f2f5;
  color: #262626;
}

.tab-item.active {
  background: #ffffff;
  color: #1677ff;
  font-weight: 500;
  border-color: #e5e6eb;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
  z-index: 1;
}

.tab-item.active::before {
  display: none;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  color: #8c8c8c;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.tab-close:hover {
  background: #e6f7ff;
  color: #1677ff;
}

.tab-item.active .tab-close {
  color: #1677ff;
}

.tab-item.active .tab-close:hover {
  background: #e6f7ff;
  color: #0958d9;
}

.tab-context-menu {
  position: fixed;
  z-index: 2000;
  min-width: 140px;
  padding: 6px 0;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  font-size: 13px;
  color: #4e5969;
}

.menu-item {
  padding: 6px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background-color: #f5f7fa;
  color: #1677ff;
}

.menu-item.danger {
  color: #e54848;
}

.menu-item.danger:hover {
  background-color: #fff1f0;
  color: #cf1322;
}

.menu-divider {
  margin: 4px 0;
  height: 1px;
  background-color: #f2f3f5;
}
</style>

