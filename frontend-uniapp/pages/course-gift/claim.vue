<template>
  <view class="page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <uni-icons type="spinner-cycle" size="60" color="#2979ff" class="loading-icon"></uni-icons>
      <text class="loading-text">正在加载...</text>
    </view>

    <!-- 课程信息 -->
    <view v-else-if="courseInfo" class="content">
      <view class="gift-card">
        <!-- 课程封面 -->
        <image :src="courseInfo.coverImage" class="course-cover" mode="aspectFill" />
        
        <!-- 礼物图标 -->
        <view class="gift-icon">
          <uni-icons type="gift" size="80" color="#ff6b6b"></uni-icons>
        </view>

        <!-- 课程标题 -->
        <view class="course-title">{{ courseInfo.title }}</view>

        <!-- 学分信息 -->
        <view class="credit-info">
          <text class="credit-label">课程价值</text>
          <text class="credit-value">{{ courseInfo.credit }} 学分</text>
        </view>

        <!-- 赠送信息 -->
        <view class="gift-message">
          好友向你赠送了这门课程
        </view>

        <!-- 领取按钮 -->
        <button 
          v-if="!claimed" 
          class="claim-btn" 
          @click="handleClaim"
          :disabled="claiming"
        >
          <text v-if="!claiming">{{ isLoggedIn ? '立即领取' : '登录后领取' }}</text>
          <text v-else>领取中...</text>
        </button>

        <!-- 已领取提示 -->
        <view v-else class="claimed-tip">
          <uni-icons type="checkmarkempty" size="30" color="#4caf50"></uni-icons>
          <text>已领取</text>
        </view>
      </view>

      <!-- 课程详情按钮 -->
      <button class="detail-btn" @click="goToDetail">
        查看课程详情
      </button>
    </view>

    <!-- 错误提示 -->
    <view v-else class="error-container">
      <uni-icons type="closeempty" size="80" color="#999"></uni-icons>
      <text class="error-text">{{ errorMessage }}</text>
      <button class="back-btn" @click="goToHome">
        返回首页
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { claimCourseByCode } from '@/api/course-gift'
import { getCourseDetail } from '@/api/course'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 计算是否已登录
const isLoggedIn = computed(() => !!userStore.token)

// 页面数据
const loading = ref(true)
const claiming = ref(false)
const claimed = ref(false)
const giftCode = ref('')
const courseInfo = ref(null)
const errorMessage = ref('')

// 页面加载
onLoad(async (options) => {
  const code = options.code
  
  if (!code) {
    errorMessage.value = '礼物码无效'
    loading.value = false
    return
  }

  giftCode.value = code

  // 如果未登录，先跳转登录
  if (!isLoggedIn.value) {
    // 保存当前页面路径，登录后返回
    const currentPage = `/pages/course-gift/claim?code=${code}`
    uni.setStorageSync('redirectAfterLogin', currentPage)
    
    uni.showModal({
      title: '提示',
      content: '请先登录后领取课程',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          uni.reLaunch({
            url: '/pages/login/index'
          })
        } else {
          // 用户取消，返回首页
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }
      }
    })
    loading.value = false
    return
  }

  // 已登录，尝试获取礼物信息（通过领取接口）
  await tryClaimGift()
})

// 尝试领取礼物
const tryClaimGift = async () => {
  try {
    loading.value = true
    
    const res = await claimCourseByCode({ giftCode: giftCode.value })
    
    // 领取成功
    if (res.course) {
      courseInfo.value = res.course
      claimed.value = true
      
      uni.showToast({
        title: '领取成功！',
        icon: 'success'
      })
    }
  } catch (error) {
    // 如果是"已报名"错误，获取课程信息但标记为已领取
    if (error.msg && error.msg.includes('已报名')) {
      errorMessage.value = '您已经拥有这门课程了'
      claimed.value = true
      
      // 尝试通过礼物码解析课程ID（后端需要支持，或者我们从错误信息中提取）
      // 这里简化处理，直接显示错误
    } else {
      errorMessage.value = error.msg || '礼物码无效或已被领取'
    }
  } finally {
    loading.value = false
  }
}

// 处理领取
const handleClaim = async () => {
  if (!isLoggedIn.value) {
    // 跳转登录
    const currentPage = `/pages/course-gift/claim?code=${giftCode.value}`
    uni.setStorageSync('redirectAfterLogin', currentPage)
    
    uni.reLaunch({
      url: '/pages/login/index'
    })
    return
  }

  await tryClaimGift()
}

// 查看课程详情
const goToDetail = () => {
  if (courseInfo.value) {
    uni.redirectTo({
      url: `/pages/course/detail?id=${courseInfo.value.id}`
    })
  }
}

// 返回首页
const goToHome = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .loading-icon {
    animation: rotate 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #fff;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.content {
  width: 100%;
}

.gift-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.course-cover {
  width: 500rpx;
  height: 300rpx;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
}

.gift-icon {
  margin-bottom: 20rpx;
}

.course-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
  line-height: 1.5;
}

.credit-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50rpx;
  
  .credit-label {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .credit-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
  }
}

.gift-message {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.6;
}

.claim-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  
  &:active {
    opacity: 0.8;
  }
  
  &[disabled] {
    opacity: 0.6;
  }
}

.claimed-tip {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 40rpx;
  background: #f1f8f4;
  border-radius: 50rpx;
  
  text {
    font-size: 28rpx;
    color: #4caf50;
    font-weight: bold;
  }
}

.detail-btn {
  width: 100%;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 28rpx;
  border-radius: 44rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  margin-top: 30rpx;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  background: #fff;
  border-radius: 32rpx;
  
  .error-text {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin: 30rpx 0;
    line-height: 1.6;
  }
  
  .back-btn {
    width: 300rpx;
    height: 72rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 28rpx;
    border-radius: 36rpx;
    border: none;
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style>


