/**
 * 数据字典工具类
 *
 * 提供统一的字典数据获取和缓存机制，方便前端页面使用字典数据
 *
 * 使用示例：
 * ```typescript
 * import { useDict } from '@/utils/base/dict.ts'
 *
 * // 在组件中使用
 * const { options: statusOptions, load: loadStatusDict } = useDict('common_status')
 *
 * onMounted(() => {
 *   loadStatusDict()
 * })
 *
 * // 在模板中使用
 * <el-select v-model="query.status">
 *   <el-option
 *     v-for="opt in statusOptions"
 *     :key="opt.value"
 *     :label="opt.label"
 *     :value="Number(opt.value)"
 *   />
 * </el-select>
 * ```
 */

import { ref } from 'vue'
import { getDictDataListByTypeCode, type DictDataVo } from '@/api/system/dict/dict.ts'
import { handleErrorToast } from '@/utils/http'

/**
 * 字典选项接口
 */
export interface DictOption {
  /** 显示标签 */
  label: string
  /** 实际值 */
  value: string
  /** 完整的后端 VO 对象 */
  raw: DictDataVo
}

// 简单缓存，避免同一字典类型反复请求
const dictCache = new Map<string, DictOption[]>()
const dictLoading = new Map<string, boolean>()

/**
 * 获取字典选项列表
 *
 * @param dictTypeCode 字典类型编码
 * @param useCache 是否使用缓存，默认 true
 * @returns 字典选项列表
 */
export async function fetchDictOptions(
  dictTypeCode: string,
  useCache = true
): Promise<DictOption[]> {
  // 如果使用缓存且缓存中存在，直接返回
  if (useCache && dictCache.has(dictTypeCode)) {
    return dictCache.get(dictTypeCode)!
  }

  try {
    dictLoading.set(dictTypeCode, true)
    const list = await getDictDataListByTypeCode(dictTypeCode)

    // 过滤启用的数据，按排序号排序，转换为选项格式
    const options: DictOption[] = list
      .filter((item) => item.status === 1) // 只用启用的
      .sort((a, b) => (a.dictSort ?? 0) - (b.dictSort ?? 0)) // 按排序号排序
      .map((item) => ({
        label: item.dictLabel,
        value: item.dictValue,
        raw: item,
      }))

    // 存入缓存
    dictCache.set(dictTypeCode, options)
    return options
  } catch (error) {
    handleErrorToast(error, `加载字典【${dictTypeCode}】失败`)
    return []
  } finally {
    dictLoading.set(dictTypeCode, false)
  }
}

/**
 * Vue 组合式函数，用于在组件中使用字典
 *
 * @param dictTypeCode 字典类型编码
 * @returns 包含 options、loading、load 的对象
 */
export function useDict(dictTypeCode: string) {
  const optionsRef = ref<DictOption[]>([])
  const loadingRef = ref(false)

  /**
   * 加载字典数据
   *
   * @param useCache 是否使用缓存，默认 true
   */
  const load = async (useCache = true) => {
    loadingRef.value = true
    try {
      optionsRef.value = await fetchDictOptions(dictTypeCode, useCache)
    } finally {
      loadingRef.value = false
    }
  }

  return {
    /** 字典选项列表 */
    options: optionsRef,
    /** 加载状态 */
    loading: loadingRef,
    /** 加载字典数据的方法 */
    load,
  }
}

/**
 * 清除指定字典类型的缓存
 *
 * @param dictTypeCode 字典类型编码，如果不传则清除所有缓存
 */
export function clearDictCache(dictTypeCode?: string) {
  if (dictTypeCode) {
    dictCache.delete(dictTypeCode)
    dictLoading.delete(dictTypeCode)
  } else {
    dictCache.clear()
    dictLoading.clear()
  }
}

/**
 * 根据字典值获取标签文本
 *
 * @param dictTypeCode 字典类型编码
 * @param value 字典值
 * @returns 标签文本，如果找不到则返回原值
 */
export async function getDictLabel(
  dictTypeCode: string,
  value: string | number
): Promise<string> {
  const options = await fetchDictOptions(dictTypeCode)
  const option = options.find((opt) => opt.value === String(value))
  return option?.label ?? String(value)
}

