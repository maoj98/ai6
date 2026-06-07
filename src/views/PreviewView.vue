<template>
  <div class="preview-container">
    <el-container class="preview-layout">
      <el-header class="preview-header">
        <div class="header-left">
          <el-icon class="logo-icon"><Promotion /></el-icon>
          <span class="title">预览模式</span>
          <el-tag type="success" effect="light">实时预览</el-tag>
          <el-tag type="warning" effect="light">角色: {{ currentRole }}</el-tag>
        </div>
        <div class="header-right">
          <el-select v-model="currentRole" placeholder="选择角色" size="small" style="width: 140px; margin-right: 12px;">
            <el-option label="admin (管理员)" value="admin" />
            <el-option label="editor (编辑)" value="editor" />
            <el-option label="viewer (访客)" value="viewer" />
            <el-option label="guest (游客)" value="guest" />
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
              <PreviewMenuItem
                v-for="item in visibleMenuList"
                :key="item.id"
                :item="item"
              />
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
import { ref, computed, watch, onBeforeMount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/store/menu'
import { ElMessage } from 'element-plus'
import PreviewMenuItem from '@/components/PreviewMenuItem.vue'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()

const currentRole = ref(menuStore.currentRole)
const interceptorBlocked = ref(false)
const blockMessage = ref('')
const routesRegistered = ref(false)
const registeredRouteNames = ref([])

function clearDynamicRoutes() {
  registeredRouteNames.value.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
      console.log(`[Preview] 移除路由: ${name}`)
    }
  })
  registeredRouteNames.value = []
  routesRegistered.value = false
}

function registerDynamicRoutes(role) {
  clearDynamicRoutes()
  
  const routes = menuStore.getAllRoutes(menuStore.menuData, role)
  const notFoundRoute = {
    path: '/preview/404',
    name: 'Preview_404',
    meta: { title: '404', componentName: 'NotFound' },
    component: () => import('@/views/preview/NotFound.vue')
  }
  const catchAllRoute = {
    path: '/preview/:pathMatch(.*)*',
    name: 'Preview_NotFound',
    meta: { title: '404', componentName: 'NotFound' },
    component: () => import('@/views/preview/NotFound.vue')
  }
  
  routes.forEach(r => {
    router.addRoute('Preview', r)
    registeredRouteNames.value.push(r.name)
    console.log(`[Preview] 注册路由: ${r.path} -> ${r.name}`)
  })
  
  router.addRoute('Preview', notFoundRoute)
  registeredRouteNames.value.push(notFoundRoute.name)
  
  router.addRoute('Preview', catchAllRoute)
  registeredRouteNames.value.push(catchAllRoute.name)
  
  console.log(`[Preview] 角色 [${role}] 已注册 ${routes.length} 个动态路由 + 2 个 404 路由`)
  routesRegistered.value = true
  return routes
}

const visibleMenuList = computed(() => {
  return menuStore.getFlatMenuList(menuStore.menuData, currentRole.value)
})

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
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
  
  const allMenuData = menuStore.filterMenuByRole(menuStore.menuData, currentRole.value)
  const result = findPath(allMenuData, path)
  return result || [{ name: '首页', path: '/preview/home' }]
})

function checkRoutePermission(to) {
  if (to.path.startsWith('/preview/') && to.path !== '/preview/404') {
    if (to.name === 'Preview_NotFound') {
      console.log(`[Preview] 页面不存在: ${to.path}`)
      return { path: '/preview/404', query: { from: to.path }, replace: true }
    }
    const hasAccess = menuStore.checkRouteAccess(to.path, currentRole.value)
    if (!hasAccess) {
      console.log(`[Preview] 角色 [${currentRole.value}] 无权访问: ${to.path}`)
      return { path: '/preview/404', query: { from: to.path }, replace: true }
    }
  }
  return true
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

function handleRoleChange(newRole) {
  menuStore.currentRole = newRole
  ElMessage.success(`已切换角色为: ${newRole}`)
  
  console.log(`[Preview] 角色切换，重新注册路由...`)
  const routes = registerDynamicRoutes(newRole)
  
  const currentPath = route.path
  const hasAccess = menuStore.checkRouteAccess(currentPath, newRole)
  
  if (!hasAccess || currentPath === '/preview' || currentPath === '/preview/') {
    const firstVisibleRoute = routes.find(r => !r.meta?.hidden)
    if (firstVisibleRoute) {
      console.log(`[Preview] 跳转到角色 [${newRole}] 的第一个可见路由: ${firstVisibleRoute.path}`)
      nextTick(() => {
        router.push(firstVisibleRoute.path)
      })
    }
  } else {
    checkInterceptor(route)
  }
}

function goBack() {
  router.push('/config')
}

function goHome() {
  interceptorBlocked.value = false
  router.push('/preview/home')
}

onBeforeMount(() => {
  console.log(`[Preview] 初始化，角色: ${currentRole.value}`)
  const routes = registerDynamicRoutes(currentRole.value)
  
  if (route.path === '/preview' || route.path === '/preview/') {
    const firstRoute = routes.find(r => !r.meta?.hidden)
    if (firstRoute) {
      console.log(`[Preview] 跳转到第一个可见路由: ${firstRoute.path}`)
      setTimeout(() => {
        router.push(firstRoute.path)
      }, 100)
    }
  } else {
    const permissionResult = checkRoutePermission(route)
    if (permissionResult !== true) {
      console.log(`[Preview] 初始化时检测到无权限访问: ${route.path}，跳转到 404`)
      setTimeout(() => {
        router.replace(permissionResult)
      }, 100)
    }
  }
})

const unBeforeEach = router.beforeEach((to, from, next) => {
  if (routesRegistered.value && to.path.startsWith('/preview/')) {
    const result = checkRoutePermission(to)
    if (result !== true) {
      next(result)
      return
    }
  }
  next()
})

watch(route, (to) => {
  if (routesRegistered.value) {
    checkInterceptor(to)
  }
}, { immediate: false })

watch(currentRole, (newRole) => {
  handleRoleChange(newRole)
})

watch(routesRegistered, (registered) => {
  if (registered) {
    checkInterceptor(route)
  }
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
