<template>
  <div class="home-page">
    <div class="welcome-section">
      <el-result
        icon="success"
        title="欢迎使用动态路由菜单配置平台"
        sub-title="这是首页预览页面，展示了配置的菜单和路由效果"
      >
        <template #extra>
          <el-button type="primary" @click="goToConfig">
            <el-icon><Setting /></el-icon>
            前往配置页面
          </el-button>
        </template>
      </el-result>
    </div>

    <div class="stats-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon blue">
                <el-icon :size="32"><Menu /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalMenus }}</div>
                <div class="stat-label">菜单项总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon green">
                <el-icon :size="32"><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ visibleMenus }}</div>
                <div class="stat-label">可见菜单</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon orange">
                <el-icon :size="32"><Lock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ hiddenMenus }}</div>
                <div class="stat-label">隐藏菜单</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon purple">
                <el-icon :size="32"><Key /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ interceptors }}</div>
                <div class="stat-label">路由拦截</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="features-section">
      <h3 class="section-title">功能特性</h3>
      <el-row :gutter="24">
        <el-col :span="8" v-for="feature in features" :key="feature.title">
          <el-card class="feature-card" shadow="hover">
            <el-icon :size="40" :color="feature.color">
              <component :is="feature.icon" />
            </el-icon>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="quick-nav">
      <h3 class="section-title">快速导航</h3>
      <el-space wrap>
        <el-button
          v-for="menu in quickMenus"
          :key="menu.path"
          type="primary"
          plain
          @click="navigateTo(menu.path)"
        >
          <el-icon><component :is="menu.icon" /></el-icon>
          {{ menu.name }}
        </el-button>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/store/menu'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const router = useRouter()
const menuStore = useMenuStore()

const totalMenus = computed(() => {
  function count(items) {
    let total = items.length
    items.forEach(item => {
      if (item.children) {
        total += count(item.children)
      }
    })
    return total
  }
  return count(menuStore.menuData)
})

const visibleMenus = computed(() => {
  function count(items) {
    let total = items.filter(i => !i.hidden).length
    items.forEach(item => {
      if (item.children) {
        total += count(item.children)
      }
    })
    return total
  }
  return count(menuStore.menuData)
})

const hiddenMenus = computed(() => {
  function count(items) {
    let total = items.filter(i => i.hidden).length
    items.forEach(item => {
      if (item.children) {
        total += count(item.children)
      }
    })
    return total
  }
  return count(menuStore.menuData)
})

const interceptors = computed(() => {
  function count(items) {
    let total = items.filter(i => i.interceptor).length
    items.forEach(item => {
      if (item.children) {
        total += count(item.children)
      }
    })
    return total
  }
  return count(menuStore.menuData)
})

const features = [
  {
    icon: 'Edit',
    title: '可视化配置',
    desc: '直观的界面配置菜单名称、路径、图标等属性',
    color: '#409eff'
  },
  {
    icon: 'Rank',
    title: '拖拽排序',
    desc: '支持拖拽调整菜单顺序和层级嵌套关系',
    color: '#67c23a'
  },
  {
    icon: 'Key',
    title: '路由拦截',
    desc: '灵活配置权限验证、登录验证等拦截规则',
    color: '#e6a23c'
  },
  {
    icon: 'View',
    title: '实时预览',
    desc: '配置完成后可立即预览路由和菜单效果',
    color: '#f56c6c'
  },
  {
    icon: 'CircleCheck',
    title: '数据校验',
    desc: '实时校验配置数据，确保路由配置正确',
    color: '#909399'
  },
  {
    icon: 'Files',
    title: '本地持久化',
    desc: '配置数据自动保存到本地存储，刷新不丢失',
    color: '#8e44ad'
  }
]

const quickMenus = computed(() => {
  return menuStore.menuData
    .filter(m => !m.hidden)
    .slice(0, 5)
    .map(m => ({
      name: m.name,
      path: m.path,
      icon: ElementPlusIconsVue[m.icon] || ElementPlusIconsVue['Menu']
    }))
})

function goToConfig() {
  router.push('/config')
}

function navigateTo(path) {
  router.push(path)
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  overflow: hidden;
}

.welcome-section :deep(.el-result__title),
.welcome-section :deep(.el-result__subtitle) {
  color: white !important;
}

.welcome-section :deep(.el-result__icon svg) {
  fill: white !important;
}

.stats-section .stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.features-section .feature-card {
  text-align: center;
  padding: 24px;
  border-radius: 8px;
}

.feature-card h4 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.feature-card p {
  margin: 0;
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
}

.quick-nav {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
