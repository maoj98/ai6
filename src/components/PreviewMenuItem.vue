<template>
  <el-sub-menu
    v-if="hasChildren"
    :index="item.path"
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
    />
  </el-sub-menu>
  <el-menu-item
    v-else
    :index="item.path"
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
  }
})

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const iconComponent = computed(() => {
  const iconName = props.item.icon || 'Menu'
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue['Menu']
})
</script>

<style scoped>
.menu-icon {
  margin-right: 8px;
}
</style>
