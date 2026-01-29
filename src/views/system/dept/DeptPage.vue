<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@/utils/base/messageUtils.ts'
import {
  createDept,
  deleteDept,
  getDeptTree,
  switchDeptStatus,
  updateDept,
  type DeptTreeQuery,
  type DeptVo,
} from '@/api/system/dept/dept.ts'
import { handleErrorToast } from '@/utils/http'
import { useDict } from '@/utils/base/dictUtils.ts'
import SearchForm from '@/components/layout/SearchForm.vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import IconButton from '@/components/button/IconButton.vue'
import PrimaryButton from '@/components/button/PrimaryButton.vue'
import DictSelect from '@/components/dict/DictSelect.vue'
import DictTag from '@/components/dict/DictTag.vue'

// 查询条件
const query = reactive<DeptTreeQuery>({
  deptCode: '',
  deptName: '',
  status: null,
})

// 字典：通用状态
const { options: statusOptions, loading: statusLoading, load: statusLoad } = useDict('common_status')

// 列表（树）
const loading = ref(false)
const treeData = ref<DeptVo[]>([])
const defaultExpandKeys = ref<(number | string)[]>([])

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
const dialogTitle = ref('新建部门')
const editingDeptId = ref<number | null>(null)

// 表单（用于新增/编辑）
const form = reactive({
  parentId: 0 as number,
  deptCode: '',
  deptName: '',
  leader: '',
  phone: '',
  email: '',
  sortOrder: 1,
  status: 1,
  remark: '',
})

// 初始化
onMounted(async () => {
  await statusLoad()
  fetchTree()
})

// 查询按钮
const handleSearch = () => {
  fetchTree()
}

// 重置按钮
const handleReset = () => {
  query.deptCode = ''
  query.deptName = ''
  query.status = null
  fetchTree()
}

// 获取部门树数据
const fetchTree = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      deptName: query.deptName || undefined,
      deptCode: query.deptCode || undefined,
      status: query.status ?? undefined,
    }
    // 移除 undefined，避免后端/网关对 "undefined" 字符串做错误处理
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k])

    const resp = await getDeptTree(params)
    treeData.value = resp || []
    // 默认展开第一个一级部门
    const roots = (treeData.value || []).filter((item) => !item.parentId || item.parentId === 0)
    const firstRoot = roots[0]
    defaultExpandKeys.value = firstRoot ? [String(firstRoot.id)] : []
  } catch (error) {
    handleErrorToast(error)
  } finally {
    loading.value = false
  }
}

// 新建按钮
const handleCreateRoot = () => {
  resetForm()
  dialogTitle.value = '新建部门'
  form.parentId = 0
  parentLabel.value = '顶级部门'
  dialogVisible.value = true
}

// 父级展示
const parentLabel = ref('顶级部门')

// 查找父节点名称的辅助函数
const findParentName = (parentId: number | null | undefined, nodes: DeptVo[]): string => {
  if (!parentId || parentId === 0) return '顶级部门'
  for (const node of nodes) {
    if (node.id === parentId) return node.deptName
    if (node.children && node.children.length > 0) {
      const found = findParentName(parentId, node.children)
      if (found !== '顶级部门') return found
    }
  }
  return '顶级部门'
}

// 新建子部门按钮
const handleCreateChild = (node: DeptVo) => {
  resetForm()
  dialogTitle.value = `在「${node.deptName}」下新建子部门`
  form.parentId = node.id
  parentLabel.value = node.deptName
  dialogVisible.value = true
}

// 编辑按钮
const handleEdit = (row: DeptVo) => {
  resetForm()
  dialogTitle.value = '编辑部门'
  editingDeptId.value = row.id
  form.parentId = row.parentId ?? 0
  parentLabel.value = findParentName(row.parentId, treeData.value)
  form.deptCode = row.deptCode
  form.deptName = row.deptName
  form.leader = row.leader || ''
  form.phone = row.phone || ''
  form.email = row.email || ''
  form.sortOrder = row.sortOrder ?? 1
  form.status = row.status ?? 1
  form.remark = row.remark || ''
  dialogVisible.value = true
}

// （新建/编辑）确定按钮
const handleSubmit = async () => {
  try {
    if (!form.deptCode) {
      Message.warning('请填写部门编码')
      return
    }
    if (!form.deptName) {
      Message.warning('请填写部门名称')
      return
    }

    if (editingDeptId.value) {
      await updateDept({
        id: editingDeptId.value,
        parentId: form.parentId ?? 0,
        deptCode: form.deptCode,
        deptName: form.deptName,
        leader: form.leader || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        sortOrder: form.sortOrder,
        status: form.status,
        remark: form.remark || undefined,
      })
      Message.success('更新成功')
    } else {
      await createDept({
        parentId: form.parentId ?? 0,
        deptCode: form.deptCode,
        deptName: form.deptName,
        leader: form.leader || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        sortOrder: form.sortOrder,
        status: form.status,
        remark: form.remark || undefined,
      })
      Message.success('创建成功')
    }
    dialogVisible.value = false
    fetchTree()
  } catch (error) {
    handleErrorToast(error)
  }
}

// 重置（新增/编辑）表单
const resetForm = () => {
  editingDeptId.value = null
  dialogTitle.value = '新建部门'
  parentLabel.value = '顶级部门'
  form.parentId = 0
  form.deptCode = ''
  form.deptName = ''
  form.leader = ''
  form.phone = ''
  form.email = ''
  form.sortOrder = 1
  form.status = 1
  form.remark = ''
}

// 删除按钮
const handleDelete = async (row: DeptVo) => {
  try {
    await Message.confirm(`确定要删除部门【${row.deptName || row.deptCode}】吗？`)
    await deleteDept(row.id)
    Message.success('删除成功')
    fetchTree()
  } catch (error) {
    if (error !== 'cancel') {
      handleErrorToast(error)
    }
  }
}

// 批量删除按钮
// 启用按钮 / 禁用按钮
const handleToggleStatus = async (row: DeptVo) => {
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await switchDeptStatus({ deptId: row.id, status: targetStatus })
    Message.success(targetStatus === 1 ? '已启用' : '已禁用')
    fetchTree()
  } catch (error) {
    handleErrorToast(error)
  }
}
</script>

<template>
  <div class="dept-page">
    <!-- 查询区域 -->
    <SearchForm @search="handleSearch" @reset="handleReset">
      <el-form-item label="部门编码">
        <el-input v-model="query.deptCode" placeholder="请输入部门编码" clearable />
      </el-form-item>
      <el-form-item label="部门名称">
        <el-input v-model="query.deptName" placeholder="请输入部门名称" clearable />
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
      <PrimaryButton icon="Plus" type="primary" @click="handleCreateRoot">
        新增部门
      </PrimaryButton>
    </Toolbar>

    <!-- 树表格 -->
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
      class="dept-table"
    >
      <el-table-column prop="deptName" label="部门名称" min-width="220" show-overflow-tooltip align="left" />
      <el-table-column prop="deptCode" label="部门编码" min-width="140" show-overflow-tooltip align="left" />
      <el-table-column prop="leader" label="负责人" min-width="120" />
      <el-table-column prop="phone" label="联系电话" min-width="130" />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <DictTag :options="statusOptions" :value="row.status" :type-map="{ '1': 'success', '0': 'info' }" />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip align="left" />
      <el-table-column label="操作" fixed="right" width="260">
        <template #default="{ row }">
          <div class="action-buttons">
            <IconButton type="primary" icon="Plus" tooltip="新增子部门" @click.stop="handleCreateChild(row)" />
            <IconButton type="primary" icon="Edit" tooltip="编辑" @click.stop="handleEdit(row)" />
            <IconButton
              type="primary"
              :icon="row.status === 1 ? 'CircleClose' : 'CircleCheck'"
              :tooltip="row.status === 1 ? '禁用' : '启用'"
              @click.stop="handleToggleStatus(row)"
            />
            <IconButton type="danger" icon="Delete" tooltip="删除" @click.stop="handleDelete(row)" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="上级部门">
          <el-input :model-value="parentLabel" disabled />
        </el-form-item>
        <el-form-item label="部门编码" required>
          <el-input v-model="form.deptCode" placeholder="请输入部门编码" :disabled="!!editingDeptId" />
        </el-form-item>
        <el-form-item label="部门名称" required>
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" v-if="!editingDeptId">
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
.dept-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.dept-table {
  width: 100%;
  height: 100%;
}

.dept-table :deep(.el-table__row .el-table__cell:first-child .cell) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
  gap: 8px;
}

.dialog-form {
  padding-top: 8px;
}
</style>
