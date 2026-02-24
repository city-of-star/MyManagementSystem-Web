<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import { handleErrorToast } from '@/utils/http'
import SearchForm from '@/components/layout/SearchForm.vue'
import DataTable from '@/components/layout/DataTable.vue'
import Pagination from '@/components/layout/Pagination.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import IconButton from '@/components/button/IconButton.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import DictSelect from '@/components/dict/DictSelect.vue'
import DictTag from '@/components/dict/DictTag.vue'
import DateRangePicker from '@/components/datePicker/DateRangePicker.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { useDict } from '@/utils/base/dictUtils.ts'
import {
  batchDeleteJob,
  createJob,
  deleteJob,
  getJobPage,
  switchJobStatus,
  updateJob,
  type JobPageQuery,
  type JobVo,
} from '@/api/system/job/job.ts'
import type { PageResult } from '@/api/common/types.ts'

// 查询条件
const query = reactive<JobPageQuery>({
  pageNum: 1,
  pageSize: 10,
  serviceName: '',
  jobCode: '',
  jobName: '',
  enabled: null,
  createTimeStart: null,
  createTimeEnd: null,
})

// 字典：通用状态（用于启用/禁用）
const { options: statusOptions, loading: statusLoading, load: statusLoad } = useDict('common_status')

// 列表 & 分页
const loading = ref(true)
const tableData = ref<JobVo[]>([])
const total = ref(0)

// 选中行
const multipleSelection = ref<JobVo[]>([])

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新建定时任务')
const editingJobId = ref<string | null>(null)

// 表单（用于新增/编辑）
const form = reactive({
  serviceName: '',
  jobCode: '',
  jobName: '',
  cronExpr: '',
  runMode: 'single',
  enabled: 1,
  timeoutMs: 0,
  remark: '',
  paramsJson: '',
})

// 初始化
onMounted(async () => {
  await statusLoad()
  await fetchData()
})

// 查询按钮
const handleSearch = () => {
  query.pageNum = 1
  fetchData()
}

// 重置按钮
const handleReset = () => {
  query.pageNum = 1
  query.serviceName = ''
  query.jobCode = ''
  query.jobName = ''
  query.enabled = null
  query.createTimeStart = null
  query.createTimeEnd = null
  fetchData()
}

// 分页查询定时任务列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<JobVo> = await getJobPage(query)
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
const handleSelectionChange = (rows: JobVo[]) => {
  multipleSelection.value = rows
}

// 新建按钮
const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建定时任务'
  dialogVisible.value = true
}

// 编辑按钮
const handleEdit = (row: JobVo) => {
  resetForm()
  dialogTitle.value = '编辑定时任务'
  editingJobId.value = row.id
  form.serviceName = row.serviceName
  form.jobCode = row.jobCode
  form.jobName = row.jobName
  form.cronExpr = row.cronExpr
  form.runMode = row.runMode
  form.enabled = row.enabled ?? 1
  form.timeoutMs = row.timeoutMs ?? 0
  form.remark = row.remark || ''
  form.paramsJson = row.paramsJson || ''
  dialogVisible.value = true
}

// （新建/编辑）确定按钮
const handleSubmit = async () => {
  try {
    if (!form.serviceName) {
      Message.warning('请填写所属服务名称')
      return
    }
    if (!editingJobId.value && !form.jobCode) {
      Message.warning('请填写任务编码')
      return
    }
    if (!form.jobName) {
      Message.warning('请填写任务名称')
      return
    }
    if (!form.cronExpr) {
      Message.warning('请填写 Cron 表达式')
      return
    }
    if (!form.runMode) {
      Message.warning('请填写运行模式')
      return
    }

    if (editingJobId.value) {
      await updateJob({
        id: editingJobId.value,
        serviceName: form.serviceName || undefined,
        jobName: form.jobName || undefined,
        cronExpr: form.cronExpr || undefined,
        runMode: form.runMode || undefined,
        enabled: form.enabled,
        timeoutMs: form.timeoutMs,
        remark: form.remark || undefined,
        paramsJson: form.paramsJson || undefined,
      })
      Message.success('更新成功')
    } else {
      await createJob({
        serviceName: form.serviceName,
        jobCode: form.jobCode,
        jobName: form.jobName,
        cronExpr: form.cronExpr,
        runMode: form.runMode,
        enabled: form.enabled,
        timeoutMs: form.timeoutMs,
        remark: form.remark || undefined,
        paramsJson: form.paramsJson || undefined,
      })
      Message.success('创建成功')
    }
    dialogVisible.value = false
    await fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 重置（新增/编辑）表单
const resetForm = () => {
  editingJobId.value = null
  dialogTitle.value = '新建定时任务'
  form.serviceName = ''
  form.jobCode = ''
  form.jobName = ''
  form.cronExpr = ''
  form.runMode = 'single'
  form.enabled = 1
  form.timeoutMs = 0
  form.remark = ''
  form.paramsJson = ''
}

// 删除按钮
const handleDelete = async (row: JobVo) => {
  try {
    await Message.confirm(`确定要删除定时任务【${row.jobName}】吗？`)
    await deleteJob(row.id)
    Message.success('删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 批量删除按钮
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    Message.info('请先选择要删除的定时任务')
    return
  }
  try {
    await Message.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个定时任务吗？`)
    const jobIds = multipleSelection.value.map((j) => j.id)
    await batchDeleteJob({ jobIds })
    Message.success('批量删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleToggleStatus = async (row: JobVo) => {
  const targetEnabled = row.enabled === 1 ? 0 : 1
  try {
    await switchJobStatus({ jobId: row.id, enabled: targetEnabled })
    Message.success(targetEnabled === 1 ? '已启用' : '已禁用')
    await fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}
</script>

<template>
  <div class="job-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="所属服务">
        <el-input v-model="query.serviceName" placeholder="请输入所属服务名称" clearable />
      </el-form-item>
      <el-form-item label="任务编码">
        <el-input v-model="query.jobCode" placeholder="请输入任务编码" clearable />
      </el-form-item>
      <el-form-item label="任务名称">
        <el-input v-model="query.jobName" placeholder="请输入任务名称" clearable />
      </el-form-item>
      <el-form-item label="启用状态">
        <DictSelect :options="statusOptions" :loading="statusLoading" v-model.number="query.enabled" />
      </el-form-item>
      <el-form-item label="创建时间">
        <DateRangePicker v-model:start="query.createTimeStart" v-model:end="query.createTimeEnd" type="datetime" />
      </el-form-item>
    </SearchForm>

    <!-- 操作栏 -->
    <Toolbar>
      <PrimaryButton icon="Plus" type="primary" @click="handleCreate">新建定时任务</PrimaryButton>
      <PrimaryButton
        icon="Delete"
        type="danger"
        :disabled="!multipleSelection.length"
        @click="handleBatchDelete"
      >
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
      <el-table-column type="selection" width="40" />
      <el-table-column prop="serviceName" label="所属服务" min-width="140" show-overflow-tooltip />
      <el-table-column prop="jobCode" label="任务编码" min-width="140" show-overflow-tooltip />
      <el-table-column prop="jobName" label="任务名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="cronExpr" label="Cron 表达式" min-width="180" show-overflow-tooltip />
      <el-table-column prop="runMode" label="运行模式" width="120" show-overflow-tooltip />
      <el-table-column label="启用状态" width="110">
        <template #default="{ row }">
          <DictTag :options="statusOptions" :value="row.enabled" :type-map="{ '1': 'success', '0': 'info' }" />
        </template>
      </el-table-column>
      <el-table-column prop="timeoutMs" label="超时(毫秒)" width="120" />
      <el-table-column prop="createTime" label="创建时间" min-width="170" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="更新时间" min-width="170" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="220">
        <template #default="{ row }">
          <IconButton type="primary" icon="Edit" tooltip="编辑" @click="handleEdit(row)" />
          <IconButton
            type="primary"
            :icon="row.enabled === 1 ? 'CircleClose' : 'CircleCheck'"
            :tooltip="row.enabled === 1 ? '禁用' : '启用'"
            @click="handleToggleStatus(row)"
          />
          <IconButton type="danger" icon="Delete" tooltip="删除" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </DataTable>

    <!-- 分页 -->
    <Pagination :query="query" :total="total" @change="fetchData" />

    <!-- 新增/编辑弹窗 -->
    <BaseDialog v-model="dialogVisible" :title="dialogTitle" width="560px" @confirm="handleSubmit">
      <el-form label-width="120px" class="dialog-form">
        <el-form-item label="所属服务" required>
          <el-input v-model="form.serviceName" placeholder="请输入所属服务名称" />
        </el-form-item>
        <el-form-item label="任务编码" required>
          <el-input v-model="form.jobCode" placeholder="请输入任务编码" :disabled="!!editingJobId" />
        </el-form-item>
        <el-form-item label="任务名称" required>
          <el-input v-model="form.jobName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="Cron 表达式" required>
          <el-input v-model="form.cronExpr" placeholder="请输入 Cron 表达式" />
        </el-form-item>
        <el-form-item label="运行模式" required>
          <el-select v-model="form.runMode" placeholder="请选择运行模式" style="width: 100%">
            <el-option label="single（集群只跑一份）" value="single" />
            <el-option label="all（每实例都跑）" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态">
          <DictSelect :options="statusOptions" :loading="statusLoading" v-model.number="form.enabled" />
        </el-form-item>
        <el-form-item label="超时毫秒">
          <el-input-number v-model="form.timeoutMs" :min="0" :step="1000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="任务参数JSON">
          <el-input
            v-model="form.paramsJson"
            type="textarea"
            :rows="3"
            placeholder="请输入任务参数（JSON 字符串，可选）"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>

<style scoped>
.job-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-form {
  padding-top: 8px;
}
</style>
