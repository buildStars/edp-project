<template>
  <view class="page">
    <!-- 类型筛选标签 -->
    <view class="tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['tab', { active: currentTab === tab.value }]"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>
    
    <!-- 赠送记录列表 -->
    <view class="list">
      <view 
        v-for="item in list" 
        :key="item.id"
        class="item"
      >
        <image :src="item.course.coverImage" class="cover" mode="aspectFill" />
        <view class="content">
          <text class="course-name">{{ item.course.title }}</text>
          
          <!-- 赠送/接收信息 -->
          <view class="party-info">
            <view v-if="currentTab === 'sent' || !currentTab" class="party-row">
              <text class="label">赠送给：</text>
              <text class="value">{{ item.toUser.realName || item.toUser.nickname }}</text>
            </view>
            <view v-if="currentTab === 'received' || !currentTab" class="party-row">
              <text class="label">来自：</text>
              <text class="value">{{ item.fromUser.realName || item.fromUser.nickname }}</text>
            </view>
          </view>
          
          <view class="info-row">
            <text class="label">消耗学分：</text>
            <text class="value highlight">{{ item.creditCost }}</text>
          </view>
          
          <view class="info-row">
            <text class="label">赠送时间：</text>
            <text class="value">{{ formatTime(item.createdAt) }}</text>
          </view>
          
          <!-- 留言 -->
          <view v-if="item.message" class="message">
            <text class="message-icon">💌</text>
            <text class="message-text">{{ item.message }}</text>
          </view>
          
          <view class="status-tag">
            <text>{{ getStatusText(item.status) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="empty">
        <image src="/static/images/empty.png" class="empty-img" mode="aspectFit" />
        <text class="empty-text">暂无赠送记录</text>
      </view>
    </view>
    
    <!-- 加载提示 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMyCourseGifts } from '@/api/course-gift'
import { formatTime } from '@/utils/util'

const tabs = [
  { label: '全部', value: '' },
  { label: '我赠送的', value: 'sent' },
  { label: '我收到的', value: 'received' }
]

const currentTab = ref('')
const list = ref([])
const loading = ref(false)

onLoad(() => {
  loadList()
})

onShow(() => {
  loadList()
})

// 加载列表
const loadList = async () => {
  try {
    loading.value = true
    const params = {
      page: 1,
      pageSize: 50
    }
    if (currentTab.value) {
      params.type = currentTab.value
    }
    
    const res = await getMyCourseGifts(params)
    list.value = res.list || []
    loading.value = false
  } catch (error) {
    loading.value = false
    uni.showToast({
      title: error.msg || '加载失败',
      icon: 'none'
    })
  }
}

// 切换标签
const switchTab = (value) => {
  currentTab.value = value
  loadList()
}

// 格式化时间
// formatTime 已从 @/utils/util 导入

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    'PENDING': '待接收',
    'ACCEPTED': '已接收',
    'REJECTED': '已拒绝',
    'EXPIRED': '已过期'
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 16rpx 24rpx;
  gap: 16rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  
  .tab {
    flex: 1;
    height: 64rpx;
    line-height: 64rpx;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    background: #f5f7fa;
    border-radius: 32rpx;
    transition: all 0.3s;
    
    &.active {
      background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
      color: #fff;
      font-weight: 600;
    }
  }
}

.list {
  padding: 24rpx;
  
  .item {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    
    .cover {
      width: 100%;
      height: 280rpx;
      display: block;
    }
    
    .content {
      padding: 24rpx;
      
      .course-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 16rpx;
        line-height: 1.4;
      }
      
      .party-info {
        margin-bottom: 8rpx;
        
        .party-row {
          font-size: 26rpx;
          margin-bottom: 8rpx;
          display: flex;
          align-items: center;
          
          .label {
            color: #999;
          }
          
          .value {
            color: #722ED1;
            font-weight: 500;
          }
        }
      }
      
      .info-row {
        font-size: 26rpx;
        margin-bottom: 8rpx;
        display: flex;
        align-items: center;
        
        .label {
          color: #999;
        }
        
        .value {
          color: #666;
          
          &.highlight {
            color: #722ED1;
            font-weight: 600;
          }
        }
      }
      
      .message {
        margin-top: 16rpx;
        padding: 16rpx;
        background: linear-gradient(135deg, #FFF0F6 0%, #FFE6F0 100%);
        border-radius: 12rpx;
        border-left: 6rpx solid #722ED1;
        display: flex;
        align-items: flex-start;
        gap: 12rpx;
        
        .message-icon {
          font-size: 32rpx;
          flex-shrink: 0;
        }
        
        .message-text {
          flex: 1;
          font-size: 26rpx;
          color: #722ED1;
          line-height: 1.6;
        }
      }
      
      .status-tag {
        margin-top: 16rpx;
        display: inline-flex;
        padding: 8rpx 20rpx;
        background: #F9F0FF;
        color: #722ED1;
        border: 2rpx solid #D3ADF7;
        border-radius: 20rpx;
        font-size: 24rpx;
        font-weight: 500;
      }
    }
  }
}

.empty {
  padding: 120rpx 0;
  text-align: center;
  
  .empty-img {
    width: 400rpx;
    height: 300rpx;
    margin-bottom: 40rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    display: block;
  }
}

.loading {
  padding: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>



