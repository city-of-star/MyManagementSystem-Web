<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getRolePage,
  type PageResult,
  type RoleVo,
  type RolePageQuery,
  createRole,
  updateRole,
  deleteRole,
  batchDeleteRole,
  switchRoleStatus,
} from '@/api/role/role'
import { handleErrorToast } from '@/utils/http'

const query = reactive<RolePageQuery>({
  pageNum: 1,
  pageSize: 10,
  roleCode: '',
  roleName: '',
  roleType: '',
  status: null,
})

const loading = ref(false)
const tableData = ref<RoleVo[]>([])
const total = ref(0)
const multipleSelection = ref<RoleVo[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新建角色')
const editingRoleId = ref<number | null>(null)

const form = reactive({
  roleCode: '',
  roleName: '',
  roleType: 'custom',
  sortOrder: 1,
  status: 1,
  remark: '',
})

const resetForm = () => {
  editingRoleId.value = null
  dialogTitle.value = '新建角色'
  form.roleCode = ''
  form.roleName = ''
  form.roleType = 'custom'
  form.sortOrder = 1
  form.status = 1
  form.remark = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<RoleVo> = await getRolePage(query)
    tableData.value = resp.records
    total.value = resp.total
    query.pageNum = resp.current
    query.pageSize = resp.size
  } catch (error) {
    handleErrorToast(error, '加载角色列表失败')
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
  query.roleCode = ''
  query.roleName = ''
  query.roleType = ''
  query.status = null
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

const handleSelectionChange = (rows: RoleVo[]) => {
  multipleSelection.value = rows
}

const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建角色'
  dialogVisible.value = true
}

const handleEdit = (row: RoleVo) => {
  resetForm()
  dialogTitle.value = '编辑角色'
  editingRoleId.value = row.id
  form.roleCode = row.roleCode
  form.roleName = row.roleName
  form.roleType = row.roleType || 'custom'
  form.sortOrder = row.sortOrder ?? 1
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const handleDelete = async (row: RoleVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色【${row.roleName || row.roleCode}】吗？`, '提示', {
      type: 'warning',
    })
    await deleteRole(row.id)
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
    ElMessage.info('请先选择要删除的角色')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个角色吗？`, '提示', {
      type: 'warning',
    })
    const ids = multipleSelection.value.map((r) => r.id)
    await batchDeleteRole({ roleIds: ids })
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error, '批量删除失败')
    }
  }
}

const handleToggleStatus = async (row: RoleVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchRoleStatus({ roleId: row.id, status: targetStatus })
    ElMessage.success(targetStatus === 1 ? '已启用角色' : '已禁用角色')
    fetchData()
  } catch (error) {
    handleErrorToast(error, '切换角色状态失败')
  }
}

const handleSubmit = async () => {
  try {
    if (!form.roleCode) {
      ElMessage.warning('请填写角色编码')
      return
    }
    if (!form.roleName) {
      ElMessage.warning('请填写角色名称')
      return
    }

    if (editingRoleId.value) {
      await updateRole({
        id: editingRoleId.value,
        roleCode: form.roleCode,
        roleName: form.roleName,
        roleType: form.roleType,
        sortOrder: form.sortOrder,
        status: form.status,
        remark: form.remark || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await createRole({
        roleCode: form.roleCode,
        roleName: form.roleName,
        roleType: form.roleType,
        sortOrder: form.sortOrder,
        status: form.status,
        remark: form.remark || undefined,
      })
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchData()
  } catch (error) {
    handleErrorToast(error, editingRoleId.value ? '更新失败' : '创建失败')
  }
}
</script>

<template>
  <div class="role-page">
    <h2 class="page-title">角色管理</h2>

    <div class="search-card">
      <el-form :inline="true" label-width="70px">
        <el-form-item label="角色编码">
          <el-input v-model="query.roleCode" placeholder="角色编码" clearable />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="query.roleName" placeholder="角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色类型">
          <el-select v-model="query.roleType" placeholder="全部" clearable style="width: 140px">
            <el-option label="系统角色" value="system" />
            <el-option label="自定义角色" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">新建角色</el-button>
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
      <el-table-column prop="roleCode" label="角色编码" min-width="120" />
      <el-table-column prop="roleName" label="角色名称" min-width="140" />
      <el-table-column prop="roleType" label="角色类型" min-width="110">
        <template #default="{ row }">
          {{ row.roleType === 'system' ? '系统角色' : '自定义角色' }}
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="角色编码" required>
          <el-input v-model="form.roleCode" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色名称" required>
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色类型">
          <el-select v-model="form.roleType" style="width: 160px">
            <el-option label="系统角色" value="system" />
            <el-option label="自定义角色" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" :max="9999" />
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
.role-page {
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

