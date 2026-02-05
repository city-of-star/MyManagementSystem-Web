<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import type { ElTree } from 'element-plus'
import {
  assignRolePermissions,
  batchDeleteRole,
  createRole,
  deleteRole,
  getRolePage,
  getRolePermissionIds,
  getRoleUsers,
  removeUserFromRole,
  type RolePageQuery,
  type RoleVo,
  switchRoleStatus,
  updateRole,
} from '@/api/system/role/role.ts'
import { type PageResult } from '@/api/common/types.ts'
import type { UserDetailVo } from '@/api/system/user/user'
import { getPermissionTree, type PermissionTreeVo } from '@/api/system/permission/permission.ts'
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
import BaseDialog from '@/components/dialog/BaseDialog.vue'

// 查询条件
const query = reactive<RolePageQuery>({
  pageNum: 1,
  pageSize: 10,
  roleCode: '',
  roleName: '',
  roleType: '',
  status: null,
})

// 字典：通用状态、角色类型
const { options: statusOptions, loading: statusLoading, load: statusLoad } = useDict('common_status')
const { options: roleTypeOptions, loading: roleTypeLoading, load: roleTypeLoad } = useDict('role_type')

// 列表 & 分页
const loading = ref(false)
const tableData = ref<RoleVo[]>([])
const total = ref(0)

// 选中行
const multipleSelection = ref<RoleVo[]>([])

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新建角色')
const editingRoleId = ref<number | null>(null)

// 分配权限相关
const permissionDialogVisible = ref(false)
const assigningRoleId = ref<number | null>(null)
const assigningRoleName = ref('')
const permissionTree = ref<PermissionTreeVo[]>([])
const permissionTreeLoading = ref(false)
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()

// 查看用户相关
const userDialogVisible = ref(false)
const viewingRoleId = ref<number | null>(null)
const viewingRoleName = ref('')
const userList = ref<UserDetailVo[]>([])
const userListLoading = ref(false)

// 表单（用于新增/编辑）
const form = reactive({
  roleCode: '',
  roleName: '',
  roleType: 'custom',
  sortOrder: 1,
  status: 1,
  remark: '',
})

// 初始化
onMounted(async () => {
  await Promise.all([
    statusLoad(),
    roleTypeLoad(),
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
  query.roleCode = ''
  query.roleName = ''
  query.roleType = ''
  query.status = null
  fetchData()
}

// 分页查询角色列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const resp: PageResult<RoleVo> = await getRolePage(query)
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
const handleSelectionChange = (rows: RoleVo[]) => {
  multipleSelection.value = rows
}

// 新建按钮
const handleCreate = () => {
  resetForm()
  dialogTitle.value = '新建角色'
  dialogVisible.value = true
}

// 编辑按钮
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

// （新建/编辑）确定按钮
const handleSubmit = async () => {
  try {
    if (!form.roleCode) {
      Message.warning('请填写角色编码')
      return
    }
    if (!form.roleName) {
      Message.warning('请填写角色名称')
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
      Message.success('更新成功')
    } else {
      await createRole({
        roleCode: form.roleCode,
        roleName: form.roleName,
        roleType: form.roleType,
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
  editingRoleId.value = null
  dialogTitle.value = '新建角色'
  form.roleCode = ''
  form.roleName = ''
  form.roleType = 'custom'
  form.sortOrder = 1
  form.status = 1
  form.remark = ''
}

// 删除按钮
const handleDelete = async (row: RoleVo) => {
  try {
    await Message.confirm(`确定要删除角色【${row.roleName || row.roleCode}】吗？`)
    await deleteRole(row.id)
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
    Message.info('请先选择要删除的角色')
    return
  }
  try {
    await Message.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个角色吗？`)
    const ids = multipleSelection.value.map((r) => r.id)
    await batchDeleteRole({ roleIds: ids })
    Message.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleToggleStatus = async (row: RoleVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchRoleStatus({ roleId: row.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchData()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 分配权限按钮（加载数据并打开弹窗）
const handleAssignPermissions = async (row: RoleVo) => {
  assigningRoleId.value = row.id
  assigningRoleName.value = row.roleName
  permissionDialogVisible.value = true
  await loadPermissionTree(row.id)
}

// 获取权限树（加载权限树并设置选中状态）
const loadPermissionTree = async (roleId: number) => {
  permissionTreeLoading.value = true
  try {
    // 并行加载权限树和角色已分配的权限ID列表
    const [treeData, permissionIds] = await Promise.all([
      getPermissionTree(), // 不传参数，返回所有的权限
      getRolePermissionIds(roleId),
    ])

    permissionTree.value = treeData

    // 等待 DOM 更新后，根据权限ID列表设置树组件的选中状态
    await nextTick()
    if (permissionTreeRef.value) {
      // 先清空所有选中状态，避免残留
      permissionTreeRef.value.setCheckedKeys([])
      await nextTick()

      // 将权限ID列表转换为 Set，便于快速查找
      const permissionIdSet = new Set(permissionIds)

      // 只收集叶子节点（没有子节点的节点）中在权限ID列表中的权限ID
      // Tree 组件会自动处理父子关联，父节点会自动变成半选中状态
      const checkedIds: number[] = []
      const collectLeafCheckedIds = (nodes: PermissionTreeVo[]) => {
        nodes.forEach(node => {
          if (!node.children || node.children.length === 0) {
            // 叶子节点：如果在权限ID列表中，则加入
            if (permissionIdSet.has(node.id)) {
              checkedIds.push(node.id)
            }
          } else {
            // 非叶子节点：继续递归处理子节点
            collectLeafCheckedIds(node.children)
          }
        })
      }
      collectLeafCheckedIds(permissionTree.value)

      // 设置选中状态（只设置叶子节点，父节点会自动变成半选中状态）
      permissionTreeRef.value.setCheckedKeys(checkedIds)
    }
  } catch (error) {
    handleErrorToast(error)
  } finally {
    permissionTreeLoading.value = false
  }
}

// 分配权限确定按钮（给角色分配权限）
const handleSubmitPermissions = async () => {
  if (!assigningRoleId.value) return

  // 获取所有选中的节点（包括完全选中和半选中的）
  const checkedKeys = permissionTreeRef.value?.getCheckedKeys() as number[] || []
  const halfCheckedKeys = permissionTreeRef.value?.getHalfCheckedKeys() as number[] || []

  // 合并完全选中和半选中的节点，传给后端
  const allPermissionIds = [...new Set([...checkedKeys, ...halfCheckedKeys])]

  if (allPermissionIds.length === 0) {
    Message.warning('请至少选择一个权限')
    return
  }

  try {
    await assignRolePermissions({
      roleId: assigningRoleId.value,
      permissionIds: allPermissionIds,
    })
    Message.success('分配权限成功')
    permissionDialogVisible.value = false
  } catch (error) {
    handleErrorToast(error)
  }
}

// 查看用户按钮（加载数据并打开弹窗）
const handleViewUsers = async (row: RoleVo) => {
  viewingRoleId.value = row.id
  viewingRoleName.value = row.roleName
  userDialogVisible.value = true
  await loadRoleUsers(row.id)
}

// 获取指定角色拥有的用户列表
const loadRoleUsers = async (roleId: number) => {
  userListLoading.value = true
  try {
    userList.value = await getRoleUsers(roleId)
  } catch (error) {
    handleErrorToast(error)
  } finally {
    userListLoading.value = false
  }
}

// 移除用户按钮
const handleRemoveUser = async (user: UserDetailVo) => {
  if (!viewingRoleId.value) return
  try {
    await Message.confirm(
      `确定要从角色【${viewingRoleName.value}】中移除用户【${user.username || user.realName || user.nickname}】吗？`
    )
    await removeUserFromRole({
      roleId: viewingRoleId.value,
      userId: user.id,
    })
    Message.success('移除成功')
    await loadRoleUsers(viewingRoleId.value)
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}
</script>

<template>
  <div class="role-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="角色编码">
        <el-input v-model="query.roleCode" placeholder="请输入角色编码" clearable />
      </el-form-item>
      <el-form-item label="角色名称">
        <el-input v-model="query.roleName" placeholder="请输入角色名称" clearable />
      </el-form-item>
      <el-form-item label="角色类型">
        <DictSelect
          v-model="query.roleType"
          :options="roleTypeOptions"
          :loading="roleTypeLoading"
          placeholder="全部"
        />
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
        新建角色
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
      <el-table-column prop="roleCode" label="角色编码" min-width="120" />
      <el-table-column prop="roleName" label="角色名称" min-width="140" />
      <el-table-column prop="roleType" label="角色类型" min-width="110">
        <template #default="{ row }">
          <DictText :options="roleTypeOptions" :value="row.roleType" />
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <IconButton type="primary" icon="Edit" tooltip="编辑" @click="handleEdit(row)" />
          <IconButton type="success" icon="Key" tooltip="分配权限" @click="handleAssignPermissions(row)" />
          <IconButton type="info" icon="User" tooltip="查看用户" @click="handleViewUsers(row)" />
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
    <BaseDialog v-model="dialogVisible" :title="dialogTitle" width="520px" @confirm="handleSubmit">
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="角色编码" required>
          <el-input v-model="form.roleCode" placeholder="请输入角色编码" :disabled="!!editingRoleId"/>
        </el-form-item>
        <el-form-item label="角色名称" required>
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色类型">
          <DictSelect
            v-model="form.roleType"
            :options="roleTypeOptions"
            :loading="roleTypeLoading"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" v-if="!editingRoleId">
          <DictSelect
            v-model.number="form.status"
            :options="statusOptions"
            :loading="statusLoading"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </BaseDialog>

    <!-- 分配权限弹窗 -->
    <BaseDialog
      v-model="permissionDialogVisible"
      :title="`分配权限 - ${assigningRoleName}`"
      width="600px"
      :loading="permissionTreeLoading"
      @confirm="handleSubmitPermissions"
    >
      <div style="min-height: 300px">
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          :props="{ children: 'children', label: 'permissionName' }"
          show-checkbox
          node-key="id"
          style="max-height: 400px; overflow-y: auto"
        >
          <template #default="{ data }">
            <span style="display: flex; align-items: center; gap: 8px">
              <span>{{ data.permissionName }}</span>
              <el-tag v-if="data.permissionType" size="small" type="info">
                {{ data.permissionType === 'catalog' ? '目录' : data.permissionType === 'menu' ? '菜单' : '按钮' }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>
    </BaseDialog>

    <!-- 查看用户弹窗 -->
    <BaseDialog
      v-model="userDialogVisible"
      :title="`查看用户 - ${viewingRoleName}`"
      width="1000px"
    >
      <div v-loading="userListLoading" style="min-height: 300px">
        <el-table :data="userList" border stripe v-if="userList.length > 0">
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="realName" label="真实姓名" min-width="100" />
          <el-table-column prop="nickname" label="昵称" min-width="100" />
          <el-table-column prop="email" label="邮箱" min-width="160" />
          <el-table-column prop="phone" label="手机号" min-width="120" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="100">
            <template #default="{ row }">
              <el-button type="danger" link @click="handleRemoveUser(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="该角色暂未分配用户" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </BaseDialog>
  </div>
</template>

<style scoped>
.role-page {
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

