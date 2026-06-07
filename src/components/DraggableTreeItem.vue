<template>
  <div
    class="tree-item-wrapper"
    :class="{
      'has-children': item.children && item.children.length > 0,
      'is-selected': menuStore.selectedId === item.id,
      'has-error': hasError
    }"
  >
    <div
      class="tree-item"
      :style="{ paddingLeft: level * 20 + 12 + 'px' }"
      draggable="true"
      @click="handleClick"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="item-content">
        <el-icon
          v-if="item.children && item.children.length > 0"
          class="expand-icon"
          :class="{ expanded: expanded }"
          @click.stop="toggleExpand"
        >
          <CaretRight />
        </el-icon>
        <span v-else class="expand-placeholder"></span>
        
        <el-icon class="item-icon" :class="{ hidden: item.hidden }">
          <component :is="item.icon || 'Menu'" />
        </el-icon>
        
        <span class="item-name" :class="{ 'text-hidden': item.hidden }">
          {{ item.name }}
        </span>
        
        <span v-if="item.hidden" class="hidden-badge">隐藏</span>
        
        <el-icon v-if="hasError" class="error-icon"><Warning /></el-icon>
      </div>
      
      <div class="item-actions" @click.stop>
        <el-button
          type="primary"
          size="small"
          circle
          :icon="Plus"
          @click="addChild"
          title="添加子菜单"
        />
        <el-button
          type="danger"
          size="small"
          circle
          :icon="Delete"
          @click="deleteItem"
          title="删除菜单"
        />
      </div>
    </div>
    
    <div
      v-if="item.children && item.children.length > 0 && expanded"
      class="children-container"
    >
      <DraggableTreeItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :level="level + 1"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useMenuStore } from '@/store/menu'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select'])

const menuStore = useMenuStore()
const expanded = ref(true)
const dragOverPosition = ref(null)

const hasError = computed(() => {
  return menuStore.errors[props.item.id] && menuStore.errors[props.item.id].length > 0
})

function toggleExpand() {
  expanded.value = !expanded.value
}

function handleClick() {
  emit('select', props.item.id)
}

function addChild() {
  menuStore.addMenuItem(props.item.id)
  expanded.value = true
}

function deleteItem() {
  const hasChildren = props.item.children && props.item.children.length > 0
  const message = hasChildren
    ? `确定要删除"${props.item.name}"及其所有子菜单吗？`
    : `确定要删除"${props.item.name}"吗？`
  
  ElMessageBox.confirm(message, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    menuStore.deleteMenuItem(props.item.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.item.id)
  e.target.classList.add('dragging')
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging')
  dragOverPosition.value = null
}

function handleDragOver(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const y = e.clientY - rect.top
  const height = rect.height
  
  if (y < height * 0.25) {
    dragOverPosition.value = 'before'
  } else if (y > height * 0.75) {
    dragOverPosition.value = 'after'
  } else {
    dragOverPosition.value = 'inner'
  }
  
  e.currentTarget.classList.add('drag-over', 'drag-' + dragOverPosition.value)
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over', 'drag-before', 'drag-after', 'drag-inner')
  dragOverPosition.value = null
}

function handleDrop(e) {
  e.preventDefault()
  const draggedId = e.dataTransfer.getData('text/plain')
  const targetId = props.item.id
  
  e.currentTarget.classList.remove('drag-over', 'drag-before', 'drag-after', 'drag-inner')
  
  if (draggedId === targetId) {
    return
  }
  
  if (isDescendant(draggedId, targetId)) {
    ElMessage.warning('不能将父菜单拖入其子菜单中')
    return
  }
  
  menuStore.moveMenuItem(draggedId, targetId, dragOverPosition.value)
  dragOverPosition.value = null
}

function isDescendant(parentId, childId) {
  const parent = menuStore.findMenuItem(parentId)
  if (!parent || !parent.children) return false
  
  function check(items) {
    for (const item of items) {
      if (item.id === childId) return true
      if (item.children && check(item.children)) return true
    }
    return false
  }
  
  return check(parent.children)
}
</script>

<style scoped>
.tree-item-wrapper {
  margin-bottom: 2px;
}

.tree-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
}

.tree-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.tree-item.is-selected {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

.tree-item.is-selected .item-icon,
.tree-item.is-selected .item-name {
  color: white;
}

.tree-item.is-selected .expand-icon {
  color: white;
}

.tree-item.has-error {
  border-color: #f56c6c;
}

.tree-item.dragging {
  opacity: 0.5;
}

.tree-item.drag-over {
  border-style: dashed;
}

.tree-item.drag-before::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 8px;
  right: 8px;
  height: 3px;
  background: #409eff;
  border-radius: 2px;
}

.tree-item.drag-after::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 8px;
  right: 8px;
  height: 3px;
  background: #409eff;
  border-radius: 2px;
}

.tree-item.drag-inner {
  background: #ecf5ff;
  border-color: #409eff;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.expand-icon {
  transition: transform 0.2s ease;
  color: #909399;
  font-size: 12px;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 12px;
}

.item-icon {
  font-size: 16px;
  color: #606266;
}

.item-icon.hidden {
  opacity: 0.5;
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.text-hidden {
  color: #c0c4cc;
  text-decoration: line-through;
}

.hidden-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #909399;
  color: white;
  border-radius: 10px;
}

.error-icon {
  color: #f56c6c;
}

.item-actions {
  display: none;
  gap: 4px;
}

.tree-item:hover .item-actions {
  display: flex;
}

.is-selected .item-actions .el-button {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.is-selected .item-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.children-container {
  margin-top: 2px;
}
</style>
