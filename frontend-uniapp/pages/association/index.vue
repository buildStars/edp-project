<template>
  <view class="page">
    <!-- 分类Tab - 优化版 -->
    <view class="category-tabs">
      <view class="tabs-container">
        <view 
          v-for="(item, index) in tabs" 
          :key="index"
          class="tab-item"
          :class="{ active: currentTab === item.value }"
          @click="switchTab(item.value)"
        >
          <view class="tab-icon">
            <Icon :name="item.icon" :size="40" :color="currentTab === item.value ? '#C8161D' : '#999'" />
          </view>
          <text class="tab-label">{{ item.label }}</text>
          <view v-if="item.badge" class="tab-badge">{{ item.badge }}</view>
        </view>
        
        <!-- 滑动指示器 -->
        <view class="tab-indicator" :style="{ transform: `translateX(${getIndicatorPosition()}rpx)` }"></view>
      </view>
    </view>
    
    <!-- 同学会列表 - 优化版 -->
    <view v-if="currentTab === 'alumni'" class="association-list">
      <view 
        v-for="(item, index) in alumniList" 
        :key="item.id"
        class="association-card"
        :style="{ 'animation-delay': `${index * 0.1}s` }"
        @click="goAssociationDetail(item)"
      >
        <view class="card-header">
          <view class="logo-wrapper">
            <image :src="item.logo" class="association-logo" mode="aspectFill" />
            <view class="logo-decoration"></view>
          </view>
          <view class="association-info">
            <view class="association-name">{{ item.name }}</view>
            <view class="association-desc" v-if="item.description">{{ item.description }}</view>
            <view class="association-meta">
              <view class="meta-item">
                <Icon name="time" :size="28" color="#999" />
                <text class="meta-text">{{ formatTime(item.updateTime) }}</text>
              </view>
              <view class="meta-item">
                <Icon name="view" :size="28" color="#999" />
                <text class="meta-text">{{ item.views || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="card-footer">
          <view class="tag-list" v-if="item.tags && item.tags.length > 0">
            <view class="tag" v-for="(tag, idx) in item.tags.slice(0, 3)" :key="idx">{{ tag }}</view>
          </view>
          <Icon name="arrow-right" :size="32" color="#C8161D" class="arrow-icon" />
        </view>
      </view>
    </view>
    
    <!-- 俱乐部列表 - 优化版 -->
    <view v-if="currentTab === 'club'" class="association-list">
      <view 
        v-for="(item, index) in clubList" 
        :key="item.id"
        class="association-card"
        :style="{ 'animation-delay': `${index * 0.1}s` }"
        @click="goAssociationDetail(item)"
      >
        <view class="card-header">
          <view class="logo-wrapper">
            <image :src="item.logo" class="association-logo" mode="aspectFill" />
            <view class="logo-decoration"></view>
          </view>
          <view class="association-info">
            <view class="association-name">{{ item.name }}</view>
            <view class="association-desc" v-if="item.description">{{ item.description }}</view>
            <view class="association-meta">
              <view class="meta-item">
                <Icon name="time" :size="28" color="#999" />
                <text class="meta-text">{{ formatTime(item.updateTime) }}</text>
              </view>
              <view class="meta-item">
                <Icon name="view" :size="28" color="#999" />
                <text class="meta-text">{{ item.views || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="card-footer">
          <view class="tag-list" v-if="item.tags && item.tags.length > 0">
            <view class="tag" v-for="(tag, idx) in item.tags.slice(0, 3)" :key="idx">{{ tag }}</view>
          </view>
          <Icon name="arrow-right" :size="32" color="#C8161D" class="arrow-icon" />
        </view>
      </view>
    </view>
    
    <!-- 活动列表 - 优化版 -->
    <view v-if="currentTab === 'activity'" class="activity-list">
      <view 
        v-for="(item, index) in activityList" 
        :key="item.id"
        class="activity-card-enhanced"
        :style="{ 'animation-delay': `${index * 0.1}s` }"
        @click="goActivityDetail(item)"
      >
        <!-- 活动图片 -->
        <view class="activity-images-wrapper">
          <view 
            v-if="item.images && item.images.length > 0" 
            class="activity-images"
            :class="`images-count-${Math.min(item.images.length, 4)}`"
          >
            <view 
              v-for="(img, idx) in item.images.slice(0, 4)" 
              :key="idx"
              class="image-item"
            >
              <image 
                :src="img" 
                class="activity-image"
                mode="aspectFill"
              />
              <view v-if="idx === 3 && item.images.length > 4" class="image-more">
                <text>+{{ item.images.length - 4 }}</text>
              </view>
            </view>
          </view>
          <view v-else class="activity-cover">
            <image :src="item.coverImage" class="cover-image" mode="aspectFill" />
          </view>
        </view>
        
        <!-- 活动信息 -->
        <view class="activity-info">
          <view class="activity-title">{{ item.title }}</view>
          <view class="activity-meta">
            <view class="meta-left">
              <view class="meta-item">
                <Icon name="time" :size="28" color="#999" />
                <text class="meta-text">{{ formatTime(item.publishTime) }}</text>
              </view>
              <view class="meta-item">
                <Icon name="view" :size="28" color="#999" />
                <text class="meta-text">{{ item.views || 0 }}</text>
              </view>
            </view>
            <view class="like-badge">
              <Icon name="like" :size="28" color="#ff6b6b" />
              <text class="like-count">{{ item.likes || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <empty-view 
      v-if="getCurrentList().length === 0"
      text="暂无内容"
      :show-btn="true"
      @click="loadData"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { getAssociationList, getActivityList } from '@/api/association'
import { formatRelativeTime } from '@/utils/util'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'

// 当前Tab
const currentTab = ref('alumni')

// Tab列表
const tabs = ref([
  { label: '同学会', value: 'alumni', icon: 'user', badge: '' },
  { label: '俱乐部', value: 'club', icon: 'association', badge: '' },
  { label: '活动', value: 'activity', icon: 'star', badge: '' }
])

// 获取指示器位置
const getIndicatorPosition = () => {
  const tabWidth = 228 // 每个tab的宽度
  const index = tabs.value.findIndex(tab => tab.value === currentTab.value)
  return index * tabWidth
}

// 同学会列表
const alumniList = ref([])

// 俱乐部列表
const clubList = ref([])

// 活动列表
const activityList = ref([])

// 页面加载
onMounted(() => {
  loadData()
})

// 获取当前列表
const getCurrentList = () => {
  if (currentTab.value === 'alumni') return alumniList.value
  if (currentTab.value === 'club') return clubList.value
  if (currentTab.value === 'activity') return activityList.value
  return []
}

// 切换Tab
const switchTab = (tab) => {
  currentTab.value = tab
  loadData()
}

// 加载数据
const loadData = async () => {
  uni.showLoading({
    title: '加载中...'
  })
  
  try {
    if (currentTab.value === 'activity') {
      const data = await getActivityList({ page: 1, pageSize: 20 })
      // 活动接口返回分页对象 { items: [], total, page, pageSize, totalPages }
      activityList.value = data.items || data.data || data.list || []
    } else {
      const data = await getAssociationList(currentTab.value)
      // 协会接口直接返回数组，不是分页对象
      const list = Array.isArray(data) ? data : (data.items || data.data || data.list || [])
      
      if (currentTab.value === 'alumni') {
        alumniList.value = list
      } else {
        clubList.value = list
      }
    }
  } catch (error) {
    console.error('加载数据失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 格式化时间
const formatTime = (time) => {
  return formatRelativeTime(time)
}

// 跳转协会详情
const goAssociationDetail = (item) => {
  uni.navigateTo({
    url: `/pages/association/detail?id=${item.id}&type=${currentTab.value}`
  })
}

// 跳转活动详情
const goActivityDetail = (item) => {
  uni.navigateTo({
    url: `/pages/association/activity-detail?id=${item.id}`
  })
}

// 下拉刷新
onPullDownRefresh(() => {
  loadData().then(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

// 分类Tab - 优化版
.category-tabs {
  background: #fff;
  padding: 20rpx 24rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .tabs-container {
    position: relative;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    border-radius: 16rpx;
    padding: 8rpx;
    
    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0;
      position: relative;
      transition: all 0.3s ease;
      z-index: 2;
      
      .tab-icon {
        margin-bottom: 8rpx;
        transition: all 0.3s ease;
      }
      
      .tab-label {
        font-size: 26rpx;
        color: #999;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .tab-badge {
        position: absolute;
        top: 12rpx;
        right: 20rpx;
        min-width: 32rpx;
        height: 32rpx;
        background: linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%);
        color: #fff;
        font-size: 20rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8rpx;
        box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.4);
      }
      
      &.active {
        .tab-icon {
          transform: scale(1.1);
        }
        
        .tab-label {
          color: #C8161D;
          font-weight: 600;
        }
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    // 滑动指示器
    .tab-indicator {
      position: absolute;
      bottom: 8rpx;
      left: 8rpx;
      width: 228rpx;
      height: calc(100% - 16rpx);
      background: linear-gradient(135deg, rgba(200, 22, 29, 0.1) 0%, rgba(200, 22, 29, 0.05) 100%);
      border-radius: 12rpx;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;
      box-shadow: 0 2rpx 8rpx rgba(200, 22, 29, 0.1);
    }
  }
}

// 协会列表 - 优化版
.association-list {
  padding: 24rpx;
  
  .association-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    animation: fadeInUp 0.6s ease both;
    transition: all 0.3s ease;
    
    .card-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 24rpx;
      
      .logo-wrapper {
        position: relative;
        margin-right: 24rpx;
        flex-shrink: 0;
        
        .association-logo {
          width: 136rpx;
          height: 136rpx;
          border-radius: 20rpx;
          box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .logo-decoration {
          position: absolute;
          top: -8rpx;
          right: -8rpx;
          width: 32rpx;
          height: 32rpx;
          background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
          border-radius: 50%;
          border: 4rpx solid #fff;
          box-shadow: 0 2rpx 8rpx rgba(200, 22, 29, 0.3);
        }
      }
      
      .association-info {
        flex: 1;
        
        .association-name {
          font-size: 32rpx;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12rpx;
          line-height: 1.4;
        }
        
        .association-desc {
          font-size: 26rpx;
          color: #666;
          line-height: 1.6;
          margin-bottom: 16rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .association-meta {
          display: flex;
          align-items: center;
          gap: 24rpx;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8rpx;
            
            .meta-text {
              font-size: 24rpx;
              color: #999;
            }
          }
        }
      }
    }
    
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 24rpx;
      border-top: 1rpx solid #f0f0f0;
      
      .tag-list {
        display: flex;
        align-items: center;
        gap: 12rpx;
        flex: 1;
        
        .tag {
          padding: 6rpx 16rpx;
          background: linear-gradient(135deg, rgba(200, 22, 29, 0.08) 0%, rgba(200, 22, 29, 0.05) 100%);
          color: #C8161D;
          font-size: 22rpx;
          border-radius: 20rpx;
        }
      }
      
      .arrow-icon {
        flex-shrink: 0;
        transition: all 0.3s ease;
      }
    }
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
      
      .logo-wrapper .association-logo {
        transform: scale(1.05);
      }
      
      .arrow-icon {
        transform: translateX(8rpx);
      }
    }
  }
}

// 活动列表 - 优化版
.activity-list {
  padding: 24rpx;
  
  .activity-card-enhanced {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    animation: fadeInUp 0.6s ease both;
    transition: all 0.3s ease;
    
    .activity-images-wrapper {
      position: relative;
      overflow: hidden;
      
      .activity-images {
        display: grid;
        gap: 4rpx;
        padding: 4rpx;
        
        &.images-count-1 {
          grid-template-columns: 1fr;
          
          .image-item {
            .activity-image {
              height: 400rpx;
            }
          }
        }
        
        &.images-count-2 {
          grid-template-columns: repeat(2, 1fr);
          
          .image-item {
            .activity-image {
              height: 300rpx;
            }
          }
        }
        
        &.images-count-3 {
          grid-template-columns: repeat(3, 1fr);
          
          .image-item {
            .activity-image {
              height: 220rpx;
            }
          }
        }
        
        &.images-count-4 {
          grid-template-columns: repeat(2, 1fr);
          
          .image-item {
            .activity-image {
              height: 220rpx;
            }
          }
        }
        
        .image-item {
          position: relative;
          overflow: hidden;
          border-radius: 12rpx;
          
          .activity-image {
            width: 100%;
            transition: all 0.4s ease;
          }
          
          .image-more {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            
            text {
              font-size: 32rpx;
              font-weight: 700;
              color: #fff;
            }
          }
        }
      }
      
      .activity-cover {
        .cover-image {
          width: 100%;
          height: 400rpx;
        }
      }
    }
    
    .activity-info {
      padding: 28rpx;
      
      .activity-title {
        font-size: 32rpx;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1.5;
        margin-bottom: 20rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .activity-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .meta-left {
          display: flex;
          align-items: center;
          gap: 24rpx;
          flex: 1;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8rpx;
            
            .meta-text {
              font-size: 24rpx;
              color: #999;
            }
          }
        }
        
        .like-badge {
          display: flex;
          align-items: center;
          gap: 8rpx;
          padding: 8rpx 16rpx;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
          border-radius: 20rpx;
          
          .like-count {
            font-size: 24rpx;
            font-weight: 600;
            color: #ff6b6b;
          }
        }
      }
    }
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
      
      .activity-image {
        transform: scale(1.05);
      }
    }
  }
}

// 动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

