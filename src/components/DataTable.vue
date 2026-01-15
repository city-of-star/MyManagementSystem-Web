<!--
  数据表格组件

  功能：
  - 封装表格的基础样式（border、stripe、loading）
  - 通过插槽支持自定义表格列
  - 透传所有 el-table 的属性和事件

  使用示例：
  <DataTable
    :data="tableData"
    :loading="loading"
    :page-num="query.pageNum"
    :page-size="query.pageSize"
    @selection-change="handleSelectionChange"
  >
    <el-table-column prop="name" label="名称" />
  </DataTable>
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: any[] // 表格数据数组
  loading?: boolean // 是否显示加载状态
  pageNum?: number // 当前页码（用于序号计算）
  pageSize?: number // 每页条数（用于序号计算）
}>(), {
  loading: false,
  pageNum: 1,
  pageSize: 10,
})

// 表头样式：背景色加深 + 文字居中
const headerCellStyle = {
  backgroundColor: '#f5f7fa',
  color: '#303133',
  textAlign: 'center',
}

// 单元格样式：内容居中
const cellStyle = {
  textAlign: 'center',
}
</script>

<template>
  <el-table
    v-loading="props.loading"
    :data="props.data"
    :header-cell-style="headerCellStyle"
    :cell-style="cellStyle"
    border
    stripe
    v-bind="$attrs"
  >
    <!-- 序号列 -->
    <el-table-column
      type="index"
      label="序号"
      width="70"
      :index="(index: number) => (props.pageNum - 1) * props.pageSize + index + 1"
    />
    <slot />
  </el-table>
</template>

