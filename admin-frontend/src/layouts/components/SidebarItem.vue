<template>
  <!-- 有子菜单 -->
  <el-sub-menu v-if="hasChildren" :index="route.path">
    <template #title>
      <el-icon v-if="route.icon">
        <component :is="route.icon" />
      </el-icon>
      <span>{{ route.title }}</span>
    </template>
    <sidebar-item
      v-for="child in visibleChildren"
      :key="child.path"
      :route="child"
    />
  </el-sub-menu>

  <!-- 单个菜单 -->
  <el-menu-item v-else :index="route.path">
    <el-icon v-if="route.icon">
      <component :is="route.icon" />
    </el-icon>
    <template #title>
      <span>{{ route.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@/config/permissions'

interface Props {
  route: MenuItem
}

const props = defineProps<Props>()

// 可见的子菜单
const visibleChildren = computed(() => {
  if (!props.route.children) return []
  return props.route.children.filter((child) => !child.hidden && child.title)
})

// 是否有子菜单
const hasChildren = computed(() => {
  return visibleChildren.value.length > 0
})
</script>
