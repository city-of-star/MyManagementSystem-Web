<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import {
  getPermissionTree,
  createPermission,
  updatePermission,
  deletePermission,
  switchPermissionStatus,
  getPermissionRoles,
  removeRoleFromPermission,
  type PermissionTreeVo,
} from '@/api/system/permission/permission.ts'
import type { RoleVo } from '@/api/system/role/role'
import { handleErrorToast } from '@/utils/http'
import { useDict } from '@/utils/base/dictUtils.ts'
import SearchForm from '@/components/layout/SearchForm.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import IconButton from '@/components/button/IconButton.vue'
import DictSelect from '@/components/dict/DictSelect.vue'
import DictTag from '@/components/dict/DictTag.vue'
import IconPicker from '@/components/icon/IconPicker.vue'
import { iconMap, type IconName } from '@/assets/icon/icons'

// 查询条件
const query = reactive({
  permissionName: '',
  permissionCode: '',
  permissionType: null as string | null,
  status: null as number | null,
  visible: null as number | null,
})

// 字典：通用状态、菜单显示状态、权限类型
const { options: statusOptions, loading: statusLoading, load: statusLoad } = useDict('common_status')
const { options: visibleOptions, loading: visibleLoading, load: visibleLoad } = useDict('menu_visible')
const { options: typeOptions, loading: typeLoading, load: typeLoad } = useDict('permission_type')

// 列表
const loading = ref(false)
const treeData = ref<PermissionTreeVo[]>([])
const defaultExpandKeys = ref<(number | string)[]>([]) // 进入页面默认展开的一级目录

// 表格样式（与DataTable保持一致）
const headerCellStyle = {
  backgroundColor: '#dedfe3',
  color: '#303133',
  textAlign: 'center',
}

const cellStyle = {
  textAlign: 'center',
}

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新建菜单')
const editingPermissionId = ref<number | null>(null)
const codePrefix = ref('')
const parentLabel = ref('根目录')
const typeLocked = ref(false)

// 表单（用于新增/编辑）
const form = reactive({
  parentId: 0 as number | null,
  permissionType: 'catalog' as 'catalog' | 'menu' | 'button',
  permissionName: '',
  permissionCode: '',
  path: '',
  component: '',
  icon: '' as IconName | '',
  sortOrder: 1,
  visible: 1,
  status: 1,
  remark: '',
})

// 查看角色相关
const roleDialogVisible = ref(false)
const viewingPermissionId = ref<number | null>(null)
const viewingPermissionName = ref('')
const roleList = ref<RoleVo[]>([])
const roleListLoading = ref(false)

// 初始化
onMounted(async () => {
  await Promise.all([
    statusLoad(),
    visibleLoad(),
    typeLoad(),
  ])
  fetchTree()
})

// 查询按钮
const handleSearch = () => {
  fetchTree()
}

// 重置按钮
const handleReset = () => {
  query.permissionName = ''
  query.permissionCode = ''
  query.permissionType = null
  query.status = null
  query.visible = null
  fetchTree()
}

// 获取权限树数据
const fetchTree = async () => {
  loading.value = true
  try {
    const resp = await getPermissionTree({
      permissionName: query.permissionName || undefined,
      permissionCode: query.permissionCode || undefined,
      permissionType: query.permissionType || undefined,
      status: query.status ?? undefined,
      visible: query.visible ?? undefined,
    })
    treeData.value = resp || []
    // 默认展开第一个一级目录
    const roots = (treeData.value || []).filter((item) => !item.parentId || item.parentId === 0)
    const firstRoot = roots[0]
    defaultExpandKeys.value = firstRoot ? [String(firstRoot.id)] : []
  } catch (error) {
    handleErrorToast(error)
  } finally {
    loading.value = false
  }
}

// 重置（新增/编辑）表单
const resetForm = () => {
  editingPermissionId.value = null
  dialogTitle.value = '新建菜单'
  form.parentId = 0
  form.permissionType = 'catalog'
  form.permissionName = ''
  form.permissionCode = ''
  form.path = ''
  form.component = ''
  form.icon = ''
  form.sortOrder = 1
  form.visible = 1
  form.status = 1
  form.remark = ''
  typeLocked.value = false
}

// 打开新建弹窗（新建目录、菜单、按钮）
const openCreateDialog = (parent: PermissionTreeVo | null, type: 'catalog' | 'menu' | 'button', title?: string) => {
  resetForm()
  form.parentId = parent?.id ?? 0
  form.permissionType = type
  typeLocked.value = true
  parentLabel.value = parent ? parent.permissionName : '根目录'
  codePrefix.value = !editingPermissionId.value && parent?.permissionCode ? `${parent.permissionCode}_` : ''
  dialogTitle.value = title || (type === 'catalog' ? '新建目录' : type === 'menu' ? '新建菜单' : '新建按钮')
  dialogVisible.value = true
}

// 新建根目录按钮
const handleCreateRoot = () => {
  // 根只允许创建目录
  openCreateDialog(null, 'catalog', '新建根目录')
}

// （新菜单/新按钮）按钮
const handleCreateChild = (node: PermissionTreeVo, type: 'catalog' | 'menu' | 'button') => {
  // 规则：目录下只能建菜单；菜单下只能建按钮；按钮下不能再建
  if (node.permissionType === 'catalog' && type !== 'menu') return
  if (node.permissionType === 'menu' && type !== 'button') return
  if (node.permissionType === 'button') return
  const label = type === 'catalog' ? '目录' : type === 'menu' ? '菜单' : '按钮'
  openCreateDialog(node, type, `在「${node.permissionName}」下新建${label}`)
}

// 查找父节点名称的辅助函数
const findParentName = (parentId: number | null, nodes: PermissionTreeVo[]): string => {
  if (!parentId || parentId === 0) return '根目录'
  for (const node of nodes) {
    if (node.id === parentId) return node.permissionName
    if (node.children && node.children.length > 0) {
      const found = findParentName(parentId, node.children)
      if (found !== '根目录') return found
    }
  }
  return '根目录'
}

// 编辑按钮
const handleEdit = (node: PermissionTreeVo) => {
  resetForm()
  dialogTitle.value = '编辑'
  editingPermissionId.value = node.id
  form.parentId = node.parentId ?? 0
  form.permissionType = (node.permissionType as 'catalog' | 'menu' | 'button') || 'catalog'
  typeLocked.value = true // 编辑时类型不可修改
  form.permissionName = node.permissionName
  form.permissionCode = node.permissionCode
  form.path = node.path || ''
  form.component = node.component || ''
  form.icon = (node.icon as IconName) || ''
  form.sortOrder = node.sortOrder ?? 1
  form.visible = node.visible ?? 1
  form.status = node.status ?? 1
  form.remark = node.remark || ''
  parentLabel.value = findParentName(node.parentId ?? 0, treeData.value)
  codePrefix.value = '' // 编辑不强制前缀
  dialogVisible.value = true
}

// 删除按钮
const handleDelete = async (node: PermissionTreeVo) => {
  try {
    await Message.confirm(`确定要删除【${node.permissionName}】吗？`)
    await deletePermission(node.id)
    Message.success('删除成功')
    fetchTree()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 启用按钮 / 禁用按钮
const handleToggleStatus = async (node: PermissionTreeVo) => {
  const targetStatus = node.status === 1 ? 0 : 1
  try {
    await switchPermissionStatus({ permissionId: node.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchTree()
  } catch (error) {
    handleErrorToast(error)
  }
}

// （新建/编辑）确定按钮
const handleSubmit = async () => {
  try {
    if (!form.permissionName) {
      Message.warning('请填写名称')
      return
    }
    // 新建时编码必填，编辑时编码不是必填项
    if (!editingPermissionId.value && !form.permissionCode) {
      Message.warning('请填写编码')
      return
    }
    if (form.permissionType === 'menu') {
      if (!form.path) {
        Message.warning('菜单类型必须填写路由路径')
        return
      }
      if (!form.component) {
        Message.warning('菜单类型必须填写组件路径')
        return
      }
    } else if (form.permissionType === 'catalog') {
      form.path = ''
      form.component = ''
    } else if (form.permissionType === 'button') {
      form.path = ''
      form.component = ''
    }

    const finalCode =
      editingPermissionId.value || !codePrefix.value ? form.permissionCode : `${codePrefix.value}${form.permissionCode}`

    const payload = {
      parentId: form.parentId ?? 0,
      permissionType: form.permissionType,
      permissionName: form.permissionName,
      permissionCode: finalCode,
      path: form.path || undefined,
      component: form.component || undefined,
      icon: form.icon || undefined,
      sortOrder: form.sortOrder,
      visible: form.visible,
      status: form.status,
      remark: form.remark || undefined,
    }

    if (editingPermissionId.value) {
      await updatePermission({ ...payload, id: editingPermissionId.value })
      Message.success('更新成功')
    } else {
      await createPermission(payload)
      Message.success('创建成功')
    }

    dialogVisible.value = false
    fetchTree()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 查看角色按钮（加载数据并打开弹窗）
const handleViewRoles = async (node: PermissionTreeVo) => {
  viewingPermissionId.value = node.id
  viewingPermissionName.value = node.permissionName
  roleDialogVisible.value = true
  await loadPermissionRoles(node.id)
}

const loadPermissionRoles = async (permissionId: number) => {
  roleListLoading.value = true
  try {
    roleList.value = await getPermissionRoles(permissionId)
  } catch (error) {
    handleErrorToast(error)
  } finally {
    roleListLoading.value = false
  }
}

// 解除关联按钮
const handleRemoveRole = async (role: RoleVo) => {
  if (!viewingPermissionId.value) return
  try {
    await Message.confirm(
      `确定要将角色【${role.roleName || role.roleCode}】与权限【${viewingPermissionName.value}】解除关联吗？`
    )
    await removeRoleFromPermission({
      permissionId: viewingPermissionId.value,
      roleId: role.id,
    })
    Message.success('已解除关联')
    await loadPermissionRoles(viewingPermissionId.value)
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

</script>

<template>
  <div class="menu-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="名称">
        <el-input v-model="query.permissionName" placeholder="请输入名称" clearable />
      </el-form-item>
      <el-form-item label="编码">
        <el-input v-model="query.permissionCode" placeholder="请输入编码" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <DictSelect
          v-model="query.permissionType"
          :options="typeOptions"
          :loading="typeLoading"
          placeholder="全部"
        />
      </el-form-item>
      <el-form-item label="显示状态">
        <DictSelect
          v-model.number="query.visible"
          :options="visibleOptions"
          :loading="visibleLoading"
          placeholder="全部"
        />
      </el-form-item>
      <el-form-item label="启用状态">
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
      <PrimaryButton icon="Plus" type="primary" @click="handleCreateRoot">
        新增目录
      </PrimaryButton>
    </Toolbar>

    <el-table
      v-loading="loading"
      :data="treeData"
      :header-cell-style="headerCellStyle"
      :cell-style="cellStyle"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      row-key="id"
      :expand-row-keys="defaultExpandKeys"
      border
      stripe
      :default-expand-all="false"
      class="menu-table"
    >
      <el-table-column prop="permissionName" label="名称" min-width="200" show-overflow-tooltip align="left">
        <template #default="{ row }">
          <div class="name-cell">
            <component
              v-if="row.icon && iconMap[row.icon]"
              :is="iconMap[row.icon]"
              class="name-icon"
            />
            <span class="name-text">{{ row.permissionName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="permissionCode" label="编码" min-width="180" show-overflow-tooltip align="left">
        <template #default="{ row }">
          <span class="code-text">{{ row.permissionCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="permissionType" label="类型" width="100">
        <template #default="{ row }">
          <DictTag
            :options="typeOptions"
            :value="row.permissionType"
            :type-map="{ catalog: 'warning', menu: 'success', button: 'info' }"
          />
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" min-width="180" show-overflow-tooltip align="left">
        <template #default="{ row }">
          <span>{{ row.path || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="component" label="组件路径" min-width="180" show-overflow-tooltip align="left">
        <template #default="{ row }">
          <span>{{ row.component || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column prop="visible" label="显示状态" width="100">
        <template #default="{ row }">
          <DictTag :options="visibleOptions" :value="row.visible" :type-map="{ '1': 'success', '0': 'info' }" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="启用状态" width="100">
        <template #default="{ row }">
          <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <div class="action-buttons">
            <template v-if="row.permissionType === 'catalog'">
              <IconButton
                type="primary"
                icon="Plus"
                tooltip="新增菜单"
                @click.stop="handleCreateChild(row, 'menu')"
              />
            </template>
            <template v-else-if="row.permissionType === 'menu'">
              <IconButton
                type="primary"
                icon="Plus"
                tooltip="新增按钮"
                @click.stop="handleCreateChild(row, 'button')"
              />
            </template>
            <IconButton
              type="primary"
              icon="Edit"
              tooltip="编辑"
              @click.stop="handleEdit(row)"
            />
            <IconButton
              type="info"
              icon="User"
              tooltip="查看角色"
              @click.stop="handleViewRoles(row)"
            />
            <IconButton
              type="primary"
              :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'"
              :tooltip="row.status === 1 ? '禁用' : '启用'"
              @click.stop="handleToggleStatus(row)"
            />
            <IconButton
              type="danger"
              icon="Delete"
              tooltip="删除"
              @click.stop="handleDelete(row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px" destroy-on-close>
      <el-form label-width="96px" class="dialog-form">
        <el-form-item label="类型">
          <template v-if="!typeLocked">
            <el-radio-group v-model="form.permissionType">
              <el-radio label="catalog">目录</el-radio>
              <el-radio label="menu">菜单</el-radio>
              <el-radio label="button">按钮</el-radio>
            </el-radio-group>
          </template>
          <template v-else>
            <DictTag
              :options="typeOptions"
              :value="form.permissionType"
              :type-map="{ catalog: 'warning', menu: 'success', button: 'info' }"
            />
          </template>
        </el-form-item>
        <el-form-item label="上级">
          <el-input :model-value="parentLabel" disabled />
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.permissionName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="编码" :required="!editingPermissionId">
          <div class="code-input">
            <el-input v-if="!editingPermissionId && codePrefix" v-model="codePrefix" disabled style="width: 160px" />
            <el-input
              v-model="form.permissionCode"
              placeholder="请输入编码"
              :disabled="!!editingPermissionId"
            />
          </div>
        </el-form-item>
        <el-form-item v-if="form.permissionType === 'menu'" label="路由路径" required>
          <el-input v-model="form.path" placeholder="例如：/system/userPage" />
        </el-form-item>
        <el-form-item v-if="form.permissionType === 'menu'" label="组件路径" required>
          <el-input v-model="form.component" placeholder="例如：system/user/UserPage" />
        </el-form-item>
        <el-form-item label="图标">
          <IconPicker v-model="form.icon" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="显示状态">
          <DictSelect
            v-model.number="form.visible"
            :options="visibleOptions"
            :loading="visibleLoading"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="启用状态" v-if="!editingPermissionId">
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

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看角色弹窗 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="`查看角色 - ${viewingPermissionName}`"
      width="880px"
      destroy-on-close
    >
      <div v-loading="roleListLoading" style="min-height: 260px">
        <el-table v-if="roleList.length" :data="roleList" border stripe>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="roleCode" label="角色编码" min-width="140" />
          <el-table-column prop="roleName" label="角色名称" min-width="140" />
          <el-table-column prop="roleType" label="角色类型" min-width="110">
            <template #default="{ row }">
              <span>{{ row.roleType || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="120">
            <template #default="{ row }">
              <el-button type="danger" link @click="handleRemoveRole(row)">解除关联</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无关联角色" />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">关 闭</el-button>
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
  height: 100%;
  overflow: hidden;
}

.menu-table {
  width: 100%;
  height: 100%;
}

.menu-table :deep(.el-table__row .el-table__cell:first-child .cell) {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.menu-table :deep(.el-table__expand-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
}

.name-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #409eff;
}

.name-text {
  font-weight: 500;
  color: #303133;
}

.code-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-form {
  padding-top: 12px;
}

.code-input {
  display: flex;
  gap: 8px;
  align-items: center;
}


</style>

