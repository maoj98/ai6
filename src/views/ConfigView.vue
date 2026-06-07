<template>
  <div class="config-container">
    <el-container class="config-layout">
      <el-header class="config-header">
        <div class="header-left">
          <el-icon class="logo-icon"><Menu /></el-icon>
          <h1 class="title">动态路由菜单配置平台</h1>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="goToPreview">
            <el-icon><View /></el-icon>
            预览效果
          </el-button>
          <el-button @click="resetConfig">
            <el-icon><RefreshRight /></el-icon>
            重置配置
          </el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="360px" class="menu-tree-panel">
          <div class="panel-header">
            <span class="panel-title">菜单结构</span>
            <div class="panel-actions">
              <el-button type="primary" size="small" @click="addRootMenu">
                <el-icon><Plus /></el-icon>
                新增根菜单
              </el-button>
            </div>
          </div>
          <div class="tree-container">
            <MenuTree />
          </div>
          <div class="validation-status">
            <el-tag v-if="hasErrors" type="danger" effect="light">
              <el-icon><Warning /></el-icon>
              存在 {{ errorCount }} 项校验错误
            </el-tag>
            <el-tag v-else type="success" effect="light">
              <el-icon><CircleCheck /></el-icon>
              所有配置校验通过
            </el-tag>
          </div>
        </el-aside>
        <el-main class="form-panel">
          <div v-if="selectedItem" class="form-container">
            <MenuForm :item="selectedItem" />
          </div>
          <div v-else class="empty-state">
            <el-icon size="80" color="#dcdfe6"><Menu /></el-icon>
            <p class="empty-text">请选择左侧菜单进行配置</p>
            <p class="empty-hint">支持拖拽排序、层级嵌套、实时校验</p>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useMenuStore } from '@/store/menu'
import MenuTree from '@/components/MenuTree.vue'
import MenuForm from '@/components/MenuForm.vue'

const router = useRouter()
const menuStore = useMenuStore()

const selectedItem = computed(() => {
  if (menuStore.selectedId) {
    return menuStore.findMenuItem(menuStore.selectedId)
  }
  return null
})

const hasErrors = computed(() => Object.keys(menuStore.errors).length > 0)
const errorCount = computed(() => {
  let count = 0
  Object.values(menuStore.errors).forEach(errors => {
    count += errors.length
  })
  return count
})

function addRootMenu() {
  menuStore.addMenuItem(null)
}

function resetConfig() {
  ElMessageBox.confirm(
    '确定要重置为默认配置吗？当前所有修改将丢失。',
    '重置确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    menuStore.resetToDefault()
    ElMessage.success('已重置为默认配置')
  }).catch(() => {})
}

function goToPreview() {
  if (!menuStore.validateAll()) {
    ElMessageBox.confirm(
      '当前配置存在校验错误，预览可能无法正常工作。是否继续？',
      '校验警告',
      {
        confirmButtonText: '继续预览',
        cancelButtonText: '返回修改',
        type: 'warning'
      }
    ).then(() => {
      router.push('/preview')
    }).catch(() => {})
  } else {
    router.push('/preview')
  }
}
</script>

<style scoped>
.config-container {
  width: 100%;
  height: 100%;
}

.config-layout {
  height: 100%;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  color: white;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
}

.menu-tree-panel {
  background: #fafafa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.panel-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.validation-status {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background: white;
}

.form-panel {
  background: #f5f7fa;
  padding: 0;
  overflow-y: auto;
}

.form-container {
  padding: 24px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-text {
  font-size: 16px;
  margin: 16px 0 8px;
}

.empty-hint {
  font-size: 14px;
  color: #c0c4cc;
}
</style>
