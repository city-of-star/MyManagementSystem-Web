<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import {
  batchDeletePost,
  createPost,
  deletePost,
  getPostPage,
  switchPostStatus,
  updatePost,
  type PostPageQuery,
  type PostVo,
} from '@/api/system/post/post.ts'
import { type PageResult } from '@/api/common/types.ts'
import { handleErrorToast } from '@/utils/http'
import { useDict } from '@/utils/base/dictUtils.ts'
import SearchForm from '@/components/layout/SearchForm.vue'
import DataTable from '@/components/layout/DataTable.vue'
import Pagination from '@/components/layout/Pagination.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import IconButton from '@/components/button/IconButton.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import DictSelect from '@/components/dict/DictSelect.vue'
import DictTag from '@/components/dict/DictTag.vue'

// 查询条件
const query = reactive<PostPageQuery>({
  pageNum: 1,
  pageSize: 10,
  postCode: '',
  postName: '',
  status: null,
})

// 字典：通用状态
const { options: statusOptions, loading: statusLoading, load: statusLoad } = useDict('common_status')

// 列表 & 分页
const loading = ref(false)
const tableData = ref<PostVo[]>([])
const total = ref(0)

// 选中行
const multipleSelection = ref<PostVo[]>([])

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新建岗位')
const editingPostId = ref<number | null>(null)

// 表单（用于新增/编辑）
const form = reactive({
  postCode: '',
  postName: '',
  sortOrder: 1,
  status: 1,
  remark: '',
})

// 初始化
onMounted(async () => {
  await statusLoad()
  fetchData()
})

// 查询按钮
const handleSearch = () => {
  query.pageNum = 1
  fetchData()
}

// 重置按钮
const handleReset = () => {
  query.pageNum = 1
  query.postCode = ''
  query.postName = ''
  query.status = null
  fetchData()
}

// 分页查询岗位列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<PostVo> = await getPostPage(query)
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
const handleSelectionChange = (rows: PostVo[]) => {
  multipleSelection.value = rows
}

// 新建按钮
const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建岗位'
  dialogVisible.value = true
}

// 编辑按钮
const handleEdit = (row: PostVo) => {
  resetForm()
  dialogTitle.value = '编辑岗位'
  editingPostId.value = row.id
  form.postCode = row.postCode
  form.postName = row.postName
  form.sortOrder = row.sortOrder ?? 1
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  dialogVisible.value = true
}

// （新建/编辑）确定按钮
const handleSubmit = async () => {
  try {
    if (!form.postCode) {
      Message.warning('请填写岗位编码')
      return
    }
    if (!form.postName) {
      Message.warning('请填写岗位名称')
      return
    }

    if (editingPostId.value) {
      await updatePost({
        id: editingPostId.value,
        postCode: form.postCode,
        postName: form.postName,
        sortOrder: form.sortOrder,
        status: form.status,
        remark: form.remark || undefined,
      })
      Message.success('更新成功')
    } else {
      await createPost({
        postCode: form.postCode,
        postName: form.postName,
        sortOrder: form.sortOrder,
        status: form.status,
        remark: form.remark || undefined,
      })
      Message.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 重置（新增/编辑）表单
const resetForm = () => {
  editingPostId.value = null
  dialogTitle.value = '新建岗位'
  form.postCode = ''
  form.postName = ''
  form.sortOrder = 1
  form.status = 1
  form.remark = ''
}

// 删除按钮
const handleDelete = async (row: PostVo) => {
  try {
    await Message.confirm(`确定要删除岗位【${row.postName || row.postCode}】吗？`)
    await deletePost(row.id)
    Message.success('删除成功')
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
    Message.info('请先选择要删除的岗位')
    return
  }
  try {
    await Message.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个岗位吗？`)
    const ids = multipleSelection.value.map((p) => p.id)
    await batchDeletePost({ postIds: ids })
    Message.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleToggleStatus = async (row: PostVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchPostStatus({ postId: row.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}
</script>

<template>
  <div class="post-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="岗位编码">
        <el-input v-model="query.postCode" placeholder="请输入岗位编码" clearable />
      </el-form-item>
      <el-form-item label="岗位名称">
        <el-input v-model="query.postName" placeholder="请输入岗位名称" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <DictSelect
          v-model.number="query.status"
          :options="statusOptions"
          :loading="statusLoading"
          placeholder="全部"
        />
      </el-form-item>
    </SearchForm>

    <!-- 操作栏 -->
    <Toolbar>
      <PrimaryButton icon="Plus" type="primary" @click="handleCreate">
        新建岗位
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
      <el-table-column prop="postCode" label="岗位编码" min-width="120" />
      <el-table-column prop="postName" label="岗位名称" min-width="140" />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="220">
        <template #default="{ row }">
          <IconButton type="primary" icon="Edit" tooltip="编辑" @click="handleEdit(row)" />
          <IconButton
            type="primary"
            :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'"
            :tooltip="row.status === 1 ? '禁用' : '启用'"
            @click="handleToggleStatus(row)"
          />
          <IconButton type="danger" icon="Delete" tooltip="删除" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </DataTable>

    <!-- 分页 -->
    <Pagination :query="query" :total="total" @change="fetchData" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="岗位编码" required>
          <el-input v-model="form.postCode" placeholder="请输入岗位编码" :disabled="!!editingPostId" />
        </el-form-item>
        <el-form-item label="岗位名称" required>
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" v-if="!editingPostId">
          <DictSelect
            v-model.number="form.status"
            :options="statusOptions"
            :loading="statusLoading"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
.post-page {
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
