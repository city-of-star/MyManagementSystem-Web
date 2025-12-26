import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TabItem {
  path: string
  name: string
  title: string
  fullPath: string
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([])
  const activeTab = ref<string>('')

  // 添加标签页
  const addTab = (route: RouteLocationNormalized) => {
    const title = (route.meta?.title as string) || route.name?.toString() || '未命名'
    const fullPath = route.fullPath
    const path = route.path
    const name = route.name?.toString() || ''

    // 检查是否已存在
    const exists = tabs.value.find(tab => tab.fullPath === fullPath)
    if (!exists) {
      tabs.value.push({
        path,
        name,
        title,
        fullPath,
      })
    }
    activeTab.value = fullPath
  }

  // 移除标签页
  const removeTab = (fullPath: string) => {
    const index = tabs.value.findIndex(tab => tab.fullPath === fullPath)
    if (index > -1) {
      tabs.value.splice(index, 1)
    }
  }

  // 设置活动标签页
  const setActiveTab = (fullPath: string) => {
    activeTab.value = fullPath
  }

  // 关闭其他标签页
  const closeOtherTabs = (fullPath: string) => {
    tabs.value = tabs.value.filter(tab => tab.fullPath === fullPath)
    activeTab.value = fullPath
  }

  // 关闭所有标签页
  const closeAllTabs = () => {
    tabs.value = []
    activeTab.value = ''
  }

  // 关闭左侧标签页
  const closeLeftTabs = (fullPath: string) => {
    const index = tabs.value.findIndex(tab => tab.fullPath === fullPath)
    if (index > -1) {
      tabs.value = tabs.value.slice(index)
    }
  }

  // 关闭右侧标签页
  const closeRightTabs = (fullPath: string) => {
    const index = tabs.value.findIndex(tab => tab.fullPath === fullPath)
    if (index > -1) {
      tabs.value = tabs.value.slice(0, index + 1)
    }
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    setActiveTab,
    closeOtherTabs,
    closeAllTabs,
    closeLeftTabs,
    closeRightTabs,
  }
})

