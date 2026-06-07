<template>
  <div class="menu-tree">
    <DraggableTreeItem
      v-for="item in menuStore.menuData"
      :key="item.id"
      :item="item"
      :level="0"
      @select="selectItem"
    />
  </div>
</template>

<script setup>
import { useMenuStore } from '@/store/menu'
import DraggableTreeItem from './DraggableTreeItem.vue'

const menuStore = useMenuStore()

function selectItem(id) {
  menuStore.selectedId = id
}
</script>

<style scoped>
.menu-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
