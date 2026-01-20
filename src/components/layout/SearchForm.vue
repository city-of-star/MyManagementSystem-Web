<!--
  查询表单组件

  功能：
  - 封装查询表单的统一样式和布局
  - 提供查询和重置按钮的统一处理
  - 通过插槽支持自定义表单项

  使用示例：
  <SearchForm @search="handleSearch" @reset="handleReset">
    <el-form-item label="用户名">
      <el-input v-model="query.username" />
    </el-form-item>
  </SearchForm>
-->
<script setup lang="ts">
import PrimaryButton from '@/components/button/PrimaryButton.vue'

const emit = defineEmits<{
  search: []
  reset: []
}>()

/**
 * 查询
 */
const handleSearch = () => {
  emit('search')
}

/**
 * 重置
 */
const handleReset = () => {
  emit('reset')
}
</script>

<template>
  <div class="search-card">
    <el-form :inline="true" label-width="110px" class="search-form">
      <slot />
    </el-form>
    <!-- 分隔线 -->
    <div class="divider"></div>
    <!-- 按钮区域：最右侧 -->
    <div class="button-group">
      <PrimaryButton type="primary" icon="Search" @click="handleSearch">查询</PrimaryButton>
      <PrimaryButton type="info" icon="Refresh" @click="handleReset">重置</PrimaryButton>
    </div>
  </div>
</template>

<style scoped>
.search-card {
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.search-form {
  margin-bottom: 0;
}

/* 统一表单项内容区域的宽度 */
.search-card :deep(.el-form-item__content) {
  width: 220px;
}

/* 所有表单控件占满内容区域，确保宽度一致 */
.search-card :deep(.el-input),
.search-card :deep(.el-select),
.search-card :deep(.el-date-picker),
.search-card :deep(.el-time-picker),
.search-card :deep(.el-input-number),
.search-card :deep(.el-cascader),
.search-card :deep(.el-autocomplete),
.search-card :deep(.el-tree-select) {
  width: 100%;
}

/* 分隔线 */
.divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 12px 0;
}

/* 按钮区域：最右侧 */
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
