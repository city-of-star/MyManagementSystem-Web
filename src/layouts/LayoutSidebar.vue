<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import type { MenuItem } from '@/config/menu/menuConfig'

const props = defineProps<{
  menus: MenuItem[]
}>()

const route = useRoute()

const activePath = computed(() => route.path)
</script>

<template>
  <aside class="app-sider">
    <div class="sider-title">系统管理</div>
    <nav class="menu">
      <RouterLink
        v-for="item in menus"
        :key="item.path"
        class="menu-item"
        :class="{ active: activePath === item.path }"
        :to="item.path"
      >
        <span class="dot" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.app-sider {
  width: 220px;
  background: #111827;
  border-right: 1px solid #1f2937;
  padding: 14px 10px;
  color: #9ca3af;
}

.sider-title {
  margin: 0 0 10px;
  padding: 0 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  color: #e5e7eb;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.12s ease, color 0.12s ease;
}

.menu-item .dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid #4b5563;
}

.menu-item:hover {
  background: #1f2937;
}

.menu-item.active {
  background: linear-gradient(90deg, #1d4ed8, #3b82f6);
  color: #ffffff;
}

.menu-item.active .dot {
  background: #ffffff;
  border-color: #ffffff;
}
</style>


