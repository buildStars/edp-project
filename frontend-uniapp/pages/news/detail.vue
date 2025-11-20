<template>
  <view class="page">
    <!-- 文章头部 -->
    <view class="article-header">
      <view class="article-title">{{ newsDetail.title }}</view>
      <view class="article-meta">
        <view class="meta-left">
          <text class="time">{{ formatTime(newsDetail.publishTime) }}</text>
          <text class="views">{{ newsDetail.views || 0 }} 阅读</text>
        </view>
        <view class="category-tag">{{ getCategoryText(newsDetail.category) }}</view>
      </view>
    </view>
    
    <!-- 文章内容 -->
    <view class="article-content">
      <rich-text :nodes="newsDetail.content"></rich-text>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-item" @click="handleCollect">
        <Icon 
          :name="isCollected ? 'star' : 'star-o'" 
          :size="48" 
          :color="isCollected ? '#FFB400' : '#666'"
        />
        <text :class="{ collected: isCollected }">{{ isCollected ? '已收藏' : '收藏' }}</text>
      </view>
      <view class="action-item" @click="handleShare">
        <Icon name="share" :size="48" color="#666" />
        <text>分享</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getNewsDetail, collectNews, uncollectNews } from '@/api/news'
import { formatTime } from '@/utils/util'
import { useUserStore } from '@/store/user'
import Icon from '@/components/icon/icon.vue'

// 资讯详情（初始化为包含默认值的对象，防止渲染报错）
const newsDetail = ref({
  title: '',
  publishTime: '',
  views: 0,
  category: '',
  content: '',
  coverImage: ''
})

// 资讯ID
const newsId = ref('')

// 是否已收藏
const isCollected = ref(false)

// 用户store
const userStore = useUserStore()

// 页面加载
onLoad((options) => {
  if (options.id) {
    newsId.value = options.id
    loadNewsDetail()
  }
})

// 加载资讯详情
const loadNewsDetail = async () => {
  uni.showLoading({
    title: '加载中...'
  })
  
  try {
    const data = await getNewsDetail(newsId.value)
    newsDetail.value = data
    isCollected.value = data.isCollected || false
  } catch (error) {
    console.error('加载资讯详情失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 获取分类文本
const getCategoryText = (category) => {
  const map = {
    'notice': '学院通知',
    'alumni': '校友动态'
  }
  return map[category] || ''
}

// 收藏/取消收藏
const handleCollect = async () => {
  // 检查登录状态
  if (!userStore.checkLogin()) {
    return
  }
  
  try {
    if (isCollected.value) {
      const result = await uncollectNews(newsId.value)
      isCollected.value = false
      uni.showToast({
        title: result?.message || '已取消收藏',
        icon: 'success'
      })
    } else {
      const result = await collectNews(newsId.value)
      isCollected.value = true
      uni.showToast({
        title: result?.message || '收藏成功',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('操作失败：', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
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
    title: newsDetail.value.title || '北大汇丰EDP',
    path: `/pages/news/detail?id=${newsId.value}`,
    imageUrl: newsDetail.value.coverImage
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: newsDetail.value.title || '北大汇丰EDP',
    query: `id=${newsId.value}`,
    imageUrl: newsDetail.value.coverImage
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 120rpx;
}

.article-header {
  padding: 40rpx 24rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .article-title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
    line-height: 1.5;
    margin-bottom: 24rpx;
  }
  
  .article-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .meta-left {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #999;
      
      .time {
        margin-right: 24rpx;
      }
    }
    
    .category-tag {
      padding: 8rpx 16rpx;
      background-color: #f0f0f0;
      color: #666;
      font-size: 24rpx;
      border-radius: 4rpx;
    }
  }
}

.article-content {
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20rpx 0;
  }
  
  :deep(p) {
    margin: 20rpx 0;
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;
  
  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #666;
    gap: 8rpx;
    transition: all 0.3s ease;
    
    &:active {
      opacity: 0.7;
      transform: scale(0.95);
    }
    
    text.collected {
      color: #FFB400;
    }
  }
}
</style>

