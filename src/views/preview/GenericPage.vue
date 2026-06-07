<template>
  <div class="generic-page">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24"><component :is="pageIcon" /></el-icon>
          <span class="page-title">{{ pageTitle }}</span>
        </div>
      </template>
      
      <div class="page-content">
        <el-alert
          title="通用页面组件"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            这是一个自动生成的通用页面组件。如果需要自定义页面内容，请在 <code>src/views/preview/</code> 目录下创建对应名称的组件文件。
          </template>
        </el-alert>

        <div class="page-info">
          <h4>页面信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="页面标题">
              {{ pageTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="路由路径">
              <el-tag>{{ route.path }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="组件名称">
              <el-tag type="success">{{ componentName }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-if="routeParams.length > 0" class="params-section">
          <h4>路由参数配置</h4>
          <el-table :data="routeParams" border>
            <el-table-column prop="key" label="参数名" width="120" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="required" label="必填" width="80">
              <template #default="{ row }">
                <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                  {{ row.required ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="default" label="默认值" />
          </el-table>
        </div>

        <div v-if="interceptor" class="interceptor-section">
          <h4>路由拦截配置</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="拦截类型">
              <el-tag :type="interceptorTypeTag">{{ interceptor.type }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="interceptor.roles" label="允许角色">
              <el-tag
                v-for="role in interceptor.roles"
                :key="role"
                type="primary"
                style="margin-right: 8px;"
              >
                {{ role }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="interceptor.rule" label="自定义规则">
              <code>{{ interceptor.rule }}</code>
            </el-descriptions-item>
            <el-descriptions-item label="跳转路径">
              <el-tag type="warning">{{ interceptor.redirect }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="quick-actions">
          <h4>快捷操作</h4>
          <el-space>
            <el-button type="primary" @click="testNavigation">
              <el-icon><Link /></el-icon>
              测试路由跳转
            </el-button>
            <el-button @click="goBack">
              <el-icon><Back /></el-icon>
              返回配置页面
            </el-button>
          </el-space>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const componentName = computed(() => route.meta?.componentName || route.name || 'Page')
const pageTitle = computed(() => route.meta?.title || '页面')
const pageIcon = computed(() => {
  const iconName = route.meta?.icon || 'Document'
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue['Document']
})
const routeParams = computed(() => route.meta?.params || [])
const interceptor = computed(() => route.meta?.interceptor)

const interceptorTypeTag = computed(() => {
  const type = interceptor.value?.type
  switch (type) {
    case 'auth': return 'danger'
    case 'login': return 'warning'
    case 'custom': return 'info'
    default: return 'success'
  }
})

function testNavigation() {
  router.push('/preview/home')
}

function goBack() {
  router.push('/config')
}
</script>

<style scoped>
.generic-page {
  width: 100%;
}

.page-card {
  border-radius: 8px;
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

.page-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-info h4,
.params-section h4,
.interceptor-section h4,
.quick-actions h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 15px;
}

code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
}
</style>
