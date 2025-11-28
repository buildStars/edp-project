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
            <text class="label">距离开课</text>
            <text class="value" :class="{ warning: needsApproval }">
              {{ hoursLeft >= 24 ? Math.floor(hoursLeft / 24) + '天' : Math.floor(hoursLeft) + '小时' }}
            </text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 退课原因 -->
    <view class="form-section">
      <view class="section-title">
        退课原因{{ needsApproval ? '（必填）' : '（可选）' }}
      </view>
      <textarea 
        v-model="reason" 
        :placeholder="needsApproval ? '上课前48小时内退课需审批，请填写退课原因...' : '请填写退课原因，以便我们改进服务...'"
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
      <view v-if="needsApproval" class="tip-item warning">
        <text class="icon">⚠</text>
        <text class="text">距离开课不足48小时，需要管理员审批</text>
      </view>
      <view v-if="needsApproval" class="tip-item">
        <text class="icon">✓</text>
        <text class="text">审批通过后学分将全额退回</text>
      </view>
      <view v-if="!needsApproval" class="tip-item">
        <text class="icon">✓</text>
        <text class="text">距离开课超过48小时，无需审批自动退课</text>
      </view>
      <view v-if="!needsApproval" class="tip-item warning">
        <text class="icon">⚠</text>
        <text class="text">将扣除{{ refundFeePercent }}%手续费</text>
      </view>
      <view class="tip-item">
        <text class="icon">✓</text>
        <text class="text">学分退回后可用于报名其他课程</text>
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

// 计算剩余小时数
const hoursLeft = computed(() => {
  if (!course.value.startTime) return 0
  const now = new Date()
  const start = new Date(course.value.startTime)
  const hoursDiff = (start - now) / (1000 * 60 * 60)
  return Math.max(0, hoursDiff)
})

// 是否需要审批（48小时内需要审批）
const needsApproval = computed(() => {
  return hoursLeft.value < 48
})

// 手续费百分比（48小时外退课）
const refundFeePercent = 5

onLoad(async (options) => {
  courseId.value = options.courseId
  
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCourseDetail(courseId.value)
    course.value = res
    uni.hideLoading()
    
    // 显示退课规则提示
    if (needsApproval.value) {
      uni.showModal({
        title: '退课提示',
        content: `当前距离开课不足48小时，退课需要提交管理员审批。请填写退课原因后提交申请。`,
        showCancel: false,
        confirmText: '我知道了'
      })
    } else {
      uni.showModal({
        title: '退课提示',
        content: `退课将扣除${refundFeePercent}%手续费，无需审批，学分将自动退回。确认要继续吗？`,
        showCancel: true,
        cancelText: '取消',
        confirmText: '继续'
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
  // 如果是48小时内退课，必须填写原因
  if (needsApproval.value && !reason.value.trim()) {
    uni.showToast({
      title: '上课前48小时内退课，请填写退课原因',
      icon: 'none',
      duration: 3000
    })
    return
  }
  
  // 二次确认
  const confirmContent = needsApproval.value
    ? '退课申请将提交管理员审批，审批通过后学分将退回。确认提交吗？'
    : `退课将扣除${refundFeePercent}%手续费，学分将自动退回。确认退课吗？`
  
  uni.showModal({
    title: '确认退课',
    content: confirmContent,
    success: async (res) => {
      if (!res.confirm) return
      
      try {
        submitting.value = true
        
        await createRefundRequest({
          enrollmentId: course.value.enrollmentId,
          reason: reason.value,
          needsApproval: needsApproval.value,
          refundFeePercent: needsApproval.value ? 0 : refundFeePercent
        })
        
        submitting.value = false
        
        const successContent = needsApproval.value
          ? '退课申请已提交，请等待管理员审批。审批结果将通过消息通知您。'
          : `退课成功！已扣除${refundFeePercent}%手续费，学分已自动退回。`
        
        uni.showModal({
          title: '提交成功',
          content: successContent,
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
  })
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



