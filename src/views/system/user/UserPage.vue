<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getUserPage,
  type PageResult,
  type UserVo,
  type UserPageQuery,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUser,
  switchUserStatus,
  lockOrUnlockUser,
  resetUserPassword,
} from '@/api/system/user/user.ts'
import { handleErrorToast } from '@/utils/http'

// 查询条件
const query = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  nickname: '',
  phone: '',
  status: null,
})

// 列表 & 分页
const loading = ref(false)
const tableData = ref<UserVo[]>([])
const total = ref(0)

// 选中行
const multipleSelection = ref<UserVo[]>([])

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新建用户')
const editingUserId = ref<number | null>(null)

// 表单（用于新增/编辑）
const form = reactive({
  username: '',
  password: '',
  nickname: '',
  realName: '',
  email: '',
  phone: '',
  status: 1,
  remark: '',
})

// 重置表单
const resetForm = () => {
  editingUserId.value = null
  dialogTitle.value = '新建用户'
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.realName = ''
  form.email = ''
  form.phone = ''
  form.status = 1
  form.remark = ''
}

// 查询列表
const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<UserVo> = await getUserPage(query)
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

onMounted(() => {
  fetchData()
})

// 搜索
const handleSearch = () => {
  query.pageNum = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  query.pageNum = 1
  query.username = ''
  query.nickname = ''
  query.phone = ''
  query.status = null
  fetchData()
}

// 分页事件
const handleSizeChange = (size: number) => {
  query.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  query.pageNum = page
  fetchData()
}

// 选中行变化
const handleSelectionChange = (rows: UserVo[]) => {
  multipleSelection.value = rows
}

// 新建
const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建用户'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: UserVo) => {
  resetForm()
  dialogTitle.value = '编辑用户'
  editingUserId.value = row.id
  form.username = row.username
  form.nickname = row.nickname || ''
  form.realName = row.realName || ''
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  // 编辑时不展示密码字段，由后端保留原密码
  form.password = ''
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: UserVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户【${row.username}】吗？`, '提示', {
      type: 'warning',
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error, '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    ElMessage.info('请先选择要删除的用户')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个用户吗？`, '提示', {
      type: 'warning',
    })
    const ids = multipleSelection.value.map((u) => u.id)
    await batchDeleteUser(ids)
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error, '批量删除失败')
    }
  }
}

// 启用 / 禁用
const handleToggleStatus = async (row: UserVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchUserStatus({ userId: row.id, status: targetStatus })
    ElMessage.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchData()
  } catch (error) {
    handleErrorToast(error, '切换用户状态失败')
  }
}

// 锁定 / 解锁
const handleToggleLock = async (row: UserVo) => {
  const targetLocked = row.locked === 1 ? 0 : 1
  try {
    await lockOrUnlockUser({
      userId: row.id,
      locked: targetLocked,
      lockReason: targetLocked === 1 ? '后台锁定' : undefined,
    })
    ElMessage.success(targetLocked === 1 ? '已锁定用户' : '已解锁用户')
    fetchData()
  } catch (error) {
    handleErrorToast(error, '锁定/解锁用户失败')
  }
}

// 重置密码
const handleResetPassword = async (row: UserVo) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户【${row.username}】的密码吗？`, '提示', {
      type: 'warning',
    })
    // 简单演示：重置为固定密码；实际可弹窗输入新密码
    await resetUserPassword({ userId: row.id, newPassword: '123456' })
    ElMessage.success('密码已重置为 123456')
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error, '重置密码失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (!form.username) {
      ElMessage.warning('请填写用户名')
      return
    }

    if (!editingUserId.value && !form.password) {
      ElMessage.warning('请填写密码')
      return
    }

    if (editingUserId.value) {
      await updateUser({
        id: editingUserId.value,
        username: form.username,
        nickname: form.nickname || undefined,
        realName: form.realName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        status: form.status,
        remark: form.remark || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        nickname: form.nickname || undefined,
        realName: form.realName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        status: form.status,
        remark: form.remark || undefined,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    handleErrorToast(error, editingUserId.value ? '更新失败' : '创建失败')
  }
}
</script>

<template>
  <div class="user-page">
    <h2 class="page-title">用户管理</h2>

    <!-- 查询区域 -->
    <div class="search-card">
      <el-form :inline="true" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="用户名" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="query.nickname" placeholder="昵称" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="query.phone" placeholder="手机号" clearable />
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

    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">新建用户</el-button>
      <el-button type="danger" :disabled="!multipleSelection.length" @click="handleBatchDelete">
        批量删除
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="realName" label="真实姓名" min-width="120" />
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="锁定" width="100">
        <template #default="{ row }">
          <el-tag :type="row.locked === 1 ? 'danger' : 'success'">
            {{ row.locked === 1 ? '已锁定' : '未锁定' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录时间" min-width="170" />
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="260">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleToggleStatus(row)">
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="primary" link @click="handleToggleLock(row)">
            {{ row.locked === 1 ? '解锁' : '锁定' }}
          </el-button>
          <el-button type="primary" link @click="handleResetPassword(row)">
            重置密码
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!editingUserId" label="密码" required>
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
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
.user-page {
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

