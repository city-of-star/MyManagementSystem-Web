import { httpPost, httpPut, httpDelete, httpGet, SERVICE } from '@/utils/http'
import type { PageResult } from '@/api/common/types'

// 分页查询请求 DTO
export interface DictDataPageQuery {
  pageNum?: number
  pageSize?: number
  dictTypeId?: number
  dictLabel?: string
  dictValue?: string
  status?: number | null
  createTimeStart?: string | null
  createTimeEnd?: string | null
}

// 字典数据信息 VO
export interface DictDataVo {
  id: number
  dictTypeId: number
  dictTypeCode?: string
  dictTypeName?: string
  dictLabel: string
  dictValue: string
  dictSort?: number
  isDefault?: number
  status?: number
  remark?: string
  createBy?: number
  createTime?: string
  updateBy?: number
  updateTime?: string
}

// 创建字典数据请求 DTO
export interface DictDataCreateRequest {
  dictTypeId: number
  dictLabel: string
  dictValue: string
  dictSort?: number
  isDefault?: number
  status?: number
  remark?: string
}

// 更新字典数据请求 DTO
export interface DictDataUpdateRequest {
  id: number
  dictTypeId?: number
  dictLabel?: string
  dictValue?: string
  dictSort?: number
  isDefault?: number
  status?: number
  remark?: string
}

// 切换字典数据状态请求 DTO
export interface DictDataStatusSwitchRequest {
  dictDataId: number
  status: number
}

// 批量删除字典数据请求 DTO
export interface DictDataBatchDeleteRequest {
  dictDataIds: number[]
}

/**
 * 分页查询字典数据
 */
export function getDictDataPage(payload: DictDataPageQuery): Promise<PageResult<DictDataVo>> {
  return httpPost<PageResult<DictDataVo>>(SERVICE.BASE, '/dict-data/page', payload)
}

/**
 * 通过字典类型ID查询数据列表
 */
export function getDictDataListByTypeId(dictTypeId: number): Promise<DictDataVo[]> {
  return httpGet<DictDataVo[]>(SERVICE.BASE, `/dict-data/type-id/${dictTypeId}`)
}

/**
 * 通过字典类型编码查询启用的数据列表（常用于下拉）
 */
export function getDictDataListByTypeCode(dictTypeCode: string): Promise<DictDataVo[]> {
  return httpGet<DictDataVo[]>(SERVICE.BASE, `/dict-data/type-code/${dictTypeCode}`)
}

/**
 * 创建字典数据
 */
export function createDictData(payload: DictDataCreateRequest): Promise<DictDataVo> {
  return httpPost<DictDataVo>(SERVICE.BASE, '/dict-data/create', payload)
}

/**
 * 更新字典数据
 */
export function updateDictData(payload: DictDataUpdateRequest): Promise<DictDataVo> {
  return httpPut<DictDataVo>(SERVICE.BASE, '/dict-data/update', payload)
}

/**
 * 删除字典数据
 */
export function deleteDictData(dictDataId: number): Promise<void> {
  return httpDelete<void>(SERVICE.BASE, `/dict-data/${dictDataId}`)
}

/**
 * 批量删除字典数据
 */
export function batchDeleteDictData(payload: DictDataBatchDeleteRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/dict-data/batch-delete', payload)
}

/**
 * 切换字典数据状态
 */
export function switchDictDataStatus(payload: DictDataStatusSwitchRequest): Promise<void> {
  return httpPost<void>(SERVICE.BASE, '/dict-data/switch-status', payload)
}


