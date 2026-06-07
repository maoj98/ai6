<template>
  <div class="layout-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon :size="24"><FolderOpened /></el-icon>
          <span class="page-title">{{ pageTitle }}</span>
        </div>
      </template>

      <el-result
        icon="info"
        title="这是一个布局容器"
        sub-title="该菜单包含子菜单，点击左侧子菜单查看具体页面"
      >
        <template #extra>
          <el-space>
            <router-link
              v-for="child in childMenus"
              :key="child.path"
              :to="child.path"
            >
              <el-button type="primary">
                前往 {{ child.name }}
              </el-button>
            </router-link>
          </el-space>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/store/menu'

const route = useRoute()
const menuStore = useMenuStore()

const pageTitle = computed(() => route.meta?.title || '页面')

const childMenus = computed(() => {
  function findItem(items) {
    for (const item of items) {
      if (item.path === route.path) {
        return item
      }
      if (item.children && item.children.length > 0) {
        const found = findItem(item.children)
        if (found) return found
      }
    }
    return null
  }
  
  const item = findItem(menuStore.menuData)
  if (item && item.children) {
    return item.children.filter(c => !c.hidden)
  }
  return []
})
</script>

<style scoped>
.layout-page {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>
