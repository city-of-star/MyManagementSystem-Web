<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getConfigPage,
  type PageResult,
  type ConfigVo,
  type ConfigPageQuery,
  createConfig,
  updateConfig,
  deleteConfigApi,
  batchDeleteConfig,
  switchConfigStatus,
} from '@/api/system/config/config.ts'
import { handleErrorToast } from '@/utils/http'

const query = reactive<ConfigPageQuery>({
  pageNum: 1,
  pageSize: 10,
  configKey: '',
  configName: '',
  configType: '',
  status: null,
  editable: null,
})

const loading = ref(false)
const tableData = ref<ConfigVo[]>([])
const total = ref(0)
const multipleSelection = ref<ConfigVo[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新建配置')
const editingId = ref<number | null>(null)

const form = reactive({
  configKey: '',
  configValue: '',
  configType: 'string',
  configName: '',
  status: 1,
  editable: 1,
  remark: '',
})

const resetForm = () => {
  editingId.value = null
  dialogTitle.value = '新建配置'
  form.configKey = ''
  form.configValue = ''
  form.configType = 'string'
  form.configName = ''
  form.status = 1
  form.editable = 1
  form.remark = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<ConfigVo> = await getConfigPage(query)
    tableData.value = resp.records
    total.value = resp.total
    query.pageNum = resp.current
    query.pageSize = resp.size
  } catch (error) {
    handleErrorToast(error, '加载参数配置列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const handleSearch = () => {
  query.pageNum = 1
  fetchData()
}

const handleReset = () => {
  query.pageNum = 1
  query.configKey = ''
  query.configName = ''
  query.configType = ''
  query.status = null
  query.editable = null
  fetchData()
}

const handleSizeChange = (size: number) => {
  query.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  query.pageNum = page
  fetchData()
}

const handleSelectionChange = (rows: ConfigVo[]) => {
  multipleSelection.value = rows
}

const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建配置'
  dialogVisible.value = true
}

const handleEdit = (row: ConfigVo) => {
  resetForm()
  dialogTitle.value = '编辑配置'
  editingId.value = row.id
  form.configKey = row.configKey
  form.configValue = row.configValue || ''
  form.configType = row.configType
  form.configName = row.configName
  form.status = row.status ?? 1
  form.editable = row.editable ?? 1
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const handleDelete = async (row: ConfigVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除配置【${row.configKey}】吗？`, '提示', {
      type: 'warning',
    })
    await deleteConfigApi(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error, '删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    ElMessage.info('请先选择要删除的配置')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 条配置吗？`, '提示', {
      type: 'warning',
    })
    const ids = multipleSelection.value.map((c) => c.id)
    await batchDeleteConfig({ configIds: ids })
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error, '批量删除失败')
    }
  }
}

const handleToggleStatus = async (row: ConfigVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchConfigStatus({ configId: row.id, status: targetStatus })
    ElMessage.success(targetStatus === 1 ? '已启用配置' : '已禁用配置')
    fetchData()
  } catch (error) {
    handleErrorToast(error, '切换配置状态失败')
  }
}

const handleSubmit = async () => {
  try {
    if (!form.configKey) {
      ElMessage.warning('请填写配置键')
      return
    }
    if (!form.configName) {
      ElMessage.warning('请填写配置名称')
      return
    }

    if (editingId.value) {
      await updateConfig({
        id: editingId.value,
        configKey: form.configKey,
        configValue: form.configValue || undefined,
        configType: form.configType,
        configName: form.configName,
        status: form.status,
        editable: form.editable,
        remark: form.remark || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await createConfig({
        configKey: form.configKey,
        configValue: form.configValue || undefined,
        configType: form.configType,
        configName: form.configName,
        status: form.status,
        editable: form.editable,
        remark: form.remark || undefined,
      })
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchData()
  } catch (error) {
    handleErrorToast(error, editingId.value ? '更新失败' : '创建失败')
  }
}
</script>

<template>
  <div class="param-page">
    <h2 class="page-title">参数管理</h2>

    <div class="search-card">
      <el-form :inline="true" label-width="80px">
        <el-form-item label="配置键">
          <el-input v-model="query.configKey" placeholder="配置键" clearable />
        </el-form-item>
        <el-form-item label="配置名称">
          <el-input v-model="query.configName" placeholder="配置名称" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.configType" placeholder="全部" clearable style="width: 140px">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
            <el-option label="JSON" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="可编辑">
          <el-select v-model="query.editable" placeholder="全部" clearable style="width: 120px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">新建配置</el-button>
      <el-button type="danger" :disabled="!multipleSelection.length" @click="handleBatchDelete">
        批量删除
      </el-button>
    </div>

    <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="configKey" label="配置键" min-width="180" />
      <el-table-column prop="configName" label="配置名称" min-width="180" />
      <el-table-column prop="configType" label="类型" width="100">
        <template #default="{ row }">
          <span>
            {{
              row.configType === 'number'
                  ? '数字'
                  : row.configType === 'boolean'
                      ? '布尔'
                      : row.configType === 'json'
                          ? 'JSON'
                          : '字符串'
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip />
      <el-table-column label="可编辑" width="90">
        <template #default="{ row }">
          <el-tag :type="row.editable === 1 ? 'success' : 'info'">
            {{ row.editable === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="220">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleToggleStatus(row)">
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="query.pageSize || 10"
          :current-page="query.pageNum || 1"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form label-width="100px" class="dialog-form">
        <el-form-item label="配置键" required>
          <el-input v-model="form.configKey" placeholder="请输入配置键，例如：system.name" />
        </el-form-item>
        <el-form-item label="配置名称" required>
          <el-input v-model="form.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="配置类型">
          <el-select v-model="form.configType" style="width: 160px">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
            <el-option label="JSON" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置值">
          <el-input
              v-model="form.configValue"
              type="textarea"
              :rows="3"
              placeholder="请输入配置值，JSON 类型请填写合法 JSON 文本"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="可编辑">
          <el-select v-model="form.editable" style="width: 140px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.param-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2933;
}

.search-card {
  padding: 16px 20px 4px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.pagination {
  margin-top: 16px;
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
</style>

