/**
 * 公共类型定义
 */

// 后端使用 MyBatis-Plus Page，前端只关心这几个字段
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

// 基础分页查询参数
export interface BasePageQuery {
  pageNum?: number
  pageSize?: number
}
