<template>
  <image 
    class="uni-icon" 
    :src="iconPath" 
    :style="iconStyle"
    mode="aspectFit"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 48
  },
  color: {
    type: String,
    default: '#666666'
  }
})

// 图标路径映射
const iconPath = computed(() => {
  // 小程序使用绝对路径，不能使用require动态路径
  return `/static/icons/${props.name}.png`
})

// 图标样式
const iconStyle = computed(() => {
  return {
    width: `${props.size}rpx`,
    height: `${props.size}rpx`,
    display: 'inline-block',
    verticalAlign: 'middle'
  }
})
</script>

<style lang="scss" scoped>
/* 小程序环境下移除所有样式，使用内联样式 */
</style>

