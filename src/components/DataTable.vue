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

// 表头样式：背景色加深 + 文字居中
const headerCellStyle = {
  backgroundColor: '#f5f7fa',
  color: '#303133',
  textAlign: 'center',
}

// 单元格内容居中
const cellStyle = {
  textAlign: 'center',
}
</script>

<template>
  <el-table
    v-loading="loading"
    :data="data"
    :header-cell-style="headerCellStyle"
    :cell-style="cellStyle"
    border
    stripe
    v-bind="$attrs"
  >
    <!-- 序号列（从 1 开始，固定显示） -->
    <el-table-column
      type="index"
      label="序号"
      width="70"
      :index="(index: number) => index + 1"
    />
    <slot />
  </el-table>
</template>

