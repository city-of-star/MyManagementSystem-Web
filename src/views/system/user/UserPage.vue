<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import {
  assignUserRoles,
  batchDeleteUser,
  createUser,
  deleteUser,
  getUserDeptIds,
  getUserPage,
  getUserPostIds,
  getUserRoleIds,
  lockOrUnlockUser,
  resetUserPassword,
  switchUserStatus,
  updateUser,
  type UserPageQuery,
  type UserVo,
} from '@/api/system/user/user.ts'
import { type PageResult } from '@/api/common/types.ts'
import { getRolePage, type RoleVo } from '@/api/system/role/role.ts'
import { getDeptTree, type DeptVo } from '@/api/system/dept/dept.ts'
import { getPostPage, type PostVo } from '@/api/system/post/post.ts'
import { handleErrorToast } from '@/utils/http'
import { useDict } from '@/utils/base/dictUtils.ts'
import SearchForm from '@/components/layout/SearchForm.vue'
import DataTable from '@/components/layout/DataTable.vue'
import Pagination from '@/components/layout/Pagination.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import IconButton from '@/components/button/IconButton.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import DictSelect from '@/components/dict/DictSelect.vue'
import DictText from '@/components/dict/DictText.vue'
import DictTag from '@/components/dict/DictTag.vue'
import DateRangePicker from '@/components/datePicker/DateRangePicker.vue'

// 查询条件
const query = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  nickname: '',
  realName: '',
  email: '',
  phone: '',
  status: null,
  locked: null,
  gender: null,
  createTimeStart: null,
  createTimeEnd: null,
  lastLoginTimeStart: null,
  lastLoginTimeEnd: null,
  deptId: null,
  postId: null,
})

// 字典：性别
const { options: userGenderOptions, loading: userGenderLoading, load: userGenderLoad } = useDict('user_gender')
// 字典：通用状态
const { options: statusOptions, loading: statusLoading, load: statusLoad } = useDict('common_status')
// 字典：锁定状态
const { options: userLockStatusOptions, loading: userLockStatusLoading, load: userLockStatusLoad } = useDict('user_lock_status')

// 部门 / 岗位选项
const deptTree = ref<DeptVo[]>([])
const deptLoading = ref(false)
const postOptions = ref<PostVo[]>([])
const postLoading = ref(false)

const deptTreeProps = {
  label: 'deptName',
  value: 'id',
  children: 'children',
}

type FlatDept = { id: number; deptName: string }
const deptFlat = computed<FlatDept[]>(() => {
  const res: FlatDept[] = []
  const walk = (nodes?: DeptVo[]) => {
    if (!nodes?.length) return
    for (const n of nodes) {
      res.push({ id: n.id, deptName: n.deptName })
      walk(n.children)
    }
  }
  walk(deptTree.value)
  return res
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

// 分配角色相关
const roleDialogVisible = ref(false)
const assigningUserId = ref<number | null>(null)
const assigningUserName = ref('')
const allRoles = ref<RoleVo[]>([])
const checkedRoleIds = ref<number[]>([])
const roleLoading = ref(false)

// 表单（用于新增/编辑）
const form = reactive({
  username: '',
  password: '',
  nickname: '',
  realName: '',
  gender: null as number | null,
  email: '',
  phone: '',
  status: 1,
  // 部门：多选 + 主部门
  deptIds: [] as number[],
  primaryDeptId: null as number | null,
  // 岗位：多选 + 主岗位
  postIds: [] as number[],
  primaryPostId: null as number | null,
  remark: '',
})

// deptIds / primaryDeptId 关联约束
watch(
  () => [...form.deptIds],
  (ids) => {
    if (!ids.length) {
      form.primaryDeptId = null
      return
    }
    if (!form.primaryDeptId || !ids.includes(form.primaryDeptId)) {
      form.primaryDeptId = ids[0]
    }
  },
)

// postIds / primaryPostId 关联约束
watch(
  () => [...form.postIds],
  (ids) => {
    if (!ids.length) {
      form.primaryPostId = null
      return
    }
    if (!form.primaryPostId || !ids.includes(form.primaryPostId)) {
      form.primaryPostId = ids[0]
    }
  },
)

// 初始化
onMounted(async () => {
  // 并行加载所有字典 & 部门/岗位
  await Promise.all([
    userGenderLoad(),
    statusLoad(),
    userLockStatusLoad(),
    loadDeptTree(),
    loadPosts(),
  ])
  // 加载列表数据
  fetchData()
})

// 加载部门树（仅启用）
const loadDeptTree = async () => {
  deptLoading.value = true
  try {
    const resp = await getDeptTree({ status: 1 })
    deptTree.value = resp || []
  } catch (error) {
    handleErrorToast(error)
  } finally {
    deptLoading.value = false
  }
}

// 加载岗位列表（仅启用）
const loadPosts = async () => {
  postLoading.value = true
  try {
    const resp: PageResult<PostVo> = await getPostPage({
      pageNum: 1,
      pageSize: 1000,
      status: 1,
    })
    postOptions.value = resp.records || []
  } catch (error) {
    handleErrorToast(error)
  } finally {
    postLoading.value = false
  }
}

// 查询按钮
const handleSearch = () => {
  query.pageNum = 1
  fetchData()
}

// 重置按钮
const handleReset = () => {
  query.pageNum = 1
  query.username = ''
  query.nickname = ''
  query.realName = ''
  query.email = ''
  query.phone = ''
  query.status = null
  query.locked = null
  query.gender = null
  query.createTimeStart = null
  query.createTimeEnd = null
  query.lastLoginTimeStart = null
  query.lastLoginTimeEnd = null
  query.deptId = null
  query.postId = null
  fetchData()
}

// 分页查询用户列表数据
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

// 选中行变化
const handleSelectionChange = (rows: UserVo[]) => {
  multipleSelection.value = rows
}

// 新建按钮
const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建用户'
  dialogVisible.value = true
}

// 编辑按钮
const handleEdit = async (row: UserVo) => {
  resetForm()
  dialogTitle.value = '编辑用户'
  editingUserId.value = row.id
  form.username = row.username
  form.nickname = row.nickname || ''
  form.realName = row.realName || ''
  form.gender = row.gender ?? null
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  // 回显部门/岗位列表（从后端接口拉取）
  try {
    const [deptIds, postIds] = await Promise.all([
      getUserDeptIds(row.id),
      getUserPostIds(row.id),
    ])
    form.deptIds = deptIds || []
    form.postIds = postIds || []
    // 主部门/主岗位：优先用 VO 回填，否则用第一个选中项兜底（watch 也会兜底）
    form.primaryDeptId = (row as any).primaryDeptId ?? form.deptIds[0] ?? null
    form.primaryPostId = (row as any).primaryPostId ?? form.postIds[0] ?? null
  } catch (error) {
    handleErrorToast(error)
  }
  dialogVisible.value = true
}

// （新建/编辑）确定按钮
const handleSubmit = async () => {
  try {
    if (!form.username) {
      Message.warning('请填写用户名')
      return
    }

    if (!editingUserId.value && !form.password) {
      Message.warning('请填写密码')
      return
    }

    const deptIds = form.deptIds.length ? form.deptIds : undefined
    const postIds = form.postIds.length ? form.postIds : undefined

    const primaryDeptId =
      deptIds && deptIds.length
        ? (form.primaryDeptId && deptIds.includes(form.primaryDeptId) ? form.primaryDeptId : deptIds[0])
        : undefined
    const primaryPostId =
      postIds && postIds.length
        ? (form.primaryPostId && postIds.includes(form.primaryPostId) ? form.primaryPostId : postIds[0])
        : undefined

    if (editingUserId.value) {
      await updateUser({
        id: editingUserId.value,
        username: form.username,
        nickname: form.nickname || undefined,
        realName: form.realName || undefined,
        gender: form.gender ?? undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        status: form.status,
        deptIds,
        primaryDeptId,
        postIds,
        primaryPostId,
        remark: form.remark || undefined,
      })
      Message.success('更新成功')
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        nickname: form.nickname || undefined,
        realName: form.realName || undefined,
        gender: form.gender ?? undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        status: form.status,
        deptIds,
        primaryDeptId,
        postIds,
        primaryPostId,
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
  editingUserId.value = null
  dialogTitle.value = '新建用户'
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.realName = ''
  form.gender = null
  form.email = ''
  form.phone = ''
  form.status = 1
  form.deptIds = []
  form.primaryDeptId = null
  form.postIds = []
  form.primaryPostId = null
  form.remark = ''
}

// 删除按钮
const handleDelete = async (row: UserVo) => {
  try {
    await Message.confirm(`确定要删除用户【${row.username}】吗？`)
    await deleteUser(row.id)
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
    Message.info('请先选择要删除的用户')
    return
  }
  try {
    await Message.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个用户吗？`)
    const ids = multipleSelection.value.map((u) => u.id)
    await batchDeleteUser(ids)
    Message.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleToggleStatus = async (row: UserVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchUserStatus({ userId: row.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 锁定按钮 / 解锁按钮
const handleToggleLock = async (row: UserVo) => {
  const targetLocked = row.locked === 1 ? 0 : 1
  try {
    await lockOrUnlockUser({
      userId: row.id,
      locked: targetLocked,
      lockReason: targetLocked === 1 ? '后台锁定' : undefined,
    })
    Message.success(targetLocked === 1 ? '已锁定用户' : '已解锁用户')
    fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 重置密码按钮
const handleResetPassword = async (row: UserVo) => {
  try {
    await Message.confirm(`确定要重置用户【${row.username}】的密码吗？`)
    // 简单演示：重置为固定密码；实际可弹窗输入新密码
    await resetUserPassword({ userId: row.id, newPassword: '123456' })
    Message.success('密码已重置为 123456')
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 分配角色按钮（加载数据并打开弹窗）
const handleAssignRoles = async (row: UserVo) => {
  assigningUserId.value = row.id
  assigningUserName.value = row.username
  roleDialogVisible.value = true
  await loadAllRoles()
  await loadUserRoles(row.id)
}

// 获取角色列表（所有启用的角色）
const loadAllRoles = async () => {
  roleLoading.value = true
  try {
    const resp = await getRolePage({
      pageNum: 1,
      pageSize: 1000,
      status: 1, // 只加载启用的角色
    })
    allRoles.value = resp.records
  } catch (error) {
    handleErrorToast(error)
  } finally {
    roleLoading.value = false
  }
}

// 获取指定用户拥有的角色列表
const loadUserRoles = async (userId: number) => {
  try {
    checkedRoleIds.value = await getUserRoleIds(userId)
  } catch (error) {
    handleErrorToast(error)
  }
}

// 分配角色确定按钮（给用户分配角色）
const handleSubmitRoles = async () => {
  if (!assigningUserId.value) return
  if (checkedRoleIds.value.length === 0) {
    Message.warning('请至少选择一个角色')
    return
  }
  try {
    await assignUserRoles({
      userId: assigningUserId.value,
      roleIds: checkedRoleIds.value,
    })
    Message.success('分配角色成功')
    roleDialogVisible.value = false
  } catch (error) {
    handleErrorToast(error)
  }
}
</script>

<template>
  <div class="user-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="用户名">
        <el-input v-model="query.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="query.nickname" placeholder="请输入昵称" clearable />
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input v-model="query.realName" placeholder="请输入真实姓名" clearable />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="query.email" placeholder="请输入邮箱" clearable />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="query.phone" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item label="部门">
        <el-tree-select
          v-model="query.deptId"
          :data="deptTree"
          :props="deptTreeProps"
          node-key="id"
          check-strictly
          :render-after-expand="false"
          :loading="deptLoading"
          placeholder="请选择部门"
          clearable
        />
      </el-form-item>
      <el-form-item label="岗位">
        <el-select
          v-model="query.postId"
          placeholder="请选择岗位"
          clearable
          filterable
          :loading="postLoading"
        >
          <el-option
            v-for="post in postOptions"
            :key="post.id"
            :label="`${post.postName}(${post.postCode})`"
            :value="post.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="性别">
        <DictSelect
            :options="userGenderOptions"
            :loading="userGenderLoading"
            v-model.number="query.gender"
        />
      </el-form-item>
      <el-form-item label="状态">
        <DictSelect
            :options="statusOptions"
            :loading="statusLoading"
            v-model.number="query.status"
        />
      </el-form-item>
      <el-form-item label="锁定状态">
        <DictSelect
            :options="userLockStatusOptions"
            :loading="userLockStatusLoading"
            v-model.number="query.locked"
        />
      </el-form-item>
      <el-form-item label="创建时间">
        <DateRangePicker
          v-model:start="query.createTimeStart"
          v-model:end="query.createTimeEnd"
          type="datetime"
        />
      </el-form-item>
      <el-form-item label="最后登录时间">
        <DateRangePicker
          v-model:start="query.lastLoginTimeStart"
          v-model:end="query.lastLoginTimeEnd"
          type="datetime"
        />
      </el-form-item>
    </SearchForm>

    <!-- 操作栏 -->
    <Toolbar>
      <PrimaryButton icon="Plus" type="primary" @click="handleCreate">
        新建用户
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
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="realName" label="真实姓名" min-width="120" />
      <el-table-column prop="gender" label="性别" width="90">
        <template #default="{ row }">
          <DictText :options="userGenderOptions" :value="row.gender" />
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }"/>
        </template>
      </el-table-column>
      <el-table-column label="锁定" width="100">
        <template #default="{ row }">
          <DictTag :options="userLockStatusOptions" :value="row.locked" :type-map="{ '1': 'danger', '0': 'success' }"/>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录时间" min-width="170" />
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="130">
        <template #default="{ row }">
          <IconButton type="primary" icon="Edit" tooltip="编辑" @click="handleEdit(row)"/>
          <IconButton type="success" icon="User" tooltip="分配角色" @click="handleAssignRoles(row)"/>
          <IconButton type="primary" :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'" :tooltip="row.status === 1 ? '禁用' : '启用'" @click="handleToggleStatus(row)"/>
          <IconButton type="primary" :icon="row.locked === 1 ? 'Unlock' : 'Lock'" :tooltip="row.locked === 1 ? '解锁' : '锁定'" @click="handleToggleLock(row)"/>
          <IconButton type="primary" icon="Key" tooltip="重置密码" @click="handleResetPassword(row)"/>
          <IconButton type="danger" icon="Delete" tooltip="删除" @click="handleDelete(row)"/>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 分页 -->
    <Pagination :query="query" :total="total" @change="fetchData" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!editingUserId"/>
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
        <el-form-item label="所属部门">
          <el-tree-select
            v-model="form.deptIds"
            :data="deptTree"
            :props="deptTreeProps"
            node-key="id"
            multiple
            check-strictly
            :render-after-expand="false"
            :loading="deptLoading"
            placeholder="请选择所属部门（可多选）"
            clearable
          />
        </el-form-item>
        <el-form-item label="主部门">
          <el-select
            v-model="form.primaryDeptId"
            placeholder="请选择主部门"
            clearable
            :disabled="!form.deptIds.length"
          >
            <el-option
              v-for="dept in deptFlat.filter((d) => form.deptIds.includes(d.id))"
              :key="dept.id"
              :label="dept.deptName"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属岗位">
          <el-select
            v-model="form.postIds"
            multiple
            placeholder="请选择所属岗位（可多选）"
            clearable
            filterable
            :loading="postLoading"
          >
            <el-option
              v-for="post in postOptions"
              :key="post.id"
              :label="`${post.postName}(${post.postCode})`"
              :value="post.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主岗位">
          <el-select
            v-model="form.primaryPostId"
            placeholder="请选择主岗位"
            clearable
            :disabled="!form.postIds.length"
          >
            <el-option
              v-for="post in postOptions.filter((p) => form.postIds.includes(p.id))"
              :key="post.id"
              :label="`${post.postName}(${post.postCode})`"
              :value="post.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <DictSelect
              :options="userGenderOptions"
              :loading="userGenderLoading"
              v-model.number="form.gender"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" v-if="!editingUserId">
          <DictSelect
            :options="statusOptions"
            :loading="statusLoading"
            v-model.number="form.status"
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

    <!-- 分配角色弹窗 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="`分配角色 - ${assigningUserName}`"
      width="500px"
      destroy-on-close
    >
      <div v-loading="roleLoading" style="min-height: 300px">
        <el-checkbox-group v-model="checkedRoleIds" style="display: flex; flex-direction: column; gap: 12px">
          <el-checkbox
            v-for="role in allRoles"
            :key="role.id"
            :label="role.id"
            style="height: 32px; display: flex; align-items: center"
          >
            <span style="display: flex; align-items: center; gap: 8px">
              <span>{{ role.roleName }}</span>
              <el-tag v-if="role.roleType" size="small" type="info">
                {{ role.roleType === 'system' ? '系统角色' : '自定义角色' }}
              </el-tag>
            </span>
          </el-checkbox>
        </el-checkbox-group>
        <div v-if="allRoles.length === 0 && !roleLoading" style="text-align: center; color: #999; padding: 40px 0">
          暂无可用角色
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmitRoles">确 定</el-button>
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-form {
  padding-top: 8px;
}
</style>



