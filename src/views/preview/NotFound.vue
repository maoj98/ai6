<template>
  <div class="not-found">
    <div class="error-container">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，您访问的页面不存在或您没有权限访问</p>
      <div class="error-info" v-if="route.meta">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="当前角色">
            <el-tag type="warning">{{ currentRole }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="访问路径">
            <code>{{ fullPath }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="页面组件">
            <code>{{ route.meta.componentName || '未知' }}</code>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="actions">
        <el-button type="primary" @click="goBack">返回首页</el-button>
        <el-button @click="goConfig">返回配置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/store/menu'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

const currentRole = computed(() => menuStore.currentRole)
const fullPath = computed(() => route.fullPath)

function goBack() {
  router.push('/preview/home')
}

function goConfig() {
  router.push('/config')
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 32px;
  margin: 20px 0 10px;
}

.error-message {
  font-size: 16px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.error-info {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
