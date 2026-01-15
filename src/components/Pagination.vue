<!--
  分页组件

  功能：
  - 封装分页的统一样式和布局
  - 内部管理分页逻辑，直接修改 query 对象的 pageNum 和 pageSize
  - 支持自定义每页条数选项

  原理：
  1. 接收 query 对象（reactive），直接修改其 pageNum 和 pageSize 属性
  2. 修改后触发 change 事件，通知父组件刷新数据
  3. 改变每页条数时，自动重置到第一页

  使用示例：
  <Pagination :query="query" :total="total" @change="fetchData" />
-->
<script setup lang="ts">
import type { BasePageQuery } from '@/api/common/types'

const props = withDefaults(defineProps<{
  total: number // 总记录数
  query: BasePageQuery // 分页查询对象
  pageSizes?: number[] // 每页显示条数选项，默认为 [10, 20, 50, 100]
}>(), {
  pageSizes: () => [10, 20, 50, 100],
})

const emit = defineEmits<{
  change: [] // 分页变化刷新事件
}>()

/**
 * 分页大小变化处理
 */
const handleSizeChange = (size: number) => {
  props.query.pageSize = size
  props.query.pageNum = 1 // 改变每页条数时，重置到第一页
  // 分页变化时触发，通知父组件刷新数据
  emit('change')
}

/**
 * 当前页变化处理
 */
const handleCurrentChange = (page: number) => {
  props.query.pageNum = page
  // 分页变化时触发，通知父组件刷新数据
  emit('change')
}
</script>

<template>
  <div class="pagination">
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-sizes="pageSizes"
      :page-size="query.pageSize || 10"
      :current-page="query.pageNum || 1"
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
