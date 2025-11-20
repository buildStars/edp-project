<template>
  <view class="custom-navbar" :style="{ height: navbarHeight + 'px' }">
    <view 
      class="navbar-content" 
      :style="{ paddingTop: statusBarHeight + 'px', height: (navbarHeight - statusBarHeight) + 'px' }"
    >
      <view class="navbar-left" @click="handleBack" v-if="showBack">
        <Icon name="back" :size="40" />
      </view>
      <view class="navbar-center">
        <image v-if="showLogo" src="/static/images/logo.png" class="logo" />
        <text v-else class="navbar-title">{{ title }}</text>
      </view>
      <view class="navbar-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Icon from '@/components/icon/icon.vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showLogo: {
    type: Boolean,
    default: false
  },
  showBack: {
    type: Boolean,
    default: false
  }
})

// 状态栏高度
const statusBarHeight = ref(0)
// 导航栏高度
const navbarHeight = ref(0)

// 获取系统信息
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  // 导航栏高度 = 状态栏高度 + 导航栏内容高度（44px）
  navbarHeight.value = statusBarHeight.value 
})

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 999;
  border-bottom: 1rpx solid #E5E5E5;
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
    
    .navbar-left {
      width: 80rpx;
      display: flex;
      align-items: center;
      
      .back-icon {
        width: 40rpx;
        height: 40rpx;
      }
    }
    
    .navbar-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .logo {
        height:7.875rem;
        width: 15.75rem;
      }
      
      .navbar-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }
    }
    
    .navbar-right {
      width: 80rpx;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
}
</style>

