<template>
  <view class="page">
    <!-- 课程信息卡片 -->
    <view class="course-card">
      <image :src="course.coverImage" class="cover" mode="aspectFill" />
      <view class="course-info">
        <text class="title">{{ course.title }}</text>
        <view class="credit-badge">
          <text class="label">消耗学分</text>
          <text class="value">{{ course.credit }}</text>
        </view>
      </view>
    </view>
    
    <!-- 赠送表单 -->
    <view class="form-section">
      <view class="section-title">赠送信息</view>
      
      <view class="form-item required">
        <text class="label">接收方</text>
        <input 
          v-model="toUser" 
          placeholder="请输入对方的手机号或用户ID"
          placeholder-class="placeholder"
        />
        <text class="tip">可输入手机号或用户ID</text>
      </view>
      
      <view class="form-item">
        <text class="label">赠送留言</text>
        <textarea 
          v-model="message" 
          placeholder="给对方留言（可选）"
          placeholder-class="placeholder"
          :maxlength="100"
        />
        <view class="char-count">{{ message.length }}/100</view>
      </view>
    </view>
    
    <!-- 学分提示 -->
    <view class="balance-section">
      <view class="balance-item current">
        <text class="label">当前学分</text>
        <text class="value">{{ userStore.remainingCredits }}</text>
      </view>
      <view class="balance-arrow">→</view>
      <view class="balance-item after">
        <text class="label">赠送后剩余</text>
        <text :class="['value', { insufficient: afterBalance < 0 }]">
          {{ afterBalance }}
        </text>
      </view>
    </view>
    
    <!-- 赠送说明 -->
    <view class="tip-section">
      <view class="tip-title">赠送说明</view>
      <view class="tip-item">
        <text class="icon">✓</text>
        <text class="text">赠送后立即生效，对方将自动报名该课程</text>
      </view>
      <view class="tip-item">
        <text class="icon">✓</text>
        <text class="text">赠送记录可在"个人中心-赠送记录"中查看</text>
      </view>
      <view class="tip-item">
        <text class="icon">✓</text>
        <text class="text">老师可查看赠送记录，了解课程来源</text>
      </view>
      <view class="tip-item warning">
        <text class="icon">!</text>
        <text class="text">赠送的课程对方不能退课</text>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="footer">
      <button 
        class="btn-submit" 
        @click="submitGift"
        :disabled="!canGift"
        :loading="submitting"
      >
        确认赠送
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { giftCourse } from '@/api/course-gift'
import { getCourseDetail } from '@/api/course'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const courseId = ref('')
const course = ref({
  title: '',
  coverImage: '',
  credit: 0
})

const toUser = ref('')
const message = ref('')
const submitting = ref(false)

// 计算赠送后剩余学分
const afterBalance = computed(() => {
  return userStore.remainingCredits - (course.value.credit || 0)
})

// 是否可以赠送
const canGift = computed(() => {
  return toUser.value && afterBalance.value >= 0
})

onLoad(async (options) => {
  courseId.value = options.courseId
  
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCourseDetail(courseId.value)
    course.value = res
    await userStore.fetchCredits()
    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.msg || '加载失败',
      icon: 'none'
    })
  }
})

// 提交赠送
const submitGift = async () => {
  // 验证
  if (!toUser.value) {
    uni.showToast({
      title: '请输入接收方',
      icon: 'none'
    })
    return
  }
  
  if (afterBalance.value < 0) {
    uni.showToast({
      title: '学分不足',
      icon: 'none'
    })
    return
  }
  
  uni.showModal({
    title: '确认赠送',
    content: `将消耗 ${course.value.credit} 学分赠送课程《${course.value.title}》给对方，确认吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          submitting.value = true
          
          await giftCourse({
            courseId: courseId.value,
            toUser: toUser.value,
            message: message.value
          })
          
          submitting.value = false
          
          uni.showModal({
            title: '赠送成功',
            content: '课程已成功赠送给对方，对方将收到通知。',
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
            title: error.msg || '赠送失败',
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
      margin-bottom: 20rpx;
      line-height: 1.4;
    }
    
    .credit-badge {
      display: inline-flex;
      align-items: center;
      gap: 12rpx;
      padding: 12rpx 24rpx;
      background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
      border-radius: 24rpx;
      
      .label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .value {
        font-size: 32rpx;
        font-weight: 600;
        color: #fff;
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
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 32rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #722ED1;
  }
  
  .form-item {
    margin-bottom: 32rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.required .label::after {
      content: ' *';
      color: #C8161D;
    }
    
    .label {
      font-size: 28rpx;
      color: #666;
      display: block;
      margin-bottom: 16rpx;
    }
    
    input, textarea {
      width: 100%;
      padding: 20rpx 24rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: #333;
      border: 2rpx solid transparent;
      transition: all 0.3s;
      
      &:focus {
        background: #fff;
        border-color: #722ED1;
      }
    }
    
    textarea {
      height: 160rpx;
      line-height: 1.6;
    }
    
    .placeholder {
      color: #ccc;
    }
    
    .tip {
      font-size: 24rpx;
      color: #999;
      margin-top: 12rpx;
      display: block;
    }
    
    .char-count {
      text-align: right;
      font-size: 24rpx;
      color: #999;
      margin-top: 12rpx;
    }
  }
}

.balance-section {
  margin: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  
  .balance-item {
    flex: 1;
    padding: 32rpx 24rpx;
    background: #fff;
    border-radius: 16rpx;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    
    &.current {
      background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
      
      .label, .value {
        color: #fff;
      }
    }
    
    &.after {
      background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
      
      .label, .value {
        color: #fff;
      }
    }
    
    .label {
      font-size: 24rpx;
      display: block;
      margin-bottom: 12rpx;
      opacity: 0.9;
    }
    
    .value {
      font-size: 48rpx;
      font-weight: 600;
      display: block;
      
      &.insufficient {
        color: #FF4D4F !important;
      }
    }
  }
  
  .balance-arrow {
    font-size: 48rpx;
    color: #999;
    flex-shrink: 0;
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
      background: #722ED1;
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
    background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 6rpx 20rpx rgba(114, 46, 209, 0.4);
    
    &[disabled] {
      background: #d9d9d9;
      color: #999;
      box-shadow: none;
    }
    
    &:active:not([disabled]) {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}
</style>



