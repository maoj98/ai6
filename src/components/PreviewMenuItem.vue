<template>
  <el-sub-menu
    v-if="hasChildren"
    :index="item.path"
    :class="{ 'menu-item-active': isActive }"
  >
    <template #title>
      <el-icon class="menu-icon">
        <component :is="iconComponent" />
      </el-icon>
      <span>{{ item.name }}</span>
    </template>
    <PreviewMenuItem
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :activePath="activePath"
    />
  </el-sub-menu>
  <el-menu-item
    v-else
    :index="item.path"
    :class="{ 'menu-item-active': isActive }"
  >
    <el-icon class="menu-icon">
      <component :is="iconComponent" />
    </el-icon>
    <span>{{ item.name }}</span>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  activePath: {
    type: String,
    default: ''
  }
})

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const iconComponent = computed(() => {
  const iconName = props.item.icon || 'Menu'
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue['Menu']
})

const isActive = computed(() => {
  if (!props.activePath) return false
  
  if (props.item.path === props.activePath) {
    return true
  }
  
  if (hasChildren.value) {
    return checkChildrenActive(props.item.children, props.activePath)
  }
  
  return false
})

function checkChildrenActive(children, path) {
  for (const child of children) {
    if (child.path === path) {
      return true
    }
    if (child.children && child.children.length > 0) {
      if (checkChildrenActive(child.children, path)) {
        return true
      }
    }
  }
  return false
}
</script>

<style scoped>
.menu-icon {
  margin-right: 8px;
}
</style>
