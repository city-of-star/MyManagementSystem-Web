<!--
  数据表格组件

  功能：
  - 封装表格的基础样式（border、stripe、loading）
  - 通过插槽支持自定义表格列
  - 透传所有 el-table 的属性和事件

  使用示例：
  <DataTable :data="tableData" :loading="loading" @selection-change="handleSelectionChange">
    <el-table-column prop="id" label="ID" />
    <el-table-column prop="name" label="名称" />
  </DataTable>
-->
<script setup lang="ts">
defineProps<{
  data: any[] // 表格数据数组
  loading?: boolean // 是否显示加载状态
}>()
</script>

<template>
  <el-table
    v-loading="loading"
    :data="data"
    border
    stripe
    v-bind="$attrs"
  >
    <slot />
  </el-table>
</template>
