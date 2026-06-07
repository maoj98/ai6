<template>
  <div class="icon-selector">
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom-start"
      trigger="click"
      :width="420"
    >
      <template #reference>
        <div class="selector-trigger">
          <el-icon class="selected-icon" v-if="modelValue">
            <component :is="modelValue" />
          </el-icon>
          <span v-else class="placeholder">选择图标</span>
          <el-icon class="arrow-down"><ArrowDown /></el-icon>
        </div>
      </template>

      <div class="icon-picker">
        <div class="picker-header">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索图标..."
            size="small"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="icon-grid">
          <div
            v-for="icon in filteredIcons"
            :key="icon"
            class="icon-item"
            :class="{ active: modelValue === icon }"
            @click="selectIcon(icon)"
            :title="icon"
          >
            <el-icon>
              <component :is="icon" />
            </el-icon>
          </div>
        </div>
        <div class="picker-footer">
          <span v-if="modelValue" class="current-icon">
            已选: <el-tag size="small">{{ modelValue }}</el-tag>
          </span>
          <el-button
            v-if="modelValue"
            size="small"
            text
            type="danger"
            @click="clearIcon"
          >
            清除选择
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const popoverVisible = ref(false)
const searchKeyword = ref('')

const iconList = computed(() => {
  return Object.keys(ElementPlusIconsVue).filter(key => {
    return typeof ElementPlusIconsVue[key] !== 'function'
  })
})

const filteredIcons = computed(() => {
  if (!searchKeyword.value) return iconList.value
  const keyword = searchKeyword.value.toLowerCase()
  return iconList.value.filter(icon => 
    icon.toLowerCase().includes(keyword)
  )
})

function selectIcon(icon) {
  emit('update:modelValue', icon)
  emit('change', icon)
  popoverVisible.value = false
}

function clearIcon() {
  emit('update:modelValue', '')
  emit('change', '')
}
</script>

<style scoped>
.icon-selector {
  display: inline-block;
}

.selector-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  min-width: 180px;
  transition: all 0.2s ease;
}

.selector-trigger:hover {
  border-color: #409eff;
}

.selected-icon {
  font-size: 18px;
  color: #606266;
}

.placeholder {
  color: #c0c4cc;
  flex: 1;
}

.arrow-down {
  font-size: 12px;
  color: #c0c4cc;
  margin-left: auto;
}

.icon-picker {
  padding: 12px;
}

.picker-header {
  margin-bottom: 12px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #606266;
}

.icon-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.icon-item.active {
  background: #409eff;
  color: white;
}

.icon-item .el-icon {
  font-size: 18px;
}

.picker-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.current-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 13px;
}
</style>
