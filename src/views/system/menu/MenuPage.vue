<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
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

const query = reactive({
  status: null as number | null,
  visible: null as number | null,
})

// 字典：通用状态、菜单显示状态
const { options: statusOptions, load: loadStatusDict } = useDict('common_status')
const { options: visibleOptions, load: loadVisibleDict } = useDict('menu_visible')

const loading = ref(false)
const treeData = ref<PermissionTreeVo[]>([])
const expandedKeys = ref<number[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新建菜单')
const editingId = ref<number | null>(null)
const codePrefix = ref('')
const parentLabel = ref('根目录')
const typeLocked = ref(false)

const form = reactive({
  parentId: 0 as number | null,
  permissionType: 'catalog' as 'catalog' | 'menu' | 'button',
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

// 查看角色关联
const roleDialogVisible = ref(false)
const viewingPermissionId = ref<number | null>(null)
const viewingPermissionName = ref('')
const roleList = ref<RoleVo[]>([])
const roleListLoading = ref(false)

const resetForm = () => {
  editingId.value = null
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

const fetchTree = async () => {
  loading.value = true
  try {
    const resp = await getPermissionTree({
      status: query.status ?? undefined,
      visible: query.visible ?? undefined,
    })
    treeData.value = resp || []
    // 默认展开根节点
    expandedKeys.value = (treeData.value || []).map((n) => n.id).filter(Boolean) as number[]
  } catch (error) {
    handleErrorToast(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTree()
  loadStatusDict()
  loadVisibleDict()
})

const handleSearch = () => {
  fetchTree()
}

const handleReset = () => {
  query.status = null
  query.visible = null
  fetchTree()
}

const openCreateDialog = (parent: PermissionTreeVo | null, type: 'catalog' | 'menu' | 'button', title?: string) => {
  resetForm()
  form.parentId = parent?.id ?? 0
  form.permissionType = type
  typeLocked.value = true
  parentLabel.value = parent ? parent.permissionName : '根目录'
  codePrefix.value = !editingId.value && parent?.permissionCode ? `${parent.permissionCode}_` : ''
  dialogTitle.value = title || (type === 'catalog' ? '新建目录' : type === 'menu' ? '新建菜单' : '新建按钮')
  dialogVisible.value = true
}

const handleCreateRoot = () => {
  // 根只允许创建目录
  openCreateDialog(null, 'catalog', '新建根目录')
}

const handleCreateChild = (node: PermissionTreeVo, type: 'catalog' | 'menu' | 'button') => {
  // 规则：目录下只能建菜单；菜单下只能建按钮；按钮下不能再建
  if (node.permissionType === 'catalog' && type !== 'menu') return
  if (node.permissionType === 'menu' && type !== 'button') return
  if (node.permissionType === 'button') return
  const label = type === 'catalog' ? '目录' : type === 'menu' ? '菜单' : '按钮'
  openCreateDialog(node, type, `在「${node.permissionName}」下新建${label}`)
}

const handleEdit = (node: PermissionTreeVo) => {
  resetForm()
  dialogTitle.value = '编辑菜单'
  editingId.value = node.id
  form.parentId = node.parentId ?? 0
  form.permissionType = (node.permissionType as 'catalog' | 'menu' | 'button') || 'catalog'
  typeLocked.value = false
  form.permissionName = node.permissionName
  form.permissionCode = node.permissionCode
  form.path = node.path || ''
  form.component = node.component || ''
  form.icon = node.icon || ''
  form.sortOrder = node.sortOrder ?? 1
  form.visible = node.visible ?? 1
  form.status = node.status ?? 1
  form.remark = node.remark || ''
  parentLabel.value = node.parentId === 0 ? '根目录' : parentLabel.value
  codePrefix.value = '' // 编辑不强制前缀
  dialogVisible.value = true
}

const handleDelete = async (node: PermissionTreeVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除【${node.permissionName}】吗？`, '提示', {
      type: 'warning',
    })
    await deletePermission(node.id)
    ElMessage.success('删除成功')
    fetchTree()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

const handleToggleStatus = async (node: PermissionTreeVo) => {
  const targetStatus = node.status === 1 ? 0 : 1
  try {
    await switchPermissionStatus({ permissionId: node.id, status: targetStatus })
    ElMessage.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchTree()
  } catch (error) {
    handleErrorToast(error)
  }
}

const handleSubmit = async () => {
  try {
    if (!form.permissionName) {
      ElMessage.warning('请填写名称')
      return
    }
    if (!form.permissionCode) {
      ElMessage.warning('请填写编码')
      return
    }
    if (form.permissionType === 'menu') {
      if (!form.path) {
        ElMessage.warning('菜单类型必须填写路由路径')
        return
      }
      if (!form.component) {
        ElMessage.warning('菜单类型必须填写组件路径')
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
      editingId.value || !codePrefix.value ? form.permissionCode : `${codePrefix.value}${form.permissionCode}`

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

    if (editingId.value) {
      await updatePermission({ ...payload, id: editingId.value })
      ElMessage.success('更新成功')
    } else {
      await createPermission(payload)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchTree()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 查看角色关联
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

const handleRemoveRole = async (role: RoleVo) => {
  if (!viewingPermissionId.value) return
  try {
    await ElMessageBox.confirm(
      `确定要将角色【${role.roleName || role.roleCode}】与权限【${viewingPermissionName.value}】解除关联吗？`,
      '提示',
      { type: 'warning' }
    )
    await removeRoleFromPermission({
      permissionId: viewingPermissionId.value,
      roleId: role.id,
    })
    ElMessage.success('已解除关联')
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
    <h2 class="page-title">菜单管理</h2>

    <div class="search-card">
      <el-form :inline="true" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="Number(opt.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="query.visible" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="opt in visibleOptions"
              :key="opt.value"
              :label="opt.label"
              :value="Number(opt.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleCreateRoot()">新建根目录</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card class="tree-card" shadow="never">
      <el-tree
        v-loading="loading"
        :data="treeData"
        node-key="id"
        highlight-current
        :expand-on-click-node="false"
        :default-expanded-keys="expandedKeys"
        :props="{ label: 'permissionName', children: 'children' }"
        class="menu-tree"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <div class="node-main">
              <el-tag
                size="small"
                class="node-type-tag"
                :type="data.permissionType === 'catalog' ? 'warning' : data.permissionType === 'menu' ? 'success' : 'info'"
              >
                {{
                  data.permissionType === 'catalog'
                    ? '目录'
                    : data.permissionType === 'menu'
                      ? '菜单'
                      : '按钮'
                }}
              </el-tag>
              <div class="node-info">
                <span class="node-title">{{ data.permissionName }}</span>
                <span class="node-code">{{ data.permissionCode }}</span>
              </div>
            </div>
            <div class="node-meta">
              <el-tag size="small" :type="data.status === 1 ? 'success' : 'info'" class="status-tag">
                {{ data.status === 1 ? '启用' : '禁用' }}
              </el-tag>
              <el-tag size="small" :type="data.visible === 1 ? 'success' : 'info'" class="status-tag">
                {{ data.visible === 1 ? '显示' : '隐藏' }}
              </el-tag>
            </div>
            <div class="node-actions">
              <template v-if="data.permissionType === 'catalog'">
                <el-button link type="primary" size="small" @click.stop="handleCreateChild(data, 'menu')">
                  新菜单
                </el-button>
              </template>
              <template v-else-if="data.permissionType === 'menu'">
                <el-button link type="primary" size="small" @click.stop="handleCreateChild(data, 'button')">
                  新按钮
                </el-button>
              </template>
              <el-button link type="primary" size="small" @click.stop="handleEdit(data)">编辑</el-button>
              <el-button link type="info" size="small" @click.stop="handleViewRoles(data)">查看角色</el-button>
              <el-button link type="primary" size="small" @click.stop="handleToggleStatus(data)">
                {{ data.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" size="small" @click.stop="handleDelete(data)">删除</el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px" destroy-on-close>
      <el-form label-width="96px" class="dialog-form">
        <el-form-item label="类型" required>
          <template v-if="!typeLocked">
            <el-radio-group v-model="form.permissionType">
              <el-radio label="catalog">目录</el-radio>
              <el-radio label="menu">菜单</el-radio>
              <el-radio label="button">按钮</el-radio>
            </el-radio-group>
          </template>
          <template v-else>
            <el-tag size="small" :type="form.permissionType === 'catalog' ? 'warning' : form.permissionType === 'menu' ? 'success' : 'info'">
              {{ form.permissionType === 'catalog' ? '目录' : form.permissionType === 'menu' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-form-item>
        <el-form-item label="上级">
          <el-input :model-value="parentLabel" disabled />
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.permissionName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="编码" required>
          <div class="code-input">
            <el-input v-if="!editingId && codePrefix" v-model="codePrefix" disabled style="width: 160px" />
            <el-input
              v-model="form.permissionCode"
              placeholder="请输入编码"
              :disabled="!!editingId"
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
          <el-input v-model="form.icon" placeholder="例如：user" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="form.visible" style="width: 140px">
            <el-option
              v-for="opt in visibleOptions"
              :key="opt.value"
              :label="opt.label"
              :value="Number(opt.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 140px">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="Number(opt.value)"
            />
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

    <!-- 查看角色关联弹窗 -->
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
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
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

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.search-card {
  padding: 20px 24px 8px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.tree-card {
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-card :deep(.el-card__body) {
  height: 100%;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.menu-tree {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

/* 自定义滚动条样式 */
.menu-tree::-webkit-scrollbar {
  width: 8px;
}

.menu-tree::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.menu-tree::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.menu-tree::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox 滚动条样式 */
.menu-tree {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.menu-tree :deep(.el-tree-node__content) {
  height: auto;
  min-height: 48px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.menu-tree :deep(.el-tree-node__content:hover) {
  background-color: #f9fafb;
}

.menu-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
}

.node-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.node-type-tag {
  min-width: 56px;
  text-align: center;
  font-weight: 500;
  flex-shrink: 0;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.node-title {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  line-height: 1.4;
}

.node-code {
  color: #6b7280;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
}

.node-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
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

/* 响应式优化 */
@media (max-width: 1200px) {
  .tree-node {
    flex-direction: column;
    align-items: flex-start;
  }

  .node-main {
    width: 100%;
  }

  .node-meta {
    width: 100%;
    margin-top: 8px;
  }

  .node-actions {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
    opacity: 1;
    flex-wrap: wrap;
  }
}
</style>

