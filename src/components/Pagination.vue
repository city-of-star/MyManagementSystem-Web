<!--
  分页组件

  功能：
  - 封装分页的统一样式和布局
  - 统一的分页配置和事件处理
  - 支持自定义每页条数选项

  使用示例：
  <Pagination
    :total="total"
    :page-size="query.pageSize"
    :current-page="query.pageNum"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
-->
<script setup lang="ts">
defineProps<{
  total: number // 总记录数
  pageSize: number // 每页显示条数
  currentPage: number // 当前页码
  pageSizes?: number[] // 每页显示条数选项，默认为 [10, 20, 50, 100]
}>()

const emit = defineEmits<{
  sizeChange: [size: number]
  currentChange: [page: number]
}>()

/**
 * 分页大小变化触发函数
 */
const handleSizeChange = (size: number) => {
  emit('sizeChange', size)
}

/**
 * 当前页变化触发函数
 */
const handleCurrentChange = (page: number) => {
  emit('currentChange', page)
}
</script>

<template>
  <div class="pagination">
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      :current-page="currentPage"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
