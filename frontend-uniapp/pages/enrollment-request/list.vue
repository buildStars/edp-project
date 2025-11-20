<template>
  <view class="page">
    <!-- 状态筛选标签 -->
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
    
    <!-- 申请列表 -->
    <view class="list">
      <view 
        v-for="item in list" 
        :key="item.id"
        class="item"
      >
        <image :src="item.course.coverImage" class="cover" mode="aspectFill" />
        <view class="content">
          <text class="course-name">{{ item.course.title }}</text>
          <view class="info-row">
            <text class="label">需要学分：</text>
            <text class="value">{{ item.course.credit }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间：</text>
            <text class="value">{{ formatTime(item.createdAt) }}</text>
          </view>
          
          <view class="status-row">
            <text :class="['status-tag', getStatusClass(item.status)]">
              {{ getStatusText(item.status) }}
            </text>
            <text v-if="item.reviewedAt" class="review-time">
              {{ formatTime(item.reviewedAt) }}
            </text>
          </view>
          
          <!-- 审批备注 -->
          <view v-if="item.reviewNote" class="note">
            <text class="note-label">备注：</text>
            <text class="note-text">{{ item.reviewNote }}</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view v-if="item.status === 'PENDING'" class="actions">
          <button class="btn-cancel" @click="cancelRequest(item.id)">取消</button>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="empty">
        <image src="/static/images/empty.png" class="empty-img" mode="aspectFit" />
        <text class="empty-text">暂无申请记录</text>
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
import { getMyEnrollmentRequests, cancelEnrollmentRequest } from '@/api/enrollment-request'
import { formatTime } from '@/utils/util'

const tabs = [
  { label: '全部', value: '' },
  { label: '待审批', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' }
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
      params.status = currentTab.value
    }
    
    const res = await getMyEnrollmentRequests(params)
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
    'PENDING': '待审批',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝'
  }
  return map[status] || status
}

// 获取状态样式类
const getStatusClass = (status) => {
  const map = {
    'PENDING': 'pending',
    'APPROVED': 'approved',
    'REJECTED': 'rejected'
  }
  return map[status] || ''
}

// 取消申请
const cancelRequest = (id) => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这个申请吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '取消中...' })
          await cancelEnrollmentRequest(id)
          uni.hideLoading()
          uni.showToast({
            title: '已取消',
            icon: 'success'
          })
          loadList()
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: error.msg || '取消失败',
            icon: 'none'
          })
        }
      }
    }
  })
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
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
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
        }
      }
      
      .status-row {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-top: 16rpx;
        
        .status-tag {
          padding: 8rpx 20rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          font-weight: 500;
          
          &.pending {
            background: #FFF7E6;
            color: #FA8C16;
            border: 2rpx solid #FFD591;
          }
          
          &.approved {
            background: #F6FFED;
            color: #52C41A;
            border: 2rpx solid #B7EB8F;
          }
          
          &.rejected {
            background: #FFF1F0;
            color: #FF4D4F;
            border: 2rpx solid #FFCCC7;
          }
        }
        
        .review-time {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .note {
        margin-top: 16rpx;
        padding: 16rpx;
        background: #F5F7FA;
        border-radius: 12rpx;
        border-left: 6rpx solid #C8161D;
        
        .note-label {
          font-size: 24rpx;
          color: #666;
        }
        
        .note-text {
          font-size: 26rpx;
          color: #333;
          line-height: 1.6;
        }
      }
    }
    
    .actions {
      padding: 0 24rpx 24rpx;
      
      .btn-cancel {
        width: 100%;
        height: 72rpx;
        line-height: 72rpx;
        text-align: center;
        font-size: 28rpx;
        color: #FA8C16;
        background: #FFF7E6;
        border: 2rpx solid #FFD591;
        border-radius: 36rpx;
        
        &:active {
          opacity: 0.8;
        }
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



