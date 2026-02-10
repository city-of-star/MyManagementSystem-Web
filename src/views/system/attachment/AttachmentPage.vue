<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import {
  batchDeleteAttachment,
  deleteAttachment,
  getAttachmentPage,
  switchAttachmentStatus,
  type AttachmentPageQuery,
  type AttachmentPageVo,
} from '@/api/attachment/attachment'
import type { PageResult } from '@/api/common/types'
import { handleErrorToast } from '@/utils/http'
import { useDict } from '@/utils/base/dictUtils.ts'

import SearchForm from '@/components/layout/SearchForm.vue'
import DataTable from '@/components/layout/DataTable.vue'
import Pagination from '@/components/layout/Pagination.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import IconButton from '@/components/button/IconButton.vue'
import DictSelect from '@/components/dict/DictSelect.vue'
import DictTag from '@/components/dict/DictTag.vue'
import DictText from "@/components/dict/DictText.vue";
import DateRangePicker from "@/components/datePicker/DateRangePicker.vue";

// 查询条件
const query = reactive<AttachmentPageQuery>({
  pageNum: 1,
  pageSize: 10,
  fileName: '',
  originalName: '',
  businessType: '',
  businessId: null,
  status: null,
  createTimeStart: null,
  createTimeEnd: null,
})

// 字典：附件类型（扩展名）
const {options: fileTypeOptions, loading: fileTypeLoading, load: fileTypeLoad} = useDict('attachment_file_type')
// 字典：附件业务类型
const {options: businessTypeOptions, loading: businessTypeLoading, load: businessTypeLoad} = useDict('attachment_business_type')
// 字典：通用状态
const {options: statusOptions, loading: statusLoading, load: statusLoad,} = useDict('common_status')

// 列表 & 分页
const loading = ref(true)
const tableData = ref<AttachmentPageVo[]>([])
const total = ref(0)

// 选中行
const multipleSelection = ref<AttachmentPageVo[]>([])

// 初始化
onMounted(async () => {
  await Promise.all([
    fileTypeLoad(),
    businessTypeLoad(),
    statusLoad(),
  ])
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
  query.fileName = ''
  query.originalName = ''
  query.fileType = ''
  query.businessType = ''
  query.businessId = null
  query.status = null
  query.createTimeStart = null
  query.createTimeEnd = null
  fetchData()
}

// 分页查询附件列表
const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<AttachmentPageVo> = await getAttachmentPage(query)
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
const handleSelectionChange = (rows: AttachmentPageVo[]) => {
  multipleSelection.value = rows
}

// 删除
const handleDelete = async (row: AttachmentPageVo) => {
  try {
    await Message.confirm(`确定要删除附件【${row.originalName || row.fileName}】吗？`)
    await deleteAttachment(row.id)
    Message.success('删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    Message.info('请先选择要删除的附件')
    return
  }
  try {
    await Message.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个附件吗？`)
    const ids = multipleSelection.value.map((item) => item.id)
    await batchDeleteAttachment({ ids })
    Message.success('批量删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用/禁用
const handleToggleStatus = async (row: AttachmentPageVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchAttachmentStatus({ id: row.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    await fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 预览（直接打开 fileUrl）
const handlePreview = (row: AttachmentPageVo) => {
  if (!row.fileUrl) {
    Message.warning('文件地址不存在')
    return
  }
  window.open(row.fileUrl, '_blank')
}

// 文件大小格式化函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  if (bytes === null || bytes === undefined) return '-'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // 保留两位小数
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
  return `${size} ${sizes[i]}`
}
</script>

<template>
  <div class="attachment-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="文件名">
        <el-input v-model="query.fileName" placeholder="请输入存储文件名" clearable />
      </el-form-item>
      <el-form-item label="原始名称">
        <el-input v-model="query.originalName" placeholder="请输入原始文件名" clearable />
      </el-form-item>
      <el-form-item label="扩展名">
        <DictSelect v-model="query.fileType" :options="fileTypeOptions" :loading="fileTypeLoading" />
      </el-form-item>
      <el-form-item label="业务类型">
        <DictSelect v-model="query.businessType" :options="businessTypeOptions" :loading="businessTypeLoading" />
      </el-form-item>
      <el-form-item label="业务ID">
        <el-input v-model="query.businessId" placeholder="请输入业务ID" clearable/>
      </el-form-item>
      <el-form-item label="状态">
        <DictSelect v-model.number="query.status" :options="statusOptions" :loading="statusLoading" />
      </el-form-item>
      <el-form-item label="创建时间">
        <DateRangePicker v-model:start="query.createTimeStart" v-model:end="query.createTimeEnd" type="datetime"/>
      </el-form-item>
    </SearchForm>

    <!-- 操作栏 -->
    <Toolbar>
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
      <el-table-column type="selection" width="40" />
      <el-table-column prop="originalName" label="原始文件名" min-width="180" show-overflow-tooltip />
      <el-table-column prop="fileName" label="存储文件名" min-width="120" show-overflow-tooltip />
      <el-table-column prop="fileSize" label="大小" width="100">
        <template #default="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column prop="fileType" label="扩展名" width="80" />
      <el-table-column prop="mimeType" label="MIME类型" min-width="140" show-overflow-tooltip />
      <el-table-column label="业务类型" min-width="120">
        <template #default="{ row }">
          <DictText :options="businessTypeOptions" :value="row.businessType" />
        </template>
      </el-table-column>
      <el-table-column prop="businessId" label="业务ID" width="110" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }"/>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
      <el-table-column prop="updateTime" label="更新时间" min-width="170" />
      <el-table-column label="操作" fixed="right" width="120">
        <template #default="{ row }">
          <IconButton type="primary" icon="View" tooltip="预览" @click="handlePreview(row)"/>
          <IconButton type="primary" :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'" :tooltip="row.status === 1 ? '禁用' : '启用'" @click="handleToggleStatus(row)"/>
          <IconButton type="danger" icon="Delete" tooltip="删除" @click="handleDelete(row)"/>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 分页 -->
    <Pagination :query="query" :total="total" @change="fetchData" />
  </div>
</template>

<style scoped>
.attachment-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
