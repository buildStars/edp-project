<template>
  <view class="activity-card" @click="handleClick">
    <image 
      :src="activity.coverImage || '/static/images/placeholder.png'" 
      class="activity-image"
      mode="aspectFill"
      lazy-load
      @error="handleImageError"
    />
    <view class="activity-info">
      <view class="activity-title">{{ activity.title }}</view>
      <view class="activity-meta">
        <text class="meta-item">{{ formatTime(activity.publishTime) }}</text>
        <text class="meta-item">{{ activity.views || 0 }} 阅读</text>
        <text v-if="activity.likes" class="meta-item">
          ❤️ {{ activity.likes }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { formatRelativeTime } from '@/utils/util'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.activity)
}

const formatTime = (time) => {
  return formatRelativeTime(time)
}

const handleImageError = (e) => {
  console.warn('活动封面图加载失败:', props.activity.id)
  // 可以设置默认图片
  // e.target.src = '/static/images/placeholder.png'
}
</script>

<style lang="scss" scoped>
.activity-card {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }

  .activity-image {
    width: 200rpx;
    height: 150rpx;
    border-radius: 8rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
    background-color: #f5f5f5;
  }

  .activity-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0; // 防止文字溢出

    .activity-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-all;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 16rpx;
      font-size: 24rpx;
      color: #999;

      .meta-item {
        white-space: nowrap;
      }
    }
  }
}
</style>


