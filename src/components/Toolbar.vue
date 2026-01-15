<!--
  操作栏组件

  功能：
  - 封装操作栏的统一样式和布局
  - 通过插槽支持自定义操作按钮
  - 按钮左对齐

  使用示例：
  <Toolbar>
    <el-button type="primary" @click="handleCreate">新建</el-button>
    <el-button type="danger" :disabled="!selection.length" @click="handleBatchDelete">
      批量删除
    </el-button>
  </Toolbar>
-->
<script setup lang="ts">
</script>

<template>
  <div class="toolbar">
    <slot />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 0;
  gap: 8px;
}
</style>
