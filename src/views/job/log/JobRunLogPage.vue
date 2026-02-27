<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {Message} from '@/utils/base/messageUtils.ts'
import {handleErrorToast} from '@/utils/http'
import SearchForm from '@/components/layout/SearchForm.vue'
import DataTable from '@/components/layout/DataTable.vue'
import Pagination from '@/components/layout/Pagination.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import IconButton from '@/components/button/IconButton.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import DateRangePicker from '@/components/datePicker/DateRangePicker.vue'
import type {PageResult} from '@/api/common/types.ts'
import { useDict } from '@/utils/base/dictUtils.ts'
import {
  batchDeleteJobRunLog,
  deleteJobRunLog,
  exportJobRunLog,
  getJobRunLogById,
  getJobRunLogPage,
  type JobRunLogBatchDeleteRequest,
  type JobRunLogPageQuery,
  type JobRunLogVo,
  retryJobRun,
  terminateJobRun,
} from '@/api/job/jobRunLog.ts'
import DictSelect from "@/components/dict/DictSelect.vue";

// 查询条件
const query = reactive<JobRunLogPageQuery>({
  pageNum: 1,
  pageSize: 10,
  jobId: null,
  runId: '',
  status: null,
  startTimeStart: null,
  startTimeEnd: null,
})

// 字典：定时任务状态
const { options: jobStatusOptions, loading: jobStatusLoading, load: jobStatusLoad } = useDict('job_status')

// 列表 & 分页
const loading = ref(true)
const tableData = ref<JobRunLogVo[]>([])
const total = ref(0)

// 选中行
const multipleSelection = ref<JobRunLogVo[]>([])

// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = ref<JobRunLogVo | null>(null)

// 初始化
onMounted(async () => {
  await jobStatusLoad()
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
  query.jobId = null
  query.runId = ''
  query.status = null
  query.startTimeStart = null
  query.startTimeEnd = null
  fetchData()
}

// 分页查询执行记录列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<JobRunLogVo> = await getJobRunLogPage(query)
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
const handleSelectionChange = (rows: JobRunLogVo[]) => {
  multipleSelection.value = rows
}

// 查看详情
const handleViewDetail = async (row: JobRunLogVo) => {
  try {
    detailData.value = await getJobRunLogById(row.id)
    detailDialogVisible.value = true
  } catch (error) {
    handleErrorToast(error)
  }
}

// 删除按钮
const handleDelete = async (row: JobRunLogVo) => {
  try {
    await Message.confirm(`确定要删除执行记录【${row.runId}】吗？`)
    await deleteJobRunLog(row.id)
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
    Message.info('请先选择要删除的执行记录')
    return
  }
  try {
    await Message.confirm(`确定要删除选中的 ${multipleSelection.value.length} 条执行记录吗？`)
    const logIds = multipleSelection.value.map((item) => item.id)
    const payload: JobRunLogBatchDeleteRequest = { logIds }
    await batchDeleteJobRunLog(payload)
    Message.success('批量删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 导出按钮（当前后端尚未实现，调用会提示未实现）
const handleExport = async () => {
  try {
    await exportJobRunLog(query)
    // 真正的导出逻辑（文件下载）后续配合后端实现
  } catch (error) {
    handleErrorToast(error)
  }
}

// 重试执行
const handleRetry = async (row: JobRunLogVo) => {
  try {
    await Message.confirm(`确定要重试执行任务（执行ID：${row.runId}）吗？`)
    await retryJobRun(row.id)
    Message.success('已触发重试（如后端已实现）')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 终止执行
const handleTerminate = async (row: JobRunLogVo) => {
  try {
    await Message.confirm(`确定要终止本次执行（执行ID：${row.runId}）吗？`)
    await terminateJobRun(row.id)
    Message.success('已触发终止（如后端已实现）')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 状态是否允许重试
const canRetry = (row: JobRunLogVo) => {
  return row.status === 'FAIL' || row.status === 'TIMEOUT' || row.status === 'SKIP'
}

// 状态是否允许终止
const canTerminate = (row: JobRunLogVo) => {
  return row.status === 'RUNNING'
}
</script>

<template>
  <div class="job-run-log-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="任务ID">
        <el-input v-model="query.jobId" placeholder="请输入任务ID" clearable />
      </el-form-item>
      <el-form-item label="执行ID">
        <el-input v-model="query.runId" placeholder="请输入执行ID" clearable />
      </el-form-item>
      <el-form-item label="执行状态">
        <DictSelect :options="jobStatusOptions" :loading="jobStatusLoading" v-model="query.status" />
      </el-form-item>
      <el-form-item label="开始时间">
        <DateRangePicker v-model:start="query.startTimeStart" v-model:end="query.startTimeEnd" type="datetime"/>
      </el-form-item>
    </SearchForm>

    <!-- 操作栏 -->
    <Toolbar>
      <PrimaryButton icon="Delete" type="danger" :disabled="!multipleSelection.length" @click="handleBatchDelete">批量删除</PrimaryButton>
      <PrimaryButton icon="Download" type="primary" @click="handleExport">导出</PrimaryButton>
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
      <el-table-column prop="jobId" label="任务ID" min-width="80" />
      <el-table-column prop="jobName" label="任务名称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="runId" label="执行ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="startTime" label="开始时间" min-width="170" show-overflow-tooltip />
      <el-table-column prop="endTime" label="结束时间" min-width="170" show-overflow-tooltip />
      <el-table-column prop="durationMs" label="耗时(毫秒)" width="110" />
      <el-table-column prop="instanceId" label="实例ID" min-width="120" show-overflow-tooltip />
      <el-table-column prop="host" label="主机" min-width="140" show-overflow-tooltip />
      <el-table-column prop="errorMessage" label="错误摘要" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="160">
        <template #default="{ row }">
          <IconButton type="primary" icon="View" tooltip="详情" @click="handleViewDetail(row)"/>
          <IconButton type="primary" icon="Refresh" tooltip="重试执行" :disabled="!canRetry(row)" @click="handleRetry(row)"/>
          <IconButton type="warning" icon="CircleClose" tooltip="终止执行" :disabled="!canTerminate(row)" @click="handleTerminate(row)"/>
          <IconButton type="danger" icon="Delete" tooltip="删除" @click="handleDelete(row)"/>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 分页 -->
    <Pagination :query="query" :total="total" @change="fetchData" />

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="执行记录详情"
      width="640px"
    >
      <el-descriptions
        v-if="detailData"
        :column="2"
        border
        size="small"
      >
        <el-descriptions-item label="记录ID">
          {{ detailData.id }}
        </el-descriptions-item>
        <el-descriptions-item label="任务ID">
          {{ detailData.jobId }}
        </el-descriptions-item>
        <el-descriptions-item label="任务名称">
          {{ detailData.jobName }}
        </el-descriptions-item>
        <el-descriptions-item label="执行ID">
          {{ detailData.runId }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ detailData.status }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ detailData.startTime }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ detailData.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="耗时(毫秒)">
          {{ detailData.durationMs }}
        </el-descriptions-item>
        <el-descriptions-item label="实例ID">
          {{ detailData.instanceId }}
        </el-descriptions-item>
        <el-descriptions-item label="主机">
          {{ detailData.host }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ detailData.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ detailData.updateTime }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">错误信息</el-divider>
      <el-input
        :model-value="detailData?.errorMessage || ''"
        type="textarea"
        :rows="2"
        readonly
        placeholder="无"
      />

      <el-divider content-position="left">错误堆栈</el-divider>
      <el-input
        :model-value="detailData?.errorStack || ''"
        type="textarea"
        :rows="6"
        readonly
        placeholder="无"
      />

      <el-divider content-position="left">结果 / 统计 JSON</el-divider>
      <el-input
        :model-value="detailData?.resultJson || ''"
        type="textarea"
        :rows="6"
        readonly
        placeholder="无"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.job-run-log-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
