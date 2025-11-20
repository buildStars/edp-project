<template>
  <view class="empty-view">
    <!-- 暂时使用emoji图标替代图片 -->
    <view class="empty-icon">📭</view>
    <text class="empty-text">{{ text }}</text>
    <view v-if="showBtn" class="empty-btn" @click="handleClick">
      {{ btnText }}
    </view>
  </view>
</template>

<script setup>
// Props
const props = defineProps({
  text: {
    type: String,
    default: '暂无数据'
  },
  image: {
    type: String,
    default: ''
  },
  showBtn: {
    type: Boolean,
    default: false
  },
  btnText: {
    type: String,
    default: '刷新'
  }
})

// 点击按钮
const emit = defineEmits(['click'])
const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.empty-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .empty-icon {
    font-size: 200rpx;
    line-height: 1;
    margin-bottom: 40rpx;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
  
  .empty-btn {
    padding: 20rpx 60rpx;
    background-color: #C8161D;
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
  }
}
</style>

