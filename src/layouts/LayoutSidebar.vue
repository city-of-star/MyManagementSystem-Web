<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import type { MenuItem } from '@/config/menu/menuConfig'

const props = defineProps<{
  menus: MenuItem[]
}>()

const route = useRoute()
const expandedMenus = ref<Set<string>>(new Set())

// 检查路径是否匹配（包括子路径）
const isActive = (path?: string): boolean => {
  if (!path) return false
  return route.path === path || route.path.startsWith(path + '/')
}

// 检查菜单项或其子项是否激活
const isMenuActive = (menu: MenuItem): boolean => {
  if (menu.path && isActive(menu.path)) {
    return true
  }
  if (menu.children) {
    return menu.children.some(child => isMenuActive(child))
  }
  return false
}

// 切换菜单展开/折叠
const toggleMenu = (label: string) => {
  if (expandedMenus.value.has(label)) {
    expandedMenus.value.delete(label)
  } else {
    expandedMenus.value.add(label)
  }
}

// 初始化时展开包含当前路由的菜单
const initExpandedMenus = () => {
  props.menus.forEach(menu => {
    if (menu.children && isMenuActive(menu)) {
      expandedMenus.value.add(menu.label)
    }
  })
}

initExpandedMenus()

// 图标映射
const getIcon = (icon?: string) => {
  const iconMap: Record<string, string> = {
    system: 'M10.5 6a7.5 7.5 0 1 0-7.5 7.5h7.5V6zM13.5 6a7.5 7.5 0 1 1-7.5 7.5h7.5V6z',
  }
  return iconMap[icon || ''] || 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6'
}
</script>

<template>
  <aside class="app-sider">
    <nav class="menu">
      <div
        v-for="menu in menus"
        :key="menu.label"
        class="menu-group"
      >
        <!-- 目录项 -->
        <div
          v-if="menu.children && menu.children.length > 0"
          class="menu-folder"
          :class="{ 
            active: isMenuActive(menu),
            expanded: expandedMenus.has(menu.label)
          }"
          @click="toggleMenu(menu.label)"
        >
          <div class="menu-folder-content">
            <svg
              class="menu-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                :d="getIcon(menu.icon)"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="menu-label">{{ menu.label }}</span>
            <svg
              class="menu-arrow"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- 子菜单 -->
        <div
          v-if="menu.children && expandedMenus.has(menu.label)"
          class="submenu"
        >
          <RouterLink
            v-for="child in menu.children"
            :key="child.path"
            :to="child.path!"
            class="submenu-item"
            :class="{ active: isActive(child.path) }"
          >
            <span class="submenu-dot" />
            <span class="submenu-label">{{ child.label }}</span>
          </RouterLink>
        </div>

        <!-- 普通菜单项（没有子菜单的情况） -->
        <RouterLink
          v-else-if="menu.path"
          :to="menu.path"
          class="menu-item"
          :class="{ active: isActive(menu.path) }"
        >
          <svg
            class="menu-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              :d="getIcon(menu.icon)"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="menu-label">{{ menu.label }}</span>
        </RouterLink>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.app-sider {
  width: 240px;
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.app-sider::-webkit-scrollbar {
  width: 6px;
}

.app-sider::-webkit-scrollbar-track {
  background: transparent;
}

.app-sider::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.app-sider::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

.menu {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-group {
  display: flex;
  flex-direction: column;
}

.menu-folder {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.menu-folder-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.85);
}

.menu-folder:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-folder.active {
  background: rgba(22, 119, 255, 0.15);
}

.menu-folder.active .menu-folder-content {
  color: #1677ff;
}

.menu-folder.expanded .menu-arrow {
  transform: rotate(90deg);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(22, 119, 255, 0.2), rgba(22, 119, 255, 0.1));
  color: #1677ff;
  font-weight: 500;
  border-left: 3px solid #1677ff;
}

.menu-icon {
  flex-shrink: 0;
  color: inherit;
}

.menu-arrow {
  margin-left: auto;
  transition: transform 0.2s ease;
  color: inherit;
  flex-shrink: 0;
  opacity: 0.6;
}

.menu-folder:hover .menu-arrow,
.menu-folder.active .menu-arrow {
  opacity: 1;
}

.menu-label {
  font-size: 14px;
  flex: 1;
}

.submenu {
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  margin-top: 4px;
  gap: 2px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s ease;
  position: relative;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
}

.submenu-item.active {
  background: rgba(22, 119, 255, 0.15);
  color: #1677ff;
  font-weight: 500;
}

.submenu-item.active .submenu-dot {
  background: #1677ff;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.2);
}

.submenu-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.submenu-label {
  flex: 1;
}
</style>
