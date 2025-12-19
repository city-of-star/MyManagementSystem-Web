<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Crumb {
  label: string
  path?: string
}

const route = useRoute()

const crumbs = computed<Crumb[]>(() => {
  const list: Crumb[] = []
  const title = (route.meta?.title as string | undefined) || ''
  if (title) {
    list.push({ label: '系统管理', path: '/system' })
    list.push({ label: title })
  }
  return list
})
</script>

<template>
  <div class="app-breadcrumb" v-if="crumbs.length">
    <span
      v-for="(item, index) in crumbs"
      :key="index"
      class="crumb"
    >
      <span>{{ item.label }}</span>
      <span v-if="index < crumbs.length - 1" class="sep">/</span>
    </span>
  </div>
</template>

<style scoped>
.app-breadcrumb {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.crumb .sep {
  margin: 0 6px;
  color: #d1d5db;
}
</style>


