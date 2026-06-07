import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'dynamic_menu_config'

const defaultMenuData = [
  {
    id: '1',
    name: '首页',
    path: '/preview/home',
    icon: 'HomeFilled',
    component: 'Home',
    hidden: false,
    params: [],
    interceptor: null,
    children: []
  },
  {
    id: '2',
    name: '系统管理',
    path: '/preview/system',
    icon: 'Setting',
    component: 'Layout',
    hidden: false,
    params: [],
    interceptor: null,
    children: [
      {
        id: '2-1',
        name: '用户管理',
        path: '/preview/system/user',
        icon: 'User',
        component: 'User',
        hidden: false,
        params: [{ key: 'id', type: 'number', required: true }],
        interceptor: { type: 'auth', roles: ['admin'] },
        children: []
      },
      {
        id: '2-2',
        name: '角色管理',
        path: '/preview/system/role',
        icon: 'UserFilled',
        component: 'Role',
        hidden: false,
        params: [],
        interceptor: null,
        children: []
      }
    ]
  },
  {
    id: '3',
    name: '数据中心',
    path: '/preview/data',
    icon: 'DataAnalysis',
    component: 'Layout',
    hidden: false,
    params: [],
    interceptor: null,
    children: [
      {
        id: '3-1',
        name: '数据统计',
        path: '/preview/data/statistics',
        icon: 'TrendCharts',
        component: 'Statistics',
        hidden: false,
        params: [],
        interceptor: null,
        children: []
      }
    ]
  }
]

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.warn('加载菜单配置失败:', e)
  }
  return JSON.parse(JSON.stringify(defaultMenuData))
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存菜单配置失败:', e)
    return false
  }
}

const previewComponents = import.meta.glob('/src/views/preview/*.vue')

console.log('[Store] 预加载的预览组件:', Object.keys(previewComponents))

function getPreviewComponent(componentName) {
  const exactPath = `/src/views/preview/${componentName}.vue`
  if (previewComponents[exactPath]) {
    console.log(`[Store] 找到组件: ${componentName} -> ${exactPath}`)
    return previewComponents[exactPath]
  }
  
  const matchedKey = Object.keys(previewComponents).find(p => {
    const fileName = p.split('/').pop()
    return fileName === `${componentName}.vue`
  })
  
  if (matchedKey) {
    console.log(`[Store] 通过匹配找到组件: ${componentName} -> ${matchedKey}`)
    return previewComponents[matchedKey]
  }
  
  console.warn(`[Store] 未找到组件: ${componentName}，使用 GenericPage 替代`)
  return previewComponents['/src/views/preview/GenericPage.vue']
}

export const useMenuStore = defineStore('menu', () => {
  const menuData = ref(loadFromStorage())
  const selectedId = ref(null)
  const errors = ref({})

  watch(menuData, (newVal) => {
    saveToStorage(newVal)
  }, { deep: true })

  function generateId() {
    return 'menu-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  function findMenuItem(id, items = menuData.value) {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children && item.children.length > 0) {
        const found = findMenuItem(id, item.children)
        if (found) return found
      }
    }
    return null
  }

  function findParent(id, items = menuData.value, parent = null) {
    for (const item of items) {
      if (item.id === id) return parent
      if (item.children && item.children.length > 0) {
        const found = findParent(id, item.children, item)
        if (found !== undefined) return found
      }
    }
    return undefined
  }

  function addMenuItem(parentId = null) {
    const newItem = {
      id: generateId(),
      name: '新菜单',
      path: '/preview/new',
      icon: 'Menu',
      component: 'Page',
      hidden: false,
      params: [],
      interceptor: null,
      children: []
    }

    if (parentId) {
      const parent = findMenuItem(parentId)
      if (parent) {
        newItem.path = parent.path.replace(/\/$/, '') + '/new'
        parent.children.push(newItem)
      }
    } else {
      menuData.value.push(newItem)
    }

    selectedId.value = newItem.id
    return newItem
  }

  function updateMenuItem(id, updates) {
    const item = findMenuItem(id)
    if (item) {
      Object.assign(item, updates)
      validateMenuItem(item)
    }
  }

  function deleteMenuItem(id) {
    const parent = findParent(id)
    const list = parent ? parent.children : menuData.value
    const index = list.findIndex(item => item.id === id)
    if (index !== -1) {
      list.splice(index, 1)
    }
    if (selectedId.value === id) {
      selectedId.value = null
    }
    delete errors.value[id]
  }

  function moveMenuItem(draggedId, targetId, position) {
    const draggedParent = findParent(draggedId)
    const draggedList = draggedParent ? draggedParent.children : menuData.value
    const draggedIndex = draggedList.findIndex(item => item.id === draggedId)
    const [draggedItem] = draggedList.splice(draggedIndex, 1)

    if (position === 'inner') {
      const target = findMenuItem(targetId)
      if (target) {
        draggedItem.path = target.path.replace(/\/$/, '') + '/' + draggedItem.name
        target.children.push(draggedItem)
      }
    } else {
      const targetParent = findParent(targetId)
      const targetList = targetParent ? targetParent.children : menuData.value
      const targetIndex = targetList.findIndex(item => item.id === targetId)
      const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
      targetList.splice(insertIndex, 0, draggedItem)
    }

    validateAll()
  }

  function validateMenuItem(item) {
    const itemErrors = []

    if (!item.name || item.name.trim() === '') {
      itemErrors.push('菜单名称不能为空')
    }

    if (!item.path || item.path.trim() === '') {
      itemErrors.push('路由路径不能为空')
    } else if (!/^\/preview\/[\w\-\/]*$/.test(item.path)) {
      itemErrors.push('路由路径必须以 /preview/ 开头')
    }

    if (!item.component || item.component.trim() === '') {
      itemErrors.push('组件名称不能为空')
    }

    if (item.params && item.params.length > 0) {
      item.params.forEach((param, index) => {
        if (!param.key || param.key.trim() === '') {
          itemErrors.push(`参数 ${index + 1}: 键名不能为空`)
        }
        if (!param.type) {
          itemErrors.push(`参数 ${param.key || index + 1}: 类型不能为空`)
        }
      })
    }

    const duplicate = checkDuplicatePath(item.path, item.id)
    if (duplicate) {
      itemErrors.push('路由路径已存在')
    }

    if (itemErrors.length > 0) {
      errors.value[item.id] = itemErrors
      return false
    } else {
      delete errors.value[item.id]
      return true
    }
  }

  function checkDuplicatePath(path, excludeId, items = menuData.value) {
    for (const item of items) {
      if (item.id !== excludeId && item.path === path) {
        return true
      }
      if (item.children && item.children.length > 0) {
        if (checkDuplicatePath(path, excludeId, item.children)) {
          return true
        }
      }
    }
    return false
  }

  function validateAll(items = menuData.value) {
    let valid = true
    for (const item of items) {
      if (!validateMenuItem(item)) {
        valid = false
      }
      if (item.children && item.children.length > 0) {
        if (!validateAll(item.children)) {
          valid = false
        }
      }
    }
    return valid
  }

  function resetToDefault() {
    menuData.value = JSON.parse(JSON.stringify(defaultMenuData))
    errors.value = {}
    selectedId.value = null
    saveToStorage(menuData.value)
  }

  function getFlatMenuList(items = menuData.value, result = []) {
    for (const item of items) {
      if (!item.hidden) {
        result.push({
          id: item.id,
          name: item.name,
          path: item.path,
          icon: item.icon,
          children: item.children && item.children.length > 0 ? [] : undefined
        })
      }
      if (item.children && item.children.length > 0) {
        const childResult = []
        getFlatMenuList(item.children, childResult)
        if (result.length > 0 && result[result.length - 1].id === item.id) {
          result[result.length - 1].children = childResult.filter(c => !c.hidden)
        }
      }
    }
    return result
  }

  function getAllRoutes(items = menuData.value, routes = []) {
    for (const item of items) {
      const routeName = `Preview_${item.id.replace(/[^a-zA-Z0-9_]/g, '_')}`
      routes.push({
        path: item.path,
        name: routeName,
        meta: {
          title: item.name,
          icon: item.icon,
          interceptor: item.interceptor,
          params: item.params,
          componentName: item.component
        },
        component: getPreviewComponent(item.component)
      })
      if (item.children && item.children.length > 0) {
        getAllRoutes(item.children, routes)
      }
    }
    return routes
  }

  return {
    menuData,
    selectedId,
    errors,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    findMenuItem,
    findParent,
    moveMenuItem,
    validateMenuItem,
    validateAll,
    resetToDefault,
    getFlatMenuList,
    getAllRoutes
  }
})
