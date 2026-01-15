import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types'

// 分页查询请求 DTO
export interface DictTypePageQuery {
  pageNum?: number
  pageSize?: number
  dictTypeCode?: string
  dictTypeName?: string
  status?: number | null
  createTimeStart?: string | null
  createTimeEnd?: string | null
}

// 字典类型信息 VO
export interface DictTypeVo {
  id: number
  dictTypeCode: string
  dictTypeName: string
  status?: number
  sortOrder?: number
  remark?: string
  createBy?: number
  createTime?: string
  updateBy?: number
  updateTime?: string
}

// 创建字典类型请求 DTO
export interface DictTypeCreateRequest {
  dictTypeCode: string
  dictTypeName: string
  status?: number
  sortOrder?: number
  remark?: string
}

// 更新字典类型请求 DTO
export interface DictTypeUpdateRequest {
  id: number
  dictTypeCode?: string
  dictTypeName?: string
  status?: number
  sortOrder?: number
  remark?: string
}

// 切换字典类型状态请求 DTO
export interface DictTypeStatusSwitchRequest {
  dictTypeId: number
  status: number
}

// 批量删除字典类型请求 DTO
export interface DictTypeBatchDeleteRequest {
  dictTypeIds: number[]
}

/**
 * 分页查询字典类型
 */
export function getDictTypePage(payload: DictTypePageQuery): Promise<PageResult<DictTypeVo>> {
  return httpPost<PageResult<DictTypeVo>>(SERVICE.BASE, '/dict-type/page', payload)
}

/**
 * 创建字典类型
 */
export function createDictType(payload: DictTypeCreateRequest): Promise<DictTypeVo> {
  return httpPost<DictTypeVo>(SERVICE.BASE, '/dict-type/create', payload)
}

/**
 * 更新字典类型
 */
export function updateDictType(payload: DictTypeUpdateRequest): Promise<DictTypeVo> {
  return httpPut<DictTypeVo>(SERVICE.BASE, '/dict-type/update', payload)
}

/**
 * 删除字典类型
 */
export function deleteDictType(dictTypeId: number): Promise<void> {
  return httpDelete<void>(SERVICE.BASE, `/dict-type/${dictTypeId}`)
}

/**
 * 批量删除字典类型
 */
export function batchDeleteDictType(payload: DictTypeBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/dict-type/batch-delete', payload)
}

/**
 * 切换字典类型状态
 */
export function switchDictTypeStatus(payload: DictTypeStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/dict-type/switch-status', payload)
}

/**
 * 查询所有启用的字典类型
 */
export function listAllEnabledDictTypes(): Promise<DictTypeVo[]> {
  return httpGet<DictTypeVo[]>(SERVICE.BASE, '/dict-type/list-enabled')
}

/**
 * 通过编码获取字典类型详情
 */
export function getDictTypeByCode(dictTypeCode: string): Promise<DictTypeVo> {
  return httpGet<DictTypeVo>(SERVICE.BASE, `/dict-type/code/${dictTypeCode}`)
}

/**
 * 检查字典类型编码是否存在
 */
export function checkDictTypeCode(dictTypeCode: string): Promise<boolean> {
  return httpGet<boolean>(SERVICE.BASE, `/dict-type/check-code/${dictTypeCode}`)
}

