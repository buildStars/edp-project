<template>
  <view class="page">
    <custom-navbar title="签到记录" :show-back="true" />
    
    <!-- 占位符 -->
    <view class="navbar-placeholder" :style="{ height: navbarTotalHeight + 'px' }"></view>
    
    <!-- 统计卡片 -->
    <view v-if="summary" class="summary-card">
      <view class="summary-header">
        <Icon name="calendar" :size="48" color="#C8161D" />
        <text class="summary-title">我的签到统计</text>
      </view>
      
      <view class="summary-grid">
        <view class="stat-item">
          <view class="stat-value">{{ summary.totalCheckins }}</view>
          <view class="stat-label">总签到</view>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <view class="stat-value success">{{ summary.onTimeCheckins }}</view>
          <view class="stat-label">准时</view>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <view class="stat-value warning">{{ summary.lateCheckins }}</view>
          <view class="stat-label">迟到</view>
        </view>
      </view>
    </view>
    
    <!-- 签到记录列表 -->
    <view class="records-section">
      <view 
        v-for="record in records" 
        :key="record.id"
        class="record-card"
      >
        <!-- 课程信息 -->
        <view class="record-header">
          <view class="course-info">
            <image 
              v-if="record.course.coverImage"
              :src="record.course.coverImage" 
              class="course-cover"
              mode="aspectFill"
            />
            <view v-else class="course-cover-placeholder">
              <Icon name="course" :size="48" color="#C8161D" />
            </view>
            <view class="course-detail">
              <view class="course-title">{{ record.course.title }}</view>
              <view v-if="record.chapter" class="chapter-title">
                第{{ record.chapter.sortOrder }}节 · {{ record.chapter.title }}
              </view>
            </view>
          </view>
          
          <!-- 状态标签 -->
          <view class="status-badge" :class="record.isLate ? 'badge-late' : 'badge-ontime'">
            {{ record.isLate ? '迟到' : '准时' }}
          </view>
        </view>
        
        <!-- 签到详情 -->
        <view class="record-body">
          <view class="detail-row">
            <Icon name="time" :size="32" color="#999" />
            <text class="detail-label">签到时间</text>
            <text class="detail-value">{{ formatTime(record.checkinTime, 'YYYY-MM-DD HH:mm:ss') }}</text>
          </view>
          
          <view class="detail-row">
            <Icon name="check" :size="32" color="#999" />
            <text class="detail-label">签到方式</text>
            <text class="detail-value">{{ getMethodText(record.method) }}</text>
          </view>
          
          <view class="detail-row">
            <Icon name="order" :size="32" color="#999" />
            <text class="detail-label">签到码</text>
            <text class="detail-value code">{{ record.code }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <empty-view 
      v-if="!loading && records.length === 0"
      text="暂无签到记录"
      icon="calendar"
    />
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyCheckinRecords } from '@/api/checkin'
import { formatTime } from '@/utils/util'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'

// 导航栏高度
const navbarTotalHeight = ref(88)

// 数据
const loading = ref(false)
const summary = ref(null)
const records = ref([])

// 页面挂载
onMounted(() => {
  // 计算导航栏高度
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navbarTotalHeight.value = statusBarHeight + 44
  
  loadCheckinRecords()
})

// 加载签到记录
const loadCheckinRecords = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const res = await getMyCheckinRecords()
    
    summary.value = res.summary
    records.value = res.records
    
    console.log('✅ 签到记录加载成功:', res)
  } catch (error) {
    console.error('❌ 加载签到记录失败:', error)
    uni.showToast({
      title: error.msg || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 获取签到方式文本
const getMethodText = (method) => {
  const methodMap = {
    CODE: '签到码',
    QRCODE: '二维码',
    MAKEUP: '补签'
  }
  return methodMap[method] || '未知'
}


</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.navbar-placeholder {
  // 高度由动态计算控制
}

// 统计卡片
.summary-card {
  margin: 24rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #C8161D 0%, #E91E63 100%);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(200, 22, 29, 0.3);
  
  .summary-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 32rpx;
    
    .summary-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #fff;
    }
  }
  
  .summary-grid {
    display: flex;
    align-items: center;
    justify-content: space-around;
    
    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-value {
        font-size: 48rpx;
        font-weight: 700;
        color: #fff;
        margin-bottom: 8rpx;
        
        &.success {
          color: #4CAF50;
        }
        
        &.warning {
          color: #FF9800;
        }
      }
      
      .stat-label {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }
    
    .stat-divider {
      width: 2rpx;
      height: 64rpx;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

// 记录列表
.records-section {
  margin: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }
  
  .record-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
    
    .course-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      .course-cover {
        width: 96rpx;
        height: 96rpx;
        border-radius: 12rpx;
        flex-shrink: 0;
      }
      
      .course-cover-placeholder {
        width: 96rpx;
        height: 96rpx;
        border-radius: 12rpx;
        background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .course-detail {
        flex: 1;
        
        .course-title {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 8rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .chapter-title {
          font-size: 26rpx;
          color: #999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    
    .status-badge {
      padding: 8rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 500;
      flex-shrink: 0;
      margin-left: 16rpx;
      
      &.badge-ontime {
        background: #e8f5e9;
        color: #4CAF50;
      }
      
      &.badge-late {
        background: #fff3e0;
        color: #FF9800;
      }
    }
  }
  
  .record-body {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    
    .detail-row {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .detail-label {
        font-size: 28rpx;
        color: #666;
        min-width: 140rpx;
      }
      
      .detail-value {
        font-size: 28rpx;
        color: #333;
        flex: 1;
        
        &.code {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          letter-spacing: 4rpx;
          color: #C8161D;
        }
      }
    }
  }
}

// 加载状态
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  
  .loading-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>

