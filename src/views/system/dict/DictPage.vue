<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import {
  batchDeleteDictData,
  createDictData,
  deleteDictData,
  getDictDataPage,
  switchDictDataStatus,
  updateDictData,
  type DictDataCreateRequest,
  type DictDataPageQuery,
  type DictDataUpdateRequest,
  type DictDataVo,
} from '@/api/system/dict/dictData.ts'
import {
  batchDeleteDictType,
  createDictType,
  deleteDictType,
  getDictTypePage,
  listAllEnabledDictTypes,
  switchDictTypeStatus,
  updateDictType,
  type DictTypeCreateRequest,
  type DictTypePageQuery,
  type DictTypeUpdateRequest,
  type DictTypeVo,
} from '@/api/system/dict/dictType.ts'
import { type PageResult } from '@/api/common/types.ts'
import { handleErrorToast } from '@/utils/http'
import { clearDictCache, useDict } from '@/utils/base/dictUtils.ts'
import SearchForm from '@/components/layout/SearchForm.vue'
import DataTable from '@/components/layout/DataTable.vue'
import Pagination from '@/components/layout/Pagination.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import IconButton from '@/components/button/IconButton.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import DictSelect from '@/components/dict/DictSelect.vue'
import DictTag from '@/components/dict/DictTag.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'

// 字典：通用状态、是否
const { options: statusOptions, loading: statusLoading, load: statusLoad } = useDict('common_status')
const { options: yesNoOptions, load: yesNoLoad } = useDict('yes_no')

// ====== 字典类型（左侧） ======

// 查询条件
const typeQuery = reactive<DictTypePageQuery>({
  pageNum: 1,
  pageSize: 10,
  dictTypeCode: '',
  dictTypeName: '',
  status: null,
})

// 列表 & 分页
const typeLoading = ref(false)
const typeTableData = ref<DictTypeVo[]>([])
const typeTotal = ref(0)

// 选中行
const typeMultipleSelection = ref<DictTypeVo[]>([])
const currentTypeId = ref<number | null>(null)

// 弹窗
const typeDialogVisible = ref(false)
const typeDialogTitle = ref('新建字典类型')
const editingTypeId = ref<number | null>(null)

// 表单（用于新增/编辑）
const typeForm = reactive<DictTypeCreateRequest & { id?: number }>({
  dictTypeCode: '',
  dictTypeName: '',
  status: 1,
  sortOrder: 0,
  remark: '',
})

// 初始化
onMounted(async () => {
  await Promise.all([
    statusLoad(),
    yesNoLoad(),
  ])
  await Promise.all([
    // 加载字典类型列表数据
    await fetchTypeData(),
    // 加载启用的字典类型列表
    await loadEnabledDictTypes()
  ])
})

// 查询按钮
const handleTypeSearch = () => {
  typeQuery.pageNum = 1
  fetchTypeData()
}

// 重置按钮
const handleTypeReset = () => {
  typeQuery.pageNum = 1
  typeQuery.dictTypeCode = ''
  typeQuery.dictTypeName = ''
  typeQuery.status = null
  fetchTypeData()
}

// 分页查询字典类型列表数据
const fetchTypeData = async (): Promise<void> => {
  typeLoading.value = true
  try {
    const resp: PageResult<DictTypeVo> = await getDictTypePage(typeQuery)
    typeTableData.value = resp.records
    typeTotal.value = resp.total
    typeQuery.pageNum = resp.current
    typeQuery.pageSize = resp.size

    // 如果当前没有选中的类型，默认选中第一页第一条
    if (!currentTypeId.value && resp.records && resp.records.length > 0) {
      currentTypeId.value = resp.records[0]!.id
    }
  } catch (error) {
    handleErrorToast(error)
  } finally {
    typeLoading.value = false
  }
}

// 选中行变化
const handleTypeSelectionChange = (rows: DictTypeVo[]) => {
  typeMultipleSelection.value = rows
}

// 表格行点击
const handleTypeRowClick = (row: DictTypeVo) => {
  if (currentTypeId.value === row.id) return
  currentTypeId.value = row.id
}

// 监听当前选中的字典类型ID，切换时加载对应的字典数据
watch(currentTypeId, (val) => {
  // 切换字典类型时重置并加载右侧字典数据
  if (val) {
    dataQuery.dictTypeId = val
    dataQuery.pageNum = 1
    fetchDataData()
  } else {
    dataTableData.value = []
    dataTotal.value = 0
  }
})

// 新建按钮
const handleTypeCreate = () => {
  resetTypeForm()
  typeDialogTitle.value = '新建字典类型'
  typeDialogVisible.value = true
}

// 编辑按钮
const handleTypeEdit = (row: DictTypeVo) => {
  resetTypeForm()
  typeDialogTitle.value = '编辑字典类型'
  editingTypeId.value = row.id
  typeForm.dictTypeCode = row.dictTypeCode
  typeForm.dictTypeName = row.dictTypeName
  typeForm.status = row.status ?? 1
  typeForm.sortOrder = row.sortOrder ?? 0
  typeForm.remark = row.remark || ''
  typeDialogVisible.value = true
}

// 删除按钮
const handleTypeDelete = async (row: DictTypeVo) => {
  try {
    await Message.confirm(`确定要删除字典类型【${row.dictTypeName || row.dictTypeCode}】吗？`)
    await deleteDictType(row.id)
    Message.success('删除成功')
    // 清除对应字典类型的缓存
    clearDictCache(row.dictTypeCode)
    if (currentTypeId.value === row.id) {
      currentTypeId.value = null
    }
    fetchTypeData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 批量删除按钮
const handleTypeBatchDelete = async () => {
  if (!typeMultipleSelection.value.length) {
    Message.info('请先选择要删除的字典类型')
    return
  }
  try {
    await Message.confirm(
      `确定要删除选中的 ${typeMultipleSelection.value.length} 个字典类型吗？（会同时影响其下字典数据）`
    )
    const ids = typeMultipleSelection.value.map((t) => t.id)
    // 保存要删除的字典类型编码，用于清除缓存
    const dictTypeCodes = typeMultipleSelection.value.map((t) => t.dictTypeCode)
    await batchDeleteDictType({ dictTypeIds: ids })
    Message.success('批量删除成功')
    // 清除所有被删除字典类型的缓存
    dictTypeCodes.forEach((code) => clearDictCache(code))
    if (currentTypeId.value && ids.includes(currentTypeId.value)) {
      currentTypeId.value = null
    }
    fetchTypeData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleTypeToggleStatus = async (row: DictTypeVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchDictTypeStatus({ dictTypeId: row.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    // 清除对应字典类型的缓存（状态变更可能影响字典数据的可用性）
    clearDictCache(row.dictTypeCode)
    fetchTypeData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// （新建/编辑）确定按钮
const handleTypeSubmit = async () => {
  try {
    // 新增时验证编码，编辑时编码不可修改，不需要验证
    if (!editingTypeId.value && !typeForm.dictTypeCode) {
      Message.warning('请填写字典类型编码')
      return
    }
    if (!typeForm.dictTypeName) {
      Message.warning('请填写字典类型名称')
      return
    }

    if (editingTypeId.value) {
      // 编辑时，字典类型编码不可修改，使用原有的编码
      const oldType = typeTableData.value.find((t) => t.id === editingTypeId.value)
      const dictTypeCode = oldType?.dictTypeCode

      if (!dictTypeCode) {
        Message.error('无法获取字典类型编码')
        return
      }

      const payload: DictTypeUpdateRequest = {
        id: editingTypeId.value,
        // 编辑时不需要传递 dictTypeCode（编码不可修改）
        dictTypeName: typeForm.dictTypeName,
        status: typeForm.status,
        sortOrder: typeForm.sortOrder,
        remark: typeForm.remark || undefined,
      }
      await updateDictType(payload)
      Message.success('更新成功')

      // 清除对应字典类型的缓存（编码不会改变，直接清除当前编码的缓存）
      clearDictCache(dictTypeCode)
    } else {
      const payload: DictTypeCreateRequest = {
        dictTypeCode: typeForm.dictTypeCode,
        dictTypeName: typeForm.dictTypeName,
        status: typeForm.status,
        sortOrder: typeForm.sortOrder,
        remark: typeForm.remark || undefined,
      }
      await createDictType(payload)
      Message.success('创建成功')
      // 新增不需要清除缓存（之前没有这个字典的缓存）
    }
    typeDialogVisible.value = false
    fetchTypeData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// ====== 字典数据（右侧） ======

// 查询条件
const dataQuery = reactive<DictDataPageQuery>({
  pageNum: 1,
  pageSize: 10,
  dictTypeId: undefined,
  dictLabel: '',
  dictValue: '',
  status: null,
})

// 列表 & 分页
const dataLoading = ref(false)
const dataTableData = ref<DictDataVo[]>([])
const dataTotal = ref(0)

// 选中行
const dataMultipleSelection = ref<DictDataVo[]>([])

// 弹窗
const dataDialogVisible = ref(false)
const dataDialogTitle = ref('新建字典数据')
const editingDataId = ref<number | null>(null)

// 表单（用于新增/编辑）
const dataForm = reactive<Omit<DictDataCreateRequest, 'dictTypeId'> & { id?: number }>({
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  isDefault: 0,
  status: 1,
  remark: '',
})

// 重置（新增/编辑）表单
const resetTypeForm = () => {
  editingTypeId.value = null
  typeDialogTitle.value = '新建字典类型'
  typeForm.dictTypeCode = ''
  typeForm.dictTypeName = ''
  typeForm.status = 1
  typeForm.sortOrder = 0
  typeForm.remark = ''
}

// 重置（新增/编辑）表单
const resetDataForm = () => {
  editingDataId.value = null
  dataDialogTitle.value = '新建字典数据'
  // 字典类型使用当前选择的类型，不需要在表单中设置
  dataForm.dictLabel = ''
  dataForm.dictValue = ''
  dataForm.dictSort = 0
  dataForm.isDefault = 0
  dataForm.status = 1
  dataForm.remark = ''
}

// 查询按钮
const handleDataSearch = () => {
  dataQuery.pageNum = 1
  fetchDataData()
}

// 重置按钮
const handleDataReset = () => {
  dataQuery.pageNum = 1
  dataQuery.dictLabel = ''
  dataQuery.dictValue = ''
  dataQuery.status = null
  fetchDataData()
}

// 分页查询字典数据列表数据
const fetchDataData = async (): Promise<void> => {
  if (!currentTypeId.value) {
    dataTableData.value = []
    dataTotal.value = 0
    return
  }
  dataLoading.value = true
  try {
    const resp: PageResult<DictDataVo> = await getDictDataPage({
      ...dataQuery,
      dictTypeId: currentTypeId.value,
    })
    dataTableData.value = resp.records
    dataTotal.value = resp.total
    dataQuery.pageNum = resp.current
    dataQuery.pageSize = resp.size
  } catch (error) {
    handleErrorToast(error)
  } finally {
    dataLoading.value = false
  }
}

// 选中行变化
const handleDataSelectionChange = (rows: DictDataVo[]) => {
  dataMultipleSelection.value = rows
}

// 新建按钮
const handleDataCreate = () => {
  if (!currentTypeId.value) {
    Message.warning('请先选择左侧字典类型')
    return
  }
  resetDataForm()
  dataDialogTitle.value = '新建字典数据'
  dataDialogVisible.value = true
}

// 编辑按钮
const handleDataEdit = (row: DictDataVo) => {
  if (!currentTypeId.value) {
    Message.warning('请先选择左侧字典类型')
    return
  }
  resetDataForm()
  dataDialogTitle.value = '编辑字典数据'
  editingDataId.value = row.id
  // 字典类型使用当前选择的类型，不需要从 row 中获取
  dataForm.dictLabel = row.dictLabel
  dataForm.dictValue = row.dictValue
  dataForm.dictSort = row.dictSort ?? 0
  dataForm.isDefault = row.isDefault ?? 0
  dataForm.status = row.status ?? 1
  dataForm.remark = row.remark || ''
  dataDialogVisible.value = true
}

// 删除按钮
const handleDataDelete = async (row: DictDataVo) => {
  try {
    await Message.confirm(`确定要删除字典数据【${row.dictLabel}】吗？`)
    await deleteDictData(row.id)
    Message.success('删除成功')
    // 清除对应字典类型的缓存
    if (row.dictTypeCode) {
      clearDictCache(row.dictTypeCode)
    }
    fetchDataData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 批量删除按钮
const handleDataBatchDelete = async () => {
  if (!dataMultipleSelection.value.length) {
    Message.info('请先选择要删除的字典数据')
    return
  }
  try {
    await Message.confirm(`确定要删除选中的 ${dataMultipleSelection.value.length} 条字典数据吗？`)
    const ids = dataMultipleSelection.value.map((d) => d.id)
    // 保存要删除的字典类型编码，用于清除缓存
    const dictTypeCodes = dataMultipleSelection.value
      .map((d) => d.dictTypeCode)
      .filter((code): code is string => !!code)
    await batchDeleteDictData({ dictDataIds: ids })
    Message.success('批量删除成功')
    // 清除所有被删除字典数据对应的字典类型缓存（去重）
    const uniqueDictTypeCodes = [...new Set(dictTypeCodes)]
    uniqueDictTypeCodes.forEach((code) => clearDictCache(code))
    fetchDataData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleDataToggleStatus = async (row: DictDataVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchDictDataStatus({ dictDataId: row.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    // 清除对应字典类型的缓存（状态变更影响过滤结果，只显示启用的）
    if (row.dictTypeCode) {
      clearDictCache(row.dictTypeCode)
    }
    fetchDataData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// （新建/编辑）确定按钮
const handleDataSubmit = async () => {
  try {
    // 使用当前选择的字典类型
    if (!currentTypeId.value) {
      Message.warning('请先选择左侧字典类型')
      return
    }
    if (!dataForm.dictLabel) {
      Message.warning('请填写字典标签')
      return
    }
    if (!dataForm.dictValue) {
      Message.warning('请填写字典值')
      return
    }

    // 获取字典类型编码，用于清除缓存
    const dictType = enabledDictTypes.value.find((t) => t.id === currentTypeId.value)
    const dictTypeCode = dictType?.dictTypeCode

    if (editingDataId.value) {
      // 编辑时，需要获取旧的字典类型编码（如果类型改变了，需要清除旧的缓存）
      const oldData = dataTableData.value.find((d) => d.id === editingDataId.value)
      let oldDictTypeCode = oldData?.dictTypeCode

      // 如果 oldData.dictTypeCode 不存在，从 enabledDictTypes 中查找
      if (!oldDictTypeCode && oldData?.dictTypeId) {
        const oldType = enabledDictTypes.value.find((t) => t.id === oldData.dictTypeId)
        oldDictTypeCode = oldType?.dictTypeCode
      }

      const payload: DictDataUpdateRequest = {
        id: editingDataId.value,
        dictTypeId: currentTypeId.value, // 使用当前选择的字典类型
        dictLabel: dataForm.dictLabel,
        dictValue: dataForm.dictValue,
        dictSort: dataForm.dictSort,
        isDefault: dataForm.isDefault,
        status: dataForm.status,
        remark: dataForm.remark || undefined,
      }
      await updateDictData(payload)
      Message.success('更新成功')

      // 清除缓存：如果类型改变了，清除旧的；无论如何都清除新的
      if (oldDictTypeCode && oldDictTypeCode !== dictTypeCode) {
        clearDictCache(oldDictTypeCode)
      }
      if (dictTypeCode) {
        clearDictCache(dictTypeCode)
      }
    } else {
      const payload: DictDataCreateRequest = {
        dictTypeId: currentTypeId.value, // 使用当前选择的字典类型
        dictLabel: dataForm.dictLabel,
        dictValue: dataForm.dictValue,
        dictSort: dataForm.dictSort,
        isDefault: dataForm.isDefault,
        status: dataForm.status,
        remark: dataForm.remark || undefined,
      }
      await createDictData(payload)
      Message.success('创建成功')
      // 新增时也清除缓存，确保下次获取最新数据（包含新增的数据）
      if (dictTypeCode) {
        clearDictCache(dictTypeCode)
      }
    }
    dataDialogVisible.value = false
    fetchDataData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 下拉中需要用到的字典类型列表（可扩展用作过滤等）
const enabledDictTypes = ref<DictTypeVo[]>([])

// 获取所有启用的字典类型列表
const loadEnabledDictTypes = async () => {
  try {
    enabledDictTypes.value = await listAllEnabledDictTypes()
  } catch (error) {
    // 只是辅助功能，报错不打断主流程
    console.error(error)
  }
}

// 表格行类名函数
const getTypeRowClassName = ({ row }: { row: DictTypeVo; rowIndex: number }) => {
  return row.id === currentTypeId.value ? 'dict-type-row--active' : ''
}

// 当前选中类型的名称（用于显示）
const currentTypeName = computed(() => {
  if (!currentTypeId.value) return ''
  const type = typeTableData.value.find((t) => t.id === currentTypeId.value)
  return type?.dictTypeName || type?.dictTypeCode || ''
})
</script>

<template>
  <div class="dict-page">
    <div class="dict-layout">
      <!-- 左侧：字典类型 -->
      <div class="dict-panel">
        <div class="panel-header">
          <div class="panel-title">字典类型</div>
        </div>

        <!-- 查询区域 -->
        <SearchForm @search="handleTypeSearch" @reset="handleTypeReset">
          <el-form-item label="类型编码">
            <el-input v-model="typeQuery.dictTypeCode" placeholder="请输入类型编码" clearable />
          </el-form-item>
          <el-form-item label="类型名称">
            <el-input v-model="typeQuery.dictTypeName" placeholder="请输入类型名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <DictSelect
              v-model.number="typeQuery.status"
              :options="statusOptions"
              :loading="statusLoading"
              placeholder="全部"
            />
          </el-form-item>
        </SearchForm>

        <!-- 操作栏 -->
        <Toolbar>
          <PrimaryButton icon="Plus" type="primary" @click="handleTypeCreate">
            新建类型
          </PrimaryButton>
          <PrimaryButton
            icon="Delete"
            type="danger"
            :disabled="!typeMultipleSelection.length"
            @click="handleTypeBatchDelete"
          >
            批量删除
          </PrimaryButton>
        </Toolbar>

        <!-- 表格 -->
        <DataTable
          :data="typeTableData"
          :loading="typeLoading"
          :page-num="typeQuery.pageNum"
          :page-size="typeQuery.pageSize"
          @selection-change="handleTypeSelectionChange"
          highlight-current-row
          @row-click="handleTypeRowClick"
          :row-class-name="getTypeRowClassName"
          height="430"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="dictTypeCode" label="类型编码" min-width="100" show-overflow-tooltip />
          <el-table-column prop="dictTypeName" label="类型名称" min-width="100" show-overflow-tooltip />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column label="操作" fixed="right" width="120">
            <template #default="{ row }">
              <IconButton type="primary" icon="Edit" tooltip="编辑" @click.stop="handleTypeEdit(row)" />
              <IconButton
                type="primary"
                :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'"
                :tooltip="row.status === 1 ? '禁用' : '启用'"
                @click.stop="handleTypeToggleStatus(row)"
              />
              <IconButton type="danger" icon="Delete" tooltip="删除" @click.stop="handleTypeDelete(row)" />
            </template>
          </el-table-column>
        </DataTable>

        <!-- 分页 -->
        <Pagination :query="typeQuery" :total="typeTotal" @change="fetchTypeData" />
      </div>

      <!-- 右侧：字典数据 -->
      <div class="dict-panel">
        <div class="panel-header">
          <div class="panel-title">
            字典数据
            <span v-if="currentTypeId" class="panel-subtitle">
              （当前类型：{{ currentTypeName }}）
            </span>
          </div>
        </div>

        <!-- 查询区域 -->
        <SearchForm @search="handleDataSearch" @reset="handleDataReset">
          <el-form-item label="字典标签">
            <el-input v-model="dataQuery.dictLabel" placeholder="请输入字典标签" clearable />
          </el-form-item>
          <el-form-item label="字典值">
            <el-input v-model="dataQuery.dictValue" placeholder="请输入字典值" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <DictSelect
              v-model.number="dataQuery.status"
              :options="statusOptions"
              :loading="statusLoading"
              placeholder="全部"
            />
          </el-form-item>
        </SearchForm>

        <!-- 操作栏 -->
        <Toolbar>
          <PrimaryButton icon="Plus" type="primary" @click="handleDataCreate">
            新建数据
          </PrimaryButton>
          <PrimaryButton
            icon="Delete"
            type="danger"
            :disabled="!dataMultipleSelection.length"
            @click="handleDataBatchDelete"
          >
            批量删除
          </PrimaryButton>
        </Toolbar>

        <!-- 表格 -->
        <DataTable
          :data="dataTableData"
          :loading="dataLoading"
          :page-num="dataQuery.pageNum"
          :page-size="dataQuery.pageSize"
          @selection-change="handleDataSelectionChange"
          height="430"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="dictLabel" label="字典标签" min-width="100" show-overflow-tooltip />
          <el-table-column prop="dictValue" label="字典值" min-width="80" show-overflow-tooltip />
          <el-table-column prop="dictSort" label="排序" width="70" />
          <el-table-column prop="isDefault" label="默认" width="70">
            <template #default="{ row }">
              <DictTag :options="yesNoOptions" :value="row.isDefault" :type-map="{ '1': 'success', '0': 'info' }" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" fixed="right" width="120">
            <template #default="{ row }">
              <IconButton type="primary" icon="Edit" tooltip="编辑" @click="handleDataEdit(row)" />
              <IconButton
                type="primary"
                :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'"
                :tooltip="row.status === 1 ? '禁用' : '启用'"
                @click="handleDataToggleStatus(row)"
              />
              <IconButton type="danger" icon="Delete" tooltip="删除" @click="handleDataDelete(row)" />
            </template>
          </el-table-column>
        </DataTable>

        <!-- 分页 -->
        <Pagination :query="dataQuery" :total="dataTotal" @change="fetchDataData" />
      </div>
    </div>

    <!-- 新增/编辑弹窗（字典类型） -->
    <BaseDialog v-model="typeDialogVisible" :title="typeDialogTitle" width="520px" @confirm="handleTypeSubmit">
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="类型名称" required>
          <el-input v-model="typeForm.dictTypeName" placeholder="请输入字典类型名称" />
        </el-form-item>
        <el-form-item label="类型编码" required>
          <el-input
            v-model="typeForm.dictTypeCode"
            placeholder="请输入字典类型编码"
            :disabled="!!editingTypeId"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="typeForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <DictSelect v-model.number="typeForm.status" :options="statusOptions" :loading="statusLoading" style="width: 140px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </BaseDialog>

    <!-- 新增/编辑弹窗（字典数据） -->
    <BaseDialog v-model="dataDialogVisible" :title="dataDialogTitle" width="560px" @confirm="handleDataSubmit">
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="所属类型">
          <el-input :value="currentTypeName" disabled style="width: 220px" />
        </el-form-item>
        <el-form-item label="字典标签" required>
          <el-input v-model="dataForm.dictLabel" placeholder="请输入字典标签（显示文本）" />
        </el-form-item>
        <el-form-item label="字典值" required>
          <el-input v-model="dataForm.dictValue" placeholder="请输入字典值（实际值）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.dictSort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="是否默认">
          <el-radio-group v-model="dataForm.isDefault">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <DictSelect v-model.number="dataForm.status" :options="statusOptions" :loading="statusLoading" style="width: 140px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dataForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>

<style scoped>
.dict-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  overflow: hidden;
}

.dict-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.5fr);
  gap: 16px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 1400px) {
  .dict-layout {
    grid-template-columns: 1fr 1fr;
  }
}

.dict-panel {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 6px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
}

.panel-subtitle {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-form {
  padding-top: 8px;
}

.dict-type-row--active > td {
  background-color: #ecf5ff !important;
}

.dict-layout > .dict-panel:first-child :deep(.el-table__body tr) {
  cursor: pointer;
}
</style>
