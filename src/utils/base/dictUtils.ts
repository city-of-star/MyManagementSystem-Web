/**
 * 数据字典工具类
 *
 * 提供统一的字典数据获取和缓存机制，方便前端页面使用字典数据
 *
 * 使用示例：
 * ```typescript
 * import { useDict } from '@/utils/base/dictUtils.ts'
 *
 * // 在组件中使用
 * const {options: statusOptions, findLabel: statusFindLabel, load: loadStatusDict} = useDict('common_status')
 *
 * onMounted(() => {
 *   loadStatusDict()
 * })
 *
 * // 在模板中使用（下拉框）
 * <el-select v-model="query.status" :loading="loading">
 *   <el-option
 *     v-for="opt in statusOptions"
 *     :key="opt.value"
 *     :label="opt.label"
 *     :value="Number(opt.value)"
 *   />
 * </el-select>
 *
 * // 在模板中使用（表格里面根据值获取标签）
 * <el-table-column prop="gender" label="性别" width="90">
 *   <template #default="{ row }">
 *     {{ genderFindLabel(row.status) }}
 *   </template>
 * </el-table-column>
 * ```
 */

import { ref, reactive, computed } from 'vue'
import { getDictDataListByTypeCode, type DictDataVo } from '@/api/system/dict/dictData.ts'
import { handleErrorToast } from '@/utils/http'

/**
 * 字典选项接口
 */
export interface DictOption {
  label: string // 显示标签
  value: string // 实际值（字符串形式，与后端一致）
  raw: DictDataVo // 完整的后端 VO 对象
}

/**
 * 字典数据缓存，避免同一字典类型反复请求
 */
const dictCache = new Map<string, DictOption[]>()

/**
 * 全局响应式 loading 状态，所有组件共享同一个字典类型的 loading 状态
 * 使用 reactive 包装 Map，使其成为响应式的
 */
const dictLoading = reactive(new Map<string, boolean>())

/**
 * 正在进行的请求 Promise，用于处理并发请求
 * 当多个组件同时请求同一字典时，共享同一个 Promise，避免重复请求
 */
const dictLoadingPromises = new Map<string, Promise<DictOption[]>>()

/**
 * 获取字典选项列表（内部函数，不直接管理 loading 状态）
 *
 * @param dictTypeCode 字典类型编码
 * @param useCache 是否使用缓存，默认 true
 * @returns 字典选项列表
 */
async function fetchDictOptions(
  dictTypeCode: string,
  useCache = true
): Promise<DictOption[]> {
  // 如果使用缓存且缓存中存在，直接返回
  if (useCache && dictCache.has(dictTypeCode)) {
    return dictCache.get(dictTypeCode)!
  }

  // 调用 API 获取字典数据
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
}

/**
 * Vue 组合式函数，用于在组件中使用字典
 *
 * @param dictTypeCode 字典类型编码
 * @returns 包含 options、loading、load 的对象
 */
export function useDict(dictTypeCode: string) {
  const optionsRef = ref<DictOption[]>([])

  // 使用 computed 从全局响应式 dictLoading 中读取当前字典类型的 loading 状态
  // 这样所有使用同一字典类型的组件都会共享同一个 loading 状态
  const loadingRef = computed(() => dictLoading.get(dictTypeCode) ?? false)

  /**
   * 加载字典数据
   *
   * @param useCache 是否使用缓存，默认 true
   */
  const load = async (useCache = true) => {
    // 如果使用缓存且缓存中存在，直接使用
    if (useCache && dictCache.has(dictTypeCode)) {
      optionsRef.value = dictCache.get(dictTypeCode)!
      return
    }

    // 如果已经有正在进行的请求，等待它完成（避免重复请求）
    const existingPromise = dictLoadingPromises.get(dictTypeCode)
    if (existingPromise) {
      try {
        // 等待第一个请求完成，然后使用结果
        optionsRef.value = await existingPromise
      } catch (error) {
        // 如果第一个请求失败，这里也会失败，但不会重复显示错误提示
        optionsRef.value = []
      }
      return
    }

    // 创建新的请求 Promise
    const loadPromise = (async () => {
      try {
        // 设置全局 loading 状态（响应式的，会自动更新所有组件的 loading）
        dictLoading.set(dictTypeCode, true)

        // 获取字典数据（fetchDictOptions 内部已经处理缓存存储）
        return await fetchDictOptions(dictTypeCode, useCache)
      } catch (error) {
        handleErrorToast(error, `加载字典【${dictTypeCode}】失败`)
        throw error
      } finally {
        // 清除 loading 状态和 Promise
        dictLoading.set(dictTypeCode, false)
        dictLoadingPromises.delete(dictTypeCode)
      }
    })()

    // 保存 Promise，供其他并发请求使用
    dictLoadingPromises.set(dictTypeCode, loadPromise)

    try {
      // 等待请求完成
      optionsRef.value = await loadPromise
    } catch (error) {
      optionsRef.value = []
    }
  }

  // 基于当前 options 的同步查找
  const label = (
    value: string | number | null | undefined,
  ) => findDictLabel(optionsRef.value, value)

  return {
    options: optionsRef, // 字典选项列表
    loading: loadingRef, // 加载状态（响应式，从全局 dictLoading 读取）
    load, // 加载字典数据的方法
    label // 将字典值翻译成字典标签
  }
}

/**
 * 根据字典值获取标签文本（异步）
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

/**
 * 从字典选项中同步查找标签文本（同步）
 *
 * @param options 字典选项列表
 * @param value 字典值
 * @returns 标签文本，如果找不到则返回空字符串
 */
export function findDictLabel(
  options: DictOption[],
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return ''
  const option = options.find((opt) => opt.value === String(value))
  return option?.label || ''
}

/**
 * 清除指定字典类型的缓存
 *
 * @param dictTypeCode 字典类型编码，如果不传则清除所有缓存
 *
 * 使用场景：
 * - 在字典管理页面修改、删除、切换状态后调用
 * - 确保下次获取字典数据时从服务器重新加载
 */
export function clearDictCache(dictTypeCode?: string) {
  if (dictTypeCode) {
    dictCache.delete(dictTypeCode)
    dictLoading.delete(dictTypeCode)
    dictLoadingPromises.delete(dictTypeCode) // 清除正在进行的请求
  } else {
    dictCache.clear()
    dictLoading.clear()
    dictLoadingPromises.clear()
  }
}
