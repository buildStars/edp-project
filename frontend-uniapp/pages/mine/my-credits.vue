<template>
  <view class="page">
    <!-- 学分概览 -->
    <view class="credit-overview">
      <view class="overview-item">
        <view class="overview-value highlight">{{ credits.balance || 0 }}</view>
        <view class="overview-label">剩余学分</view>
      </view>
      <view class="overview-item">
        <view class="overview-value">{{ credits.total || 0 }}</view>
        <view class="overview-label">累计获得</view>
      </view>
      <view class="overview-item">
        <view class="overview-value">{{ credits.used || 0 }}</view>
        <view class="overview-label">已使用</view>
      </view>
    </view>
    
    <!-- 温馨提示 -->
    <view class="expire-section">
      <text class="expire-text">💡 有效期至：{{ formatExpireDate() }}</text>
    </view>
    
    <!-- 使用记录 -->
    <view class="record-section">
      <view class="section-title">使用记录</view>
      
      <view class="record-list">
        <view 
          v-for="item in recordList" 
          :key="item.id"
          class="record-item"
        >
          <view class="record-info">
            <view class="record-title">{{ getRecordTitle(item) }}</view>
            <view class="record-time">{{ formatTime(item.createdAt) }}</view>
          </view>
          <view 
            class="record-credit" 
            :class="{ 'credit-add': item.amount > 0, 'credit-consume': item.amount < 0 }"
          >
            {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}学分
          </view>
        </view>
        
        <!-- 空状态 -->
        <empty-view 
          v-if="recordList.length === 0"
          text="暂无使用记录"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { formatTime } from '@/utils/util'
import EmptyView from '@/components/empty-view/empty-view.vue'

const userStore = useUserStore()

// 学分信息
const credits = ref({})

// 使用记录
const recordList = ref([])

// 页面加载
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = async () => {
  try {
    // 获取学分信息
    const data = await userStore.fetchCredits()
    credits.value = data || {}
    recordList.value = data?.records || []
  } catch (error) {
    console.error('加载数据失败：', error)
  }
}

// 格式化有效期
const formatExpireDate = () => {
  // 新系统学分永久有效
  return '永久有效'
}

// 获取记录标题
const getRecordTitle = (item) => {
  if (item.courseName) {
    return item.courseName
  }
  
  // 根据类型显示不同标题
  const typeMap = {
    'ADMIN_ADD': item.remark || '管理员充值',
    'ADMIN_DEDUCT': item.remark || '管理员扣除',
    'CONSUME': item.remark || '课程报名消耗',
    'EARN': item.remark || '完成课程获得',
    'REFUND': item.remark || '退回学分'
  }
  
  return typeMap[item.type] || item.remark || '学分变动'
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.credit-overview {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 40rpx 0;
  margin-bottom: 24rpx;
  
  .overview-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .overview-value {
      font-size: 48rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 12rpx;
      
      &.highlight {
        color: #C8161D;
      }
    }
    
    .overview-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.expire-section {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF7E6;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .expire-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 12rpx;
  }
  
  .expire-text {
    font-size: 26rpx;
    color: #FF8800;
  }
}

.record-section {
  background-color: #fff;
  padding: 32rpx 24rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 24rpx;
  }
  
  .record-list {
    .record-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .record-info {
        flex: 1;
        
        .record-title {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 12rpx;
        }
        
        .record-time {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .record-credit {
        font-size: 32rpx;
        font-weight: 500;
        
        &.credit-consume {
          color: #C8161D;
        }
        
        &.credit-add {
          color: #52C41A;
        }
      }
    }
  }
}
</style>

