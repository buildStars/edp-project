<template>
  <view class="page">
    <!-- 活动头部 - 优化版 -->
    <view class="activity-header">
      <view class="header-decoration"></view>
      <view class="activity-title">{{ detail.title }}</view>
      <view class="activity-meta">
        <view class="meta-item">
          <Icon name="time" :size="32" color="#999" />
          <text class="meta-text">{{ formatTime(detail.publishTime) }}</text>
        </view>
        <view class="meta-divider"></view>
        <view class="meta-item">
          <Icon name="view" :size="32" color="#999" />
          <text class="meta-text">{{ detail.views || 0 }} 阅读</text>
        </view>
      </view>
    </view>
    
    <!-- 活动内容 - 优化版 -->
    <view class="activity-content">
      <view class="content-wrapper">
        <rich-text :nodes="detail.content"></rich-text>
      </view>
    </view>
    
    <!-- 底部操作栏 - 优化版 -->
    <view class="action-bar">
      <view class="action-container">
        <view class="action-item" @click="handleLike">
          <view class="action-icon-wrapper" :class="{ liked: isLiked }">
            <Icon 
              :name="isLiked ? 'liked' : 'like'" 
              :size="48" 
              :color="isLiked ? '#fff' : '#666'"
            />
          </view>
          <text class="action-text" :class="{ liked: isLiked }">
            {{ isLiked ? '已点赞' : '点赞' }} ({{ detail.likes || 0 }})
          </text>
        </view>
        
        <view class="action-divider"></view>
        
        <view class="action-item" @click="handleShare">
          <view class="action-icon-wrapper">
            <Icon name="share" :size="48" color="#666" />
          </view>
          <text class="action-text">分享</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getActivityDetail, likeActivity, unlikeActivity } from '@/api/association'
import { formatTime } from '@/utils/util'
import { useUserStore } from '@/store/user'
import Icon from '@/components/icon/icon.vue'

// 活动详情（初始化为包含默认值的对象，防止渲染报错）
const detail = ref({
  title: '',
  publishTime: '',
  views: 0,
  content: '',
  likes: 0,
  coverImage: ''
})

// 活动ID
const activityId = ref('')

// 是否已点赞
const isLiked = ref(false)

// 用户store
const userStore = useUserStore()

// 页面加载
onLoad((options) => {
  if (options.id) {
    activityId.value = options.id
    loadDetail()
  }
})

// 加载详情
const loadDetail = async () => {
  uni.showLoading({
    title: '加载中...'
  })
  
  try {
    const data = await getActivityDetail(activityId.value)
    detail.value = data
    isLiked.value = data.isLiked || false
  } catch (error) {
    console.error('加载详情失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 点赞/取消点赞
const handleLike = async () => {
  // 检查登录状态
  if (!userStore.checkLogin()) {
    return
  }
  
  try {
    if (isLiked.value) {
      await unlikeActivity(activityId.value)
      isLiked.value = false
      detail.value.likes = (detail.value.likes || 1) - 1
    } else {
      await likeActivity(activityId.value)
      isLiked.value = true
      detail.value.likes = (detail.value.likes || 0) + 1
    }
  } catch (error) {
    console.error('操作失败：', error)
  }
}

// 分享
const handleShare = () => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

// 分享给好友
onShareAppMessage(() => {
  return {
    title: detail.value.title || '北大汇丰EDP活动',
    path: `/pages/association/activity-detail?id=${activityId.value}`,
    imageUrl: detail.value.coverImage || detail.value.images?.[0] || ''
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: detail.value.title || '北大汇丰EDP活动',
    query: `id=${activityId.value}`,
    imageUrl: detail.value.coverImage || detail.value.images?.[0] || ''
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

// 活动头部 - 优化版
.activity-header {
  position: relative;
  background: #fff;
  padding: 48rpx 32rpx 32rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  
  .header-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8rpx;
    background: linear-gradient(90deg, #C8161D 0%, #FF4757 50%, #C8161D 100%);
  }
  
  .activity-title {
    font-size: 40rpx;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.5;
    margin-bottom: 28rpx;
    padding-right: 20rpx;
  }
  
  .activity-meta {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx;
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    border-radius: 16rpx;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .meta-text {
        font-size: 26rpx;
        color: #999;
      }
    }
    
    .meta-divider {
      width: 2rpx;
      height: 24rpx;
      background-color: #e0e0e0;
      margin: 0 24rpx;
    }
  }
}

// 活动内容 - 优化版
.activity-content {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  
  .content-wrapper {
    padding: 32rpx;
    font-size: 30rpx;
    line-height: 1.8;
    color: #333;
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 24rpx 0;
      border-radius: 12rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
    }
    
    :deep(p) {
      margin: 20rpx 0;
      text-align: justify;
    }
    
    :deep(h1), :deep(h2), :deep(h3) {
      font-weight: 700;
      color: #1a1a1a;
      margin: 32rpx 0 16rpx;
    }
  }
}

// 底部操作栏 - 优化版
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
  z-index: 100;
  
  .action-container {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    border-radius: 20rpx;
    padding: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  }
  
  .action-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 16rpx;
    transition: all 0.3s ease;
    
    .action-icon-wrapper {
      width: 88rpx;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.liked {
        background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
        box-shadow: 0 6rpx 16rpx rgba(200, 22, 29, 0.4);
        animation: likeAnimation 0.6s ease;
      }
    }
    
    .action-text {
      font-size: 26rpx;
      font-weight: 600;
      color: #666;
      transition: all 0.3s ease;
      
      &.liked {
        color: #C8161D;
      }
    }
    
    &:active {
      transform: scale(0.95);
      
      .action-icon-wrapper {
        transform: scale(0.9);
      }
    }
  }
  
  .action-divider {
    width: 2rpx;
    height: 60rpx;
    background: linear-gradient(180deg, transparent 0%, #e0e0e0 50%, transparent 100%);
  }
}

// 点赞动画
@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>

