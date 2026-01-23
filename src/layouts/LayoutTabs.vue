<script setup lang="ts">
import { computed, watch } from 'vue'
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

const handleTabClick = (tab: { fullPath: string }) => {
  tabsStore.setActiveTab(tab.fullPath)
  router.push(tab.fullPath)
}

const handleTabClose = (e: MouseEvent, tab: { fullPath: string }) => {
  e.stopPropagation()

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

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  // 可以在这里添加右键菜单功能（关闭其他、关闭左侧、关闭右侧等）
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
  border-radius: 6px 6px 0 0;
  background: #f5f7fa;
  color: #595959;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid transparent;
  border-bottom: none;
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
  border-color: #e8ebf0;
  border-top-color: #1677ff;
  border-top-width: 2px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1;
}

.tab-item.active::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #1677ff;
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
</style>

