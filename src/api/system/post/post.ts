import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types.ts'

// 岗位分页查询请求 DTO
export interface PostPageQuery {
  pageNum?: number
  pageSize?: number
  postName?: string
  postCode?: string
  postLevel?: string
  status?: number | null
  createTimeStart?: string | null
  createTimeEnd?: string | null
}

// 岗位信息 VO
export interface PostVo {
  id: number
  postCode: string
  postName: string
  postLevel?: string
  sortOrder?: number
  status?: number
  remark?: string
  createBy?: number
  createTime?: string
  updateBy?: number
  updateTime?: string
}

// 创建岗位请求 DTO
export interface PostCreateRequest {
  postCode: string
  postName: string
  postLevel?: string
  sortOrder?: number
  status?: number
  remark?: string
}

// 更新岗位请求 DTO
export interface PostUpdateRequest {
  id: number
  postCode?: string
  postName?: string
  postLevel?: string
  sortOrder?: number
  status?: number
  remark?: string
}

// 岗位状态切换请求 DTO
export interface PostStatusSwitchRequest {
  postId: number
  status: number
}

// 批量删除岗位请求 DTO
export interface PostBatchDeleteRequest {
  postIds: number[]
}

/**
 * 分页查询岗位
 */
export function getPostPage(payload: PostPageQuery): Promise<PageResult<PostVo>> {
  return httpPost<PageResult<PostVo>>(SERVICE.USERCENTER, '/post/page', payload)
}

/**
 * 根据ID查询岗位详情
 */
export function getPostById(postId: number): Promise<PostVo> {
  return httpGet<PostVo>(SERVICE.USERCENTER, `/post/${postId}`)
}

/**
 * 创建岗位
 */
export function createPost(payload: PostCreateRequest): Promise<PostVo> {
  return httpPost<PostVo>(SERVICE.USERCENTER, '/post/create', payload)
}

/**
 * 更新岗位
 */
export function updatePost(payload: PostUpdateRequest): Promise<PostVo> {
  return httpPut<PostVo>(SERVICE.USERCENTER, '/post/update', payload)
}

/**
 * 删除岗位
 */
export function deletePost(postId: number): Promise<void> {
  return httpDelete<void>(SERVICE.USERCENTER, `/post/${postId}`)
}

/**
 * 批量删除岗位
 */
export function batchDeletePost(payload: PostBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/post/batch-delete', payload)
}

/**
 * 切换岗位状态
 */
export function switchPostStatus(payload: PostStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/post/switch-status', payload)
}

