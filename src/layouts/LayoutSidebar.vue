<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { type MenuItem, useMenuStore } from "@/store/menu/menu.ts";
import { iconMap } from '@/assets/icon/icons'

const route = useRoute()
const expandedMenus = ref<Set<string>>(new Set())

// 使用动态菜单
const menuStore = useMenuStore()
const menus = computed(() => menuStore.menus)

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
  menus.value.forEach(menu => {
    if (menu.children && isMenuActive(menu)) {
      expandedMenus.value.add(menu.label)
    }
  })
}

initExpandedMenus()

// 解析菜单 icon，大小写不敏感；不匹配则不显示
const resolveIcon = (icon?: string) => {
  if (!icon) return null
  const entry = Object.entries(iconMap).find(([key]) => key.toLowerCase() === icon.toLowerCase())
  return entry ? entry[1] : null
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
          v-if="menu.children"
          class="menu-folder"
          :class="{
            active: isMenuActive(menu),
            expanded: expandedMenus.has(menu.label)
          }"
          @click="toggleMenu(menu.label)"
        >
          <div class="menu-folder-content">
            <component
              v-if="resolveIcon(menu.icon)"
              :is="resolveIcon(menu.icon)"
              class="menu-icon-comp"
            />
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
          v-if="menu.children && menu.children.length > 0 && expandedMenus.has(menu.label)"
          class="submenu"
        >
          <RouterLink
            v-for="child in menu.children"
            :key="child.path"
            :to="child.path!"
            class="submenu-item"
            :class="{ active: isActive(child.path) }"
          >
            <component
              v-if="resolveIcon(child.icon)"
              :is="resolveIcon(child.icon)"
              class="menu-icon-comp"
            />
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
          <component
            v-if="resolveIcon(menu.icon)"
            :is="resolveIcon(menu.icon)"
            class="menu-icon-comp"
          />
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

.menu-icon-comp {
  width: 16px;
  height: 16px;
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

.submenu-label {
  flex: 1;
}
</style>
