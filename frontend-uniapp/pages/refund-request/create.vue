<template>
  <view class="page">
    <!-- 课程信息卡片 -->
    <view class="course-card">
      <image :src="course.coverImage" class="cover" mode="aspectFill" />
      <view class="course-info">
        <text class="title">{{ course.title }}</text>
        <view class="info-grid">
          <view class="info-item">
            <text class="label">开课时间</text>
            <text class="value">{{ formatTime(course.startTime) }}</text>
          </view>
          <view class="info-item">
            <text class="label">退回学分</text>
            <text class="value highlight">{{ course.credit }}</text>
          </view>
          <view class="info-item">
            <text class="label">剩余天数</text>
            <text class="value">{{ daysLeft }}天</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 退课原因 -->
    <view class="form-section">
      <view class="section-title">退课原因（可选）</view>
      <textarea 
        v-model="reason" 
        placeholder="请填写退课原因，以便我们改进服务..."
        placeholder-class="placeholder"
        :maxlength="200"
      />
      <view class="char-count">{{ reason.length }}/200</view>
    </view>
    
    <!-- 退课说明 -->
    <view class="tip-section">
      <view class="tip-title">退课说明</view>
      <view class="tip-item">
        <text class="icon">✓</text>
        <text class="text">退课成功后将退回 {{ course.credit }} 学分</text>
      </view>
      <view class="tip-item">
        <text class="icon">✓</text>
        <text class="text">提交后需等待管理员审批</text>
      </view>
      <view class="tip-item">
        <text class="icon">✓</text>
        <text class="text">审批通过后学分将自动退回</text>
      </view>
      <view class="tip-item warning">
        <text class="icon">!</text>
        <text class="text">开课前3天内不可退课</text>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="footer">
      <button class="btn-submit" @click="submitRefund" :loading="submitting">
        提交退课申请
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createRefundRequest } from '@/api/refund-request'
import { getCourseDetail } from '@/api/course'
import { formatTime } from '@/utils/util'

const courseId = ref('')
const course = ref({
  title: '',
  coverImage: '',
  credit: 0,
  startTime: '',
  enrollmentId: ''
})

const reason = ref('')
const submitting = ref(false)

// 计算剩余天数
const daysLeft = computed(() => {
  if (!course.value.startTime) return 0
  const now = new Date()
  const start = new Date(course.value.startTime)
  const daysDiff = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, daysDiff)
})

onLoad(async (options) => {
  courseId.value = options.courseId
  
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCourseDetail(courseId.value)
    course.value = res
    uni.hideLoading()
    
    // 检查是否可以退课（开课前3天以外才能退课，即必须 > 3天）
    if (daysLeft.value <= 3) {
      uni.showModal({
        title: '不能退课',
        content: `开课前3天内不能退课，当前距离开课还有${daysLeft.value}天`,
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.msg || '加载失败',
      icon: 'none'
    })
  }
})

// 格式化时间
// formatTime 已从 @/utils/util 导入

// 提交退课申请
const submitRefund = async () => {
  // 再次检查是否可以退课（开课前3天以外才能退课，即必须 > 3天）
  if (daysLeft.value <= 3) {
    uni.showToast({
      title: `开课前3天内不能退课，当前距离开课还有${daysLeft.value}天`,
      icon: 'none',
      duration: 3000
    })
    return
  }
  
  try {
    submitting.value = true
    
    await createRefundRequest({
      enrollmentId: course.value.enrollmentId,
      reason: reason.value
    })
    
    submitting.value = false
    
    uni.showModal({
      title: '提交成功',
      content: '退课申请已提交，请等待管理员审批。审批结果将通过消息通知您。',
      showCancel: false,
      success: () => {
        uni.navigateBack({
          delta: 1,
          success: () => {
            uni.$emit('refreshCourseDetail')
          }
        })
      }
    })
  } catch (error) {
    submitting.value = false
    uni.showToast({
      title: error.msg || '提交失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 400rpx);
  padding-bottom: 120rpx;
}

.course-card {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  
  .cover {
    width: 100%;
    height: 300rpx;
    display: block;
  }
  
  .course-info {
    padding: 24rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 24rpx;
      line-height: 1.4;
    }
    
    .info-grid {
      display: flex;
      gap: 16rpx;
      
      .info-item {
        flex: 1;
        padding: 20rpx;
        background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
        border-radius: 12rpx;
        text-align: center;
        
        .label {
          font-size: 24rpx;
          color: #999;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .value {
          font-size: 28rpx;
          font-weight: 600;
          color: #333;
          display: block;
          
          &.highlight {
            color: #C8161D;
            font-size: 32rpx;
          }
        }
      }
    }
  }
}

.form-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
  }
  
  textarea {
    width: 100%;
    height: 240rpx;
    padding: 20rpx;
    background: #f5f7fa;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
    &:focus {
      background: #fff;
      border-color: #C8161D;
    }
  }
  
  .placeholder {
    color: #ccc;
  }
  
  .char-count {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
  }
}

.tip-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  
  .tip-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
  }
  
  .tip-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .icon {
      width: 40rpx;
      height: 40rpx;
      line-height: 40rpx;
      text-align: center;
      background: #52C41A;
      color: #fff;
      border-radius: 50%;
      font-size: 24rpx;
      font-weight: 600;
      flex-shrink: 0;
      margin-right: 16rpx;
    }
    
    .text {
      flex: 1;
      font-size: 26rpx;
      color: #666;
      line-height: 40rpx;
    }
    
    &.warning {
      .icon {
        background: #FA8C16;
      }
      
      .text {
        color: #FA8C16;
      }
    }
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  
  .btn-submit {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #FA8C16 0%, #FFA940 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 6rpx 20rpx rgba(250, 140, 22, 0.4);
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}
</style>



