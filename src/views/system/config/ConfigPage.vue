<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  getConfigPage,
  type ConfigVo,
  type ConfigPageQuery,
  createConfig,
  updateConfig,
  deleteConfigApi,
  batchDeleteConfig,
  switchConfigStatus,
} from '@/api/system/config/config.ts'
import {type PageResult} from '@/api/common/types.ts'
import {handleErrorToast} from '@/utils/http'
import {useDict} from '@/utils/base/dictUtils.ts'
import SearchForm from '@/components/SearchForm.vue'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'
import Toolbar from '@/components/Toolbar.vue'
import IconButton from '@/components/button/IconButton.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'

// 查询条件
const query = reactive<ConfigPageQuery>({
  pageNum: 1,
  pageSize: 10,
  configKey: '',
  configName: '',
  configType: '',
  status: null,
  editable: null,
})

// 字典：通用状态、是否、配置类型
const {options: statusOptions, findLabel: statusFindLabel, load: loadStatusDict} = useDict('common_status')
const {options: yesNoOptions, findLabel: yesNoFindLabel, load: loadYesNoDict} = useDict('yes_no')
const {options: configTypeOptions, findLabel: configTypeFindLabel, load: loadConfigTypeDict} = useDict('config_type')

// 列表 & 分页
const loading = ref(false)
const tableData = ref<ConfigVo[]>([])
const total = ref(0)

// 选中行
const multipleSelection = ref<ConfigVo[]>([])

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新建配置')
const editingId = ref<number | null>(null)

// 表单（用于新增/编辑）
const form = reactive({
  configKey: '',
  configValue: '',
  configType: 'string',
  configName: '',
  status: 1,
  editable: 1,
  remark: '',
})

// 初始化
onMounted(() => {
  // 加载列表数据
  fetchData()
  // 加载字典
  loadStatusDict()
  loadYesNoDict()
  loadConfigTypeDict()
})

// 查询按钮
const handleSearch = () => {
  query.pageNum = 1
  fetchData()
}

// 重置按钮
const handleReset = () => {
  query.pageNum = 1
  query.configKey = ''
  query.configName = ''
  query.configType = ''
  query.status = null
  query.editable = null
  fetchData()
}

// 分页查询配置列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<ConfigVo> = await getConfigPage(query)
    tableData.value = resp.records
    total.value = resp.total
    query.pageNum = resp.current
    query.pageSize = resp.size
  } catch (error) {
    handleErrorToast(error)
  } finally {
    loading.value = false
  }
}

// 选中行变化
const handleSelectionChange = (rows: ConfigVo[]) => {
  multipleSelection.value = rows
}

// 新建按钮
const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建配置'
  dialogVisible.value = true
}

// 编辑按钮
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

// （新建/编辑）确定按钮
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
    handleErrorToast(error)
  }
}

// 重置（新增/编辑）表单
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

// 删除按钮
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
      handleErrorToast(error)
    }
  }
}

// 批量删除按钮
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
    await batchDeleteConfig({configIds: ids})
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleToggleStatus = async (row: ConfigVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchConfigStatus({configId: row.id, status: targetStatus})
    ElMessage.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}
</script>

<template>
  <div class="config-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="配置键">
        <el-input v-model="query.configKey" placeholder="请输入配置键" clearable />
      </el-form-item>
      <el-form-item label="配置名称">
        <el-input v-model="query.configName" placeholder="请输入配置名称" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="query.configType" placeholder="全部" clearable >
          <el-option
            v-for="opt in configTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部" clearable >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="Number(opt.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="可编辑">
        <el-select v-model="query.editable" placeholder="全部" clearable >
          <el-option
            v-for="opt in yesNoOptions"
            :key="opt.value"
            :label="opt.label"
            :value="Number(opt.value)"
          />
        </el-select>
      </el-form-item>
    </SearchForm>

    <!-- 操作栏 -->
    <Toolbar>
      <PrimaryButton icon="Plus" type="primary" @click="handleCreate">
        新建配置
      </PrimaryButton>
      <PrimaryButton icon="Delete" type="danger" :disabled="!multipleSelection.length" @click="handleBatchDelete">
        批量删除
      </PrimaryButton>
    </Toolbar>

    <!-- 表格 -->
    <DataTable
      :data="tableData"
      :loading="loading"
      :page-num="query.pageNum"
      :page-size="query.pageSize"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="configKey" label="配置键" min-width="180" />
      <el-table-column prop="configName" label="配置名称" min-width="180" />
      <el-table-column prop="configType" label="类型" width="100">
        <template #default="{ row }">
          {{ configTypeFindLabel(row.configType) || row.configType || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip />
      <el-table-column label="可编辑" width="90">
        <template #default="{ row }">
          <el-tag :type="row.editable === 1 ? 'success' : 'info'">
            {{ yesNoFindLabel(row.editable) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ statusFindLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <IconButton type="primary" icon="Edit" tooltip="编辑" @click="handleEdit(row)" />
          <IconButton
            type="primary"
            :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'"
            :tooltip="statusFindLabel(row.status === 1 ? 0 : 1)"
            @click="handleToggleStatus(row)"
          />
          <IconButton type="danger" icon="Delete" tooltip="删除" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </DataTable>

    <!-- 分页 -->
    <Pagination :query="query" :total="total" @change="fetchData" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form label-width="100px" class="dialog-form">
        <el-form-item label="配置键" required>
          <el-input
            v-model="form.configKey"
            placeholder="请输入配置键，例如：system.name"
            :disabled="!!editingId"
          />
        </el-form-item>
        <el-form-item label="配置名称" required>
          <el-input v-model="form.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="配置类型">
          <el-select v-model="form.configType" style="width: 160px">
            <el-option
              v-for="opt in configTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
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
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="Number(opt.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可编辑">
          <el-select v-model="form.editable" style="width: 140px">
            <el-option
              v-for="opt in yesNoOptions"
              :key="opt.value"
              :label="opt.label"
              :value="Number(opt.value)"
            />
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
.config-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

