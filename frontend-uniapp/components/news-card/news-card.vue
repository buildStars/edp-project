<template>
  <view class="news-card" @click="handleClick">
    <view class="news-image">
      <image :src="news.coverImage" mode="aspectFill" />
    </view>
    <view class="news-content">
      <view class="news-title">{{ news.title }}</view>
      <view class="news-summary">{{ news.summary }}</view>
      <view class="news-meta">
        <text class="news-time">{{ formatTime(news.publishTime) }}</text>
        <text class="news-views">{{ news.views || 0 }} 阅读</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { formatRelativeTime } from '@/utils/util'

// Props
const props = defineProps({
  news: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// 格式化时间
const formatTime = (time) => {
  return formatRelativeTime(time)
}

// 点击事件
const emit = defineEmits(['click'])
const handleClick = () => {
  emit('click', props.news)
}
</script>

<style lang="scss" scoped>
.news-card {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  
  .news-image {
    width: 200rpx;
    height: 150rpx;
    border-radius: 8rpx;
    overflow: hidden;
    flex-shrink: 0;
    margin-right: 24rpx;
    
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .news-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 150rpx;
    
    .news-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 12rpx;
    }
    
    .news-summary {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      flex: 1;
    }
    
    .news-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 24rpx;
      color: #999;
      margin-top: 12rpx;
      
      .news-time {
        margin-right: 24rpx;
      }
    }
  }
}
</style>

