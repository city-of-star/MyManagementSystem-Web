<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getPermissionPage,
  type PageResult,
  type PermissionVo,
  type PermissionPageQuery,
  createPermission,
  updatePermission,
  deletePermission,
  batchDeletePermission,
  switchPermissionStatus,
} from '@/api/permission/permission'
import { handleErrorToast } from '@/utils/http'

const query = reactive<PermissionPageQuery>({
  pageNum: 1,
  pageSize: 10,
  permissionType: 'menu',
  permissionName: '',
  permissionCode: '',
  status: null,
  visible: null,
})

const loading = ref(false)
const tableData = ref<PermissionVo[]>([])
const total = ref(0)
const multipleSelection = ref<PermissionVo[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新建菜单')
const editingId = ref<number | null>(null)

const form = reactive({
  permissionType: 'menu',
  permissionName: '',
  permissionCode: '',
  path: '',
  component: '',
  icon: '',
  sortOrder: 1,
  visible: 1,
  status: 1,
  remark: '',
})

const resetForm = () => {
  editingId.value = null
  dialogTitle.value = '新建菜单'
  form.permissionType = 'menu'
  form.permissionName = ''
  form.permissionCode = ''
  form.path = ''
  form.component = ''
  form.icon = ''
  form.sortOrder = 1
  form.visible = 1
  form.status = 1
  form.remark = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<PermissionVo> = await getPermissionPage(query)
    tableData.value = resp.records
    total.value = resp.total
    query.pageNum = resp.current
    query.pageSize = resp.size
  } catch (error) {
    handleErrorToast(error, '加载菜单列表失败')
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
  query.permissionName = ''
  query.permissionCode = ''
  query.status = null
  query.visible = null
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

const handleSelectionChange = (rows: PermissionVo[]) => {
  multipleSelection.value = rows
}

const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建菜单'
  dialogVisible.value = true
}

const handleEdit = (row: PermissionVo) => {
  resetForm()
  dialogTitle.value = '编辑菜单'
  editingId.value = row.id
  form.permissionType = row.permissionType || 'menu'
  form.permissionName = row.permissionName
  form.permissionCode = row.permissionCode
  form.path = row.path || ''
  form.component = row.component || ''
  form.icon = row.icon || ''
  form.sortOrder = row.sortOrder ?? 1
  form.visible = row.visible ?? 1
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const handleDelete = async (row: PermissionVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除菜单【${row.permissionName}】吗？`, '提示', {
      type: 'warning',
    })
    await deletePermission(row.id)
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
    ElMessage.info('请先选择要删除的菜单')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个菜单吗？`, '提示', {
      type: 'warning',
    })
    const ids = multipleSelection.value.map((m) => m.id)
    await batchDeletePermission({ permissionIds: ids })
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error, '批量删除失败')
    }
  }
}

const handleToggleStatus = async (row: PermissionVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchPermissionStatus({ permissionId: row.id, status: targetStatus })
    ElMessage.success(targetStatus === 1 ? '已启用菜单' : '已禁用菜单')
    fetchData()
  } catch (error) {
    handleErrorToast(error, '切换菜单状态失败')
  }
}

const handleSubmit = async () => {
  try {
    if (!form.permissionName) {
      ElMessage.warning('请填写菜单名称')
      return
    }
    if (!form.permissionCode) {
      ElMessage.warning('请填写菜单编码')
      return
    }

    if (editingId.value) {
      await updatePermission({
        id: editingId.value,
        permissionType: form.permissionType,
        permissionName: form.permissionName,
        permissionCode: form.permissionCode,
        path: form.path || undefined,
        component: form.component || undefined,
        icon: form.icon || undefined,
        sortOrder: form.sortOrder,
        visible: form.visible,
        status: form.status,
        remark: form.remark || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await createPermission({
        permissionType: form.permissionType,
        permissionName: form.permissionName,
        permissionCode: form.permissionCode,
        path: form.path || undefined,
        component: form.component || undefined,
        icon: form.icon || undefined,
        sortOrder: form.sortOrder,
        visible: form.visible,
        status: form.status,
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
  <div class="menu-page">
    <h2 class="page-title">菜单管理</h2>

    <div class="search-card">
      <el-form :inline="true" label-width="80px">
        <el-form-item label="菜单名称">
          <el-input v-model="query.permissionName" placeholder="菜单名称" clearable />
        </el-form-item>
        <el-form-item label="菜单编码">
          <el-input v-model="query.permissionCode" placeholder="菜单编码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="query.visible" placeholder="全部" clearable style="width: 120px">
            <el-option label="显示" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">新建菜单</el-button>
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
      <el-table-column prop="permissionName" label="菜单名称" min-width="140" />
      <el-table-column prop="permissionCode" label="菜单编码" min-width="160" />
      <el-table-column prop="path" label="路由路径" min-width="160" />
      <el-table-column prop="component" label="组件路径" min-width="160" />
      <el-table-column prop="icon" label="图标" min-width="100" />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="显示" width="90">
        <template #default="{ row }">
          <el-tag :type="row.visible === 1 ? 'success' : 'info'">
            {{ row.visible === 1 ? '显示' : '隐藏' }}
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
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="菜单名称" required>
          <el-input v-model="form.permissionName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单编码" required>
          <el-input v-model="form.permissionCode" placeholder="请输入菜单编码" />
        </el-form-item>
        <el-form-item label="路由路径">
          <el-input v-model="form.path" placeholder="例如：/system/userPage" />
        </el-form-item>
        <el-form-item label="组件路径">
          <el-input v-model="form.component" placeholder="例如：system/user/UserPage" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="例如：user" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="form.visible" style="width: 140px">
            <el-option label="显示" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
.menu-page {
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

