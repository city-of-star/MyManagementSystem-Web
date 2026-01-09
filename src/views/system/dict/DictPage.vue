<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  batchDeleteDictData,
  batchDeleteDictType,
  createDictData,
  createDictType,
  deleteDictData,
  deleteDictType,
  getDictDataPage,
  getDictTypePage,
  listAllEnabledDictTypes,
  switchDictDataStatus,
  switchDictTypeStatus,
  updateDictData,
  updateDictType,
  type DictDataCreateRequest,
  type DictDataPageQuery,
  type DictDataUpdateRequest,
  type DictDataVo,
  type DictTypeCreateRequest,
  type DictTypePageQuery,
  type DictTypeUpdateRequest,
  type DictTypeVo,
  type PageResult,
} from '@/api/system/dict/dict'
import { handleErrorToast } from '@/utils/http'

// ====== 字典类型（左侧） ======

const typeQuery = reactive<DictTypePageQuery>({
  pageNum: 1,
  pageSize: 10,
  dictTypeCode: '',
  dictTypeName: '',
  status: null,
})

const typeLoading = ref(false)
const typeTableData = ref<DictTypeVo[]>([])
const typeTotal = ref(0)
const typeMultipleSelection = ref<DictTypeVo[]>([])
const currentTypeId = ref<number | null>(null)

const typeDialogVisible = ref(false)
const typeDialogTitle = ref('新建字典类型')
const editingTypeId = ref<number | null>(null)

const typeForm = reactive<DictTypeCreateRequest & { id?: number }>({
  dictTypeCode: '',
  dictTypeName: '',
  status: 1,
  sortOrder: 0,
  remark: '',
})

const resetTypeForm = () => {
  editingTypeId.value = null
  typeDialogTitle.value = '新建字典类型'
  typeForm.dictTypeCode = ''
  typeForm.dictTypeName = ''
  typeForm.status = 1
  typeForm.sortOrder = 0
  typeForm.remark = ''
}

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

const handleTypeSearch = () => {
  typeQuery.pageNum = 1
  fetchTypeData()
}

const handleTypeReset = () => {
  typeQuery.pageNum = 1
  typeQuery.dictTypeCode = ''
  typeQuery.dictTypeName = ''
  typeQuery.status = null
  fetchTypeData()
}

const handleTypeSizeChange = (size: number) => {
  typeQuery.pageSize = size
  fetchTypeData()
}

const handleTypeCurrentChange = (page: number) => {
  typeQuery.pageNum = page
  fetchTypeData()
}

const handleTypeSelectionChange = (rows: DictTypeVo[]) => {
  typeMultipleSelection.value = rows
}

const handleTypeRowClick = (row: DictTypeVo) => {
  if (currentTypeId.value === row.id) return
  currentTypeId.value = row.id
}

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

const handleTypeCreate = () => {
  resetTypeForm()
  typeDialogTitle.value = '新建字典类型'
  typeDialogVisible.value = true
}

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

const handleTypeDelete = async (row: DictTypeVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除字典类型【${row.dictTypeName || row.dictTypeCode}】吗？`, '提示', {
      type: 'warning',
    })
    await deleteDictType(row.id)
    ElMessage.success('删除成功')
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

const handleTypeBatchDelete = async () => {
  if (!typeMultipleSelection.value.length) {
    ElMessage.info('请先选择要删除的字典类型')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${typeMultipleSelection.value.length} 个字典类型吗？（会同时影响其下字典数据）`,
      '提示',
      {
        type: 'warning',
      },
    )
    const ids = typeMultipleSelection.value.map((t) => t.id)
    await batchDeleteDictType({ dictTypeIds: ids })
    ElMessage.success('批量删除成功')
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

const handleTypeToggleStatus = async (row: DictTypeVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchDictTypeStatus({ dictTypeId: row.id, status: targetStatus })
    ElMessage.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchTypeData()
  } catch (error) {
    handleErrorToast(error)
  }
}

const handleTypeSubmit = async () => {
  try {
    if (!typeForm.dictTypeCode) {
      ElMessage.warning('请填写字典类型编码')
      return
    }
    if (!typeForm.dictTypeName) {
      ElMessage.warning('请填写字典类型名称')
      return
    }

    if (editingTypeId.value) {
      const payload: DictTypeUpdateRequest = {
        id: editingTypeId.value,
        dictTypeCode: typeForm.dictTypeCode,
        dictTypeName: typeForm.dictTypeName,
        status: typeForm.status,
        sortOrder: typeForm.sortOrder,
        remark: typeForm.remark || undefined,
      }
      await updateDictType(payload)
      ElMessage.success('更新成功')
    } else {
      const payload: DictTypeCreateRequest = {
        dictTypeCode: typeForm.dictTypeCode,
        dictTypeName: typeForm.dictTypeName,
        status: typeForm.status,
        sortOrder: typeForm.sortOrder,
        remark: typeForm.remark || undefined,
      }
      await createDictType(payload)
      ElMessage.success('创建成功')
    }
    typeDialogVisible.value = false
    fetchTypeData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// ====== 字典数据（右侧） ======

const dataQuery = reactive<DictDataPageQuery>({
  pageNum: 1,
  pageSize: 10,
  dictTypeId: undefined,
  dictLabel: '',
  dictValue: '',
  status: null,
})

const dataLoading = ref(false)
const dataTableData = ref<DictDataVo[]>([])
const dataTotal = ref(0)
const dataMultipleSelection = ref<DictDataVo[]>([])

const dataDialogVisible = ref(false)
const dataDialogTitle = ref('新建字典数据')
const editingDataId = ref<number | null>(null)

const dataForm = reactive<DictDataCreateRequest & { id?: number }>({
  dictTypeId: 0,
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  isDefault: 0,
  status: 1,
  remark: '',
})

const resetDataForm = () => {
  editingDataId.value = null
  dataDialogTitle.value = '新建字典数据'
  dataForm.dictTypeId = currentTypeId.value || 0
  dataForm.dictLabel = ''
  dataForm.dictValue = ''
  dataForm.dictSort = 0
  dataForm.isDefault = 0
  dataForm.status = 1
  dataForm.remark = ''
}

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

const handleDataSearch = () => {
  dataQuery.pageNum = 1
  fetchDataData()
}

const handleDataReset = () => {
  dataQuery.pageNum = 1
  dataQuery.dictLabel = ''
  dataQuery.dictValue = ''
  dataQuery.status = null
  fetchDataData()
}

const handleDataSizeChange = (size: number) => {
  dataQuery.pageSize = size
  fetchDataData()
}

const handleDataCurrentChange = (page: number) => {
  dataQuery.pageNum = page
  fetchDataData()
}

const handleDataSelectionChange = (rows: DictDataVo[]) => {
  dataMultipleSelection.value = rows
}

const handleDataCreate = () => {
  if (!currentTypeId.value) {
    ElMessage.warning('请先选择左侧字典类型')
    return
  }
  resetDataForm()
  dataForm.dictTypeId = currentTypeId.value
  dataDialogTitle.value = '新建字典数据'
  dataDialogVisible.value = true
}

const handleDataEdit = (row: DictDataVo) => {
  resetDataForm()
  dataDialogTitle.value = '编辑字典数据'
  editingDataId.value = row.id
  dataForm.dictTypeId = row.dictTypeId
  dataForm.dictLabel = row.dictLabel
  dataForm.dictValue = row.dictValue
  dataForm.dictSort = row.dictSort ?? 0
  dataForm.isDefault = row.isDefault ?? 0
  dataForm.status = row.status ?? 1
  dataForm.remark = row.remark || ''
  dataDialogVisible.value = true
}

const handleDataDelete = async (row: DictDataVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除字典数据【${row.dictLabel}】吗？`, '提示', {
      type: 'warning',
    })
    await deleteDictData(row.id)
    ElMessage.success('删除成功')
    fetchDataData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

const handleDataBatchDelete = async () => {
  if (!dataMultipleSelection.value.length) {
    ElMessage.info('请先选择要删除的字典数据')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${dataMultipleSelection.value.length} 条字典数据吗？`, '提示', {
      type: 'warning',
    })
    const ids = dataMultipleSelection.value.map((d) => d.id)
    await batchDeleteDictData({ dictDataIds: ids })
    ElMessage.success('批量删除成功')
    fetchDataData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

const handleDataToggleStatus = async (row: DictDataVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchDictDataStatus({ dictDataId: row.id, status: targetStatus })
    ElMessage.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchDataData()
  } catch (error) {
    handleErrorToast(error)
  }
}

const handleDataSubmit = async () => {
  try {
    if (!dataForm.dictTypeId) {
      ElMessage.warning('字典类型不能为空')
      return
    }
    if (!dataForm.dictLabel) {
      ElMessage.warning('请填写字典标签')
      return
    }
    if (!dataForm.dictValue) {
      ElMessage.warning('请填写字典值')
      return
    }

    if (editingDataId.value) {
      const payload: DictDataUpdateRequest = {
        id: editingDataId.value,
        dictTypeId: dataForm.dictTypeId,
        dictLabel: dataForm.dictLabel,
        dictValue: dataForm.dictValue,
        dictSort: dataForm.dictSort,
        isDefault: dataForm.isDefault,
        status: dataForm.status,
        remark: dataForm.remark || undefined,
      }
      await updateDictData(payload)
      ElMessage.success('更新成功')
    } else {
      const payload: DictDataCreateRequest = {
        dictTypeId: dataForm.dictTypeId,
        dictLabel: dataForm.dictLabel,
        dictValue: dataForm.dictValue,
        dictSort: dataForm.dictSort,
        isDefault: dataForm.isDefault,
        status: dataForm.status,
        remark: dataForm.remark || undefined,
      }
      await createDictData(payload)
      ElMessage.success('创建成功')
    }
    dataDialogVisible.value = false
    fetchDataData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 下拉中需要用到的字典类型列表（可扩展用作过滤等）
const enabledDictTypes = ref<DictTypeVo[]>([])

const loadEnabledDictTypes = async () => {
  try {
    enabledDictTypes.value = await listAllEnabledDictTypes()
  } catch (error) {
    // 只是辅助功能，报错不打断主流程
    console.error(error)
  }
}

// 合并的 onMounted
onMounted(() => {
  fetchTypeData()
  loadEnabledDictTypes()
})

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
    <h2 class="page-title">数据字典管理</h2>

    <div class="dict-layout">
      <!-- 左侧：字典类型 -->
      <div class="dict-panel">
        <div class="panel-header">
          <div class="panel-title">字典类型</div>
          <div class="panel-actions">
            <el-button type="primary" size="small" @click="handleTypeCreate">新建类型</el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="!typeMultipleSelection.length"
              @click="handleTypeBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <div class="search-card">
          <el-form :inline="true" label-width="80px">
            <el-form-item label="类型编码">
              <el-input v-model="typeQuery.dictTypeCode" placeholder="类型编码" clearable />
            </el-form-item>
            <el-form-item label="类型名称">
              <el-input v-model="typeQuery.dictTypeName" placeholder="类型名称" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="typeQuery.status"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTypeSearch">查询</el-button>
              <el-button @click="handleTypeReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table
          v-loading="typeLoading"
          :data="typeTableData"
          border
          stripe
          height="430"
          highlight-current-row
          @selection-change="handleTypeSelectionChange"
          @row-click="handleTypeRowClick"
          :row-class-name="getTypeRowClassName"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="dictTypeCode" label="类型编码" min-width="100" show-overflow-tooltip />
          <el-table-column prop="dictTypeName" label="类型名称" min-width="100" show-overflow-tooltip />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column label="操作" fixed="right" width="160">
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="handleTypeEdit(row)">编辑</el-button>
              <el-button type="primary" link @click.stop="handleTypeToggleStatus(row)">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click.stop="handleTypeDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="typeTotal"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="typeQuery.pageSize || 10"
            :current-page="typeQuery.pageNum || 1"
            @size-change="handleTypeSizeChange"
            @current-change="handleTypeCurrentChange"
          />
        </div>
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
          <div class="panel-actions">
            <el-button type="primary" size="small" @click="handleDataCreate">新建数据</el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="!dataMultipleSelection.length"
              @click="handleDataBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <div class="search-card">
          <el-form :inline="true" label-width="80px">
            <el-form-item label="字典标签">
              <el-input v-model="dataQuery.dictLabel" placeholder="字典标签" clearable />
            </el-form-item>
            <el-form-item label="字典值">
              <el-input v-model="dataQuery.dictValue" placeholder="字典值" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="dataQuery.status"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleDataSearch">查询</el-button>
              <el-button @click="handleDataReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table
          v-loading="dataLoading"
          :data="dataTableData"
          border
          stripe
          height="430"
          @selection-change="handleDataSelectionChange"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="dictLabel" label="字典标签" min-width="100" show-overflow-tooltip />
          <el-table-column prop="dictValue" label="字典值" min-width="80" show-overflow-tooltip />
          <el-table-column prop="dictSort" label="排序" width="70" />
          <el-table-column prop="isDefault" label="默认" width="70">
            <template #default="{ row }">
              <el-tag v-if="row.isDefault === 1" size="small" type="success">是</el-tag>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDataEdit(row)">编辑</el-button>
              <el-button type="primary" link @click="handleDataToggleStatus(row)">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click="handleDataDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="dataTotal"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="dataQuery.pageSize || 10"
            :current-page="dataQuery.pageNum || 1"
            @size-change="handleDataSizeChange"
            @current-change="handleDataCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 字典类型弹窗 -->
    <el-dialog v-model="typeDialogVisible" :title="typeDialogTitle" width="520px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="类型编码" required>
          <el-input
            v-model="typeForm.dictTypeCode"
            placeholder="请输入字典类型编码"
            :disabled="!!editingTypeId"
          />
        </el-form-item>
        <el-form-item label="类型名称" required>
          <el-input v-model="typeForm.dictTypeName" placeholder="请输入字典类型名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="typeForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="typeForm.status" style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="typeDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleTypeSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 字典数据弹窗 -->
    <el-dialog v-model="dataDialogVisible" :title="dataDialogTitle" width="560px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="所属类型" required>
          <el-select
            v-model="dataForm.dictTypeId"
            placeholder="请选择字典类型"
            style="width: 220px"
          >
            <el-option
              v-for="item in enabledDictTypes"
              :key="item.id"
              :label="`${item.dictTypeName}（${item.dictTypeCode}）`"
              :value="item.id"
            />
          </el-select>
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
          <el-select v-model="dataForm.status" style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dataForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dataDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDataSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
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

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2933;
}

.dict-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.8fr);
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

.panel-actions {
  display: flex;
  gap: 8px;
}

.search-card {
  padding: 10px 12px 2px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #edf1f7;
  margin-bottom: 8px;
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
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
</style>
