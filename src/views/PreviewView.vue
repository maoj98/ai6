<template>
  <div class="preview-container">
    <el-container class="preview-layout">
      <el-header class="preview-header">
        <div class="header-left">
          <el-icon class="logo-icon"><Promotion /></el-icon>
          <span class="title">预览模式</span>
          <el-tag type="success" effect="light">实时预览</el-tag>
        </div>
        <div class="header-right">
          <el-select v-model="currentRole" placeholder="选择角色" size="small" style="width: 120px; margin-right: 12px;">
            <el-option label="admin" value="admin" />
            <el-option label="editor" value="editor" />
            <el-option label="viewer" value="viewer" />
            <el-option label="guest" value="guest" />
          </el-select>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
          <el-button type="primary" @click="goBack">
            <el-icon><Back /></el-icon>
            返回配置
          </el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="240px" class="preview-aside">
          <el-scrollbar>
            <el-menu
              :default-active="activeMenu"
              :collapse="false"
              :unique-opened="false"
              router
              class="preview-menu"
            >
              <template v-for="item in menuList" :key="item.id">
                <SubMenuItem :item="item" />
              </template>
            </el-menu>
          </el-scrollbar>
        </el-aside>
        <el-main class="preview-main">
          <div v-if="interceptorBlocked" class="interceptor-blocked">
            <el-icon size="80" color="#f56c6c"><Lock /></el-icon>
            <h2>访问被拦截</h2>
            <p>{{ blockMessage }}</p>
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </div>
          <router-view v-else />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, h, resolveComponent as vueResolveComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/store/menu'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()

const currentRole = ref('admin')
const interceptorBlocked = ref(false)
const blockMessage = ref('')

const menuList = computed(() => menuStore.getFlatMenuList())

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const crumbs = []
  const path = route.path
  
  function findPath(items, currentPath, parents = []) {
    for (const item of items) {
      if (item.path === currentPath) {
        return [...parents, { name: item.name, path: item.path }]
      }
      if (item.children && item.children.length > 0) {
        const found = findPath(item.children, currentPath, [...parents, { name: item.name, path: item.path }])
        if (found) return found
      }
    }
    return null
  }
  
  const result = findPath(menuList.value, path)
  return result || [{ name: '首页', path: '/preview/home' }]
})

const SubMenuItem = {
  name: 'SubMenuItem',
  props: ['item'],
  setup(props) {
    if (props.item.children && props.item.children.length > 0) {
      return () => h('el-sub-menu', { index: props.item.path }, {
        title: () => h('span', { class: 'menu-title' }, [
          h('el-icon', { class: 'menu-icon' }, [h(resolveComponent(props.item.icon || 'Menu'))]),
          h('span', props.item.name)
        ]),
        default: () => props.item.children.map(child => 
          h(SubMenuItem, { key: child.id, item: child })
        )
      })
    } else {
      return () => h('el-menu-item', { index: props.item.path }, [
        h('el-icon', { class: 'menu-icon' }, [h(resolveComponent(props.item.icon || 'Menu'))]),
        h('span', props.item.name)
      ])
    }
  }
}

function resolveComponent(name) {
  return ElementPlusIconsVue[name] || ElementPlusIconsVue['Menu']
}

function checkInterceptor(to) {
  const allRoutes = menuStore.getAllRoutes()
  const matchedRoute = allRoutes.find(r => r.path === to.path)
  
  if (matchedRoute && matchedRoute.meta.interceptor) {
    const interceptor = matchedRoute.meta.interceptor
    
    switch (interceptor.type) {
      case 'login':
        if (currentRole.value === 'guest') {
          interceptorBlocked.value = true
          blockMessage.value = '请登录后访问此页面'
          return false
        }
        break
      case 'auth':
        if (interceptor.roles && interceptor.roles.length > 0) {
          if (!interceptor.roles.includes(currentRole.value)) {
            interceptorBlocked.value = true
            blockMessage.value = `您没有权限访问此页面，需要角色：${interceptor.roles.join(', ')}`
            return false
          }
        }
        break
      case 'custom':
        try {
          const fn = new Function('user', 'route', interceptor.rule || 'return true')
          const user = { role: currentRole.value }
          if (!fn(user, to)) {
            interceptorBlocked.value = true
            blockMessage.value = '自定义拦截规则未通过'
            return false
          }
        } catch (e) {
          console.error('自定义拦截规则执行失败:', e)
        }
        break
    }
  }
  
  interceptorBlocked.value = false
  return true
}

function goBack() {
  router.push('/config')
}

function goHome() {
  interceptorBlocked.value = false
  router.push('/preview/home')
}

onMounted(() => {
  const routes = menuStore.getAllRoutes()
  routes.forEach(r => {
    if (!router.hasRoute(r.name)) {
      router.addRoute('Preview', r)
    }
  })
  
  if (route.path === '/preview') {
    const firstRoute = routes.find(r => !r.meta?.hidden)
    if (firstRoute) {
      router.push(firstRoute.path)
    }
  }
})

watch(route, (to) => {
  checkInterceptor(to)
}, { immediate: true })

watch(currentRole, () => {
  ElMessage.info(`已切换角色为: ${currentRole.value}`)
  checkInterceptor(route)
})
</script>

<style scoped>
.preview-container {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
}

.preview-layout {
  height: 100%;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
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
  font-size: 28px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-aside {
  background: #304156;
  border-right: 1px solid #1f2d3d;
}

.preview-menu {
  border-right: none;
  background: #304156;
}

.preview-menu :deep(.el-menu-item),
.preview-menu :deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

.preview-menu :deep(.el-menu-item:hover),
.preview-menu :deep(.el-sub-menu__title:hover) {
  background: #263445;
  color: #fff;
}

.preview-menu :deep(.el-menu-item.is-active) {
  background: #409eff;
  color: #fff;
}

.preview-menu :deep(.el-sub-menu) {
  background: #1f2d3d;
}

.menu-icon {
  margin-right: 8px;
}

.preview-main {
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;
}

.interceptor-blocked {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #606266;
  gap: 16px;
}

.interceptor-blocked h2 {
  margin: 0;
  color: #f56c6c;
}

.interceptor-blocked p {
  margin: 0;
}

:deep(.el-breadcrumb__item) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-breadcrumb__separator) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-breadcrumb__inner) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-breadcrumb__inner:hover) {
  color: #fff;
}
</style>
