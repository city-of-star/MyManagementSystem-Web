<!--
  图标选择组件

  功能：
  - 提供统一的“选择图标”交互：按钮 + 右侧回显 + 弹窗网格
  - 通过 v-model 把选中的图标名称回传给父组件

  使用示例：
  <IconPicker v-model="form.icon" />
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { iconMap, iconOptions, type IconName } from '@/assets/icon/icons'

const props = withDefaults(
  defineProps<{
    modelValue: IconName | '' // v-model 绑定的值（当前选中的图标名；空字符串表示未选择）
    disabled?: boolean // 禁用状态（禁用时不可打开弹窗、不可清除）
    buttonText?: string // 左侧按钮文案
    dialogTitle?: string // 弹窗标题
  }>(),
  {
    disabled: false,
    buttonText: '选择图标',
    dialogTitle: '选择图标',
  },
)

// v-model：通过 update:modelValue 把选中的图标名称回传给父组件
const emit = defineEmits<{
  'update:modelValue': [value: IconName | '']
}>()

// 弹窗可见性
const dialogVisible = ref(false)
// 搜索关键字（在弹窗里过滤图标）
const keyword = ref('')

// 回显：根据当前选中的图标名拿到对应的图标组件
const selectedIconComponent = computed(() => {
  if (!props.modelValue) return null
  return iconMap[props.modelValue] || null
})

// 弹窗列表：根据关键字过滤 iconOptions（不区分大小写）
const filteredOptions = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return iconOptions
  return iconOptions.filter((opt) => opt.label.toLowerCase().includes(kw))
})

/**
 * 打开弹窗：
 * - disabled 时不响应
 * - 每次打开清空搜索关键字，避免上次搜索残留
 */
const openDialog = () => {
  if (props.disabled) return
  keyword.value = ''
  dialogVisible.value = true
}

// 选择图标：更新 v-model 并关闭弹窗
const handleSelect = (icon: IconName) => {
  emit('update:modelValue', icon)
  dialogVisible.value = false
}

// 清除选择：把 v-model 置空（'' 表示未选择）
const handleClear = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="icon-picker">
    <el-button :disabled="props.disabled" type="primary" link @click="openDialog">
      {{ props.buttonText }}
    </el-button>

    <!-- 回显区域：展示当前选中的图标 + 图标名 + 清除按钮 -->
    <div v-if="selectedIconComponent" class="icon-preview">
      <component :is="selectedIconComponent" class="icon-preview__icon" />
      <span class="icon-preview__name">{{ props.modelValue }}</span>
      <el-button link type="danger" size="small" :disabled="props.disabled" @click="handleClear">清除</el-button>
    </div>
    <!-- 未选择时显示占位文案 -->
    <span v-else class="icon-preview__placeholder">未选择</span>

    <!-- 弹窗：包含搜索框 + 图标网格 -->
    <el-dialog v-model="dialogVisible" :title="props.dialogTitle" width="720px" destroy-on-close>
      <el-input v-model="keyword" placeholder="搜索图标（例如：User / Edit）" clearable />

      <div class="icon-grid">
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          class="icon-grid__item"
          :class="{ active: props.modelValue === opt.value }"
          @click="handleSelect(opt.value)"
        >
          <component :is="opt.component" class="icon-grid__icon" />
          <span class="icon-grid__label">{{ opt.label }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.icon-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
  flex-wrap: wrap;
}

.icon-preview {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.icon-preview__icon {
  width: 20px;
  height: 20px;
}

.icon-preview__name {
  font-size: 13px;
  color: #374151;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.icon-preview__placeholder {
  font-size: 13px;
  color: #9ca3af;
}

.icon-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-height: 520px;
  overflow: auto;
  padding-right: 4px;
}

.icon-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fff;
}

.icon-grid__item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.12);
}

.icon-grid__item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.icon-grid__icon {
  width: 22px;
  height: 22px;
}

.icon-grid__label {
  font-size: 12px;
  color: #374151;
  word-break: break-all;
  text-align: center;
}
</style>

