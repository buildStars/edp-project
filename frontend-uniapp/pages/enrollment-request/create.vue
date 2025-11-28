<template>
  <view class="page">
    <!-- 课程信息卡片 -->
    <view class="course-card">
      <image :src="course.coverImage" class="cover" mode="aspectFill" />
      <view class="course-info">
        <text class="title">{{ course.title }}</text>
        <view class="course-meta">
          <view class="meta-item">
            <text class="meta-label">授课老师</text>
            <text class="meta-value">{{ course.teacherName }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">需要学分</text>
            <text class="meta-value highlight">{{ course.credit }}学分</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 申请表单 -->
    <view class="form-section">
      <view class="section-title">试听申请</view>
      
      <view class="form-item required">
        <text class="label">真实姓名</text>
        <input 
          v-model="form.realName" 
          placeholder="请输入真实姓名"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item required">
        <text class="label">手机号</text>
        <input 
          v-model="form.phone" 
          type="number"
          placeholder="请输入手机号"
          placeholder-class="placeholder"
          maxlength="11"
        />
      </view>
      
      <view class="form-item">
        <text class="label">公司</text>
        <input 
          v-model="form.company" 
          placeholder="请输入公司名称（可选）"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">职位</text>
        <input 
          v-model="form.position" 
          placeholder="请输入职位（可选）"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">备注</text>
        <textarea 
          v-model="form.remark" 
          placeholder="其他说明（可选）"
          placeholder-class="placeholder"
          maxlength="200"
        />
      </view>
    </view>
    
    <!-- 提示信息 -->
    <view class="tip-section">
      <view class="tip-icon">ℹ️</view>
      <view class="tip-content">
        <text class="tip-title">温馨提示</text>
        <text class="tip-text">• 提交后，课程顾问将在1个工作日内联系您</text>
        <text class="tip-text">• 试听名额有限，请提前预约</text>
        <text class="tip-text">• 课程顾问电话：40077-20111</text>
      </view>
    </view>
    
    <!-- 退课规则说明 -->
    <view class="refund-rule-section">
      <view class="rule-icon">⚠️</view>
      <view class="rule-content">
        <text class="rule-title">退课规则</text>
        <text class="rule-text">• 上课前48小时以外退课：扣除5%手续费，无需审批</text>
        <text class="rule-text highlight">• 上课前48小时内退课：需填写退课原因并提交管理员审批</text>
        <text class="rule-text">• 请合理安排学习计划，避免临时退课</text>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="footer">
      <button class="btn-submit" @click="submitRequest" :loading="submitting">
        提交申请
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createEnrollmentRequest } from '@/api/enrollment-request'
import { getCourseDetail } from '@/api/course'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const courseId = ref('')
const course = ref({
  title: '',
  coverImage: '',
  credit: 0
})

const form = ref({
  realName: '',
  phone: '',
  company: '',
  position: '',
  remark: ''
})

const submitting = ref(false)

onLoad(async (options) => {
  courseId.value = options.courseId
  
  // 加载课程信息
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCourseDetail(courseId.value)
    course.value = res
    
    // 预填用户信息
    const userInfo = userStore.userInfo || {}
    form.value.realName = userInfo.realName || ''
    form.value.phone = userInfo.phone || ''
    form.value.company = userInfo.company || ''
    form.value.position = userInfo.position || ''
    
    // 刷新学分信息
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

// 提交申请
const submitRequest = async () => {
  // 表单验证
  if (!form.value.realName) {
    uni.showToast({
      title: '请输入真实姓名',
      icon: 'none'
    })
    return
  }
  
  if (!form.value.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  try {
    submitting.value = true
    
    await createEnrollmentRequest({
      courseId: courseId.value,
      ...form.value
    })
    
    submitting.value = false
    
    uni.showModal({
      title: '提交成功',
      content: '您的试听申请已提交，课程顾问将尽快与您联系安排试听。',
      showCancel: false,
      success: () => {
        // 返回上一页并刷新
        uni.navigateBack({
          delta: 1,
          success: () => {
            // 触发上一页刷新
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
    
    .course-meta {
      display: flex;
      gap: 32rpx;
      align-items: center;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 12rpx;
        
        .meta-label {
          font-size: 24rpx;
          color: #999;
        }
        
        .meta-value {
          font-size: 26rpx;
          color: #666;
          font-weight: 500;
          
          &.highlight {
            color: #C8161D;
            font-size: 28rpx;
            font-weight: 600;
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
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 32rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #C8161D;
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
        border-color: #C8161D;
      }
    }
    
    textarea {
      height: 160rpx;
      line-height: 1.6;
    }
    
    .placeholder {
      color: #ccc;
    }
  }
}

.tip-section {
  margin: 24rpx;
  padding: 24rpx;
  background: #E6F7FF;
  border-radius: 16rpx;
  border: 2rpx solid #91D5FF;
  display: flex;
  gap: 16rpx;
  
  .tip-icon {
    font-size: 40rpx;
    flex-shrink: 0;
  }
  
  .tip-content {
    flex: 1;
    
    .tip-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #0050B3;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .tip-text {
      font-size: 24rpx;
      color: #096DD9;
      display: block;
      line-height: 1.6;
      margin-bottom: 6rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.refund-rule-section {
  margin: 24rpx;
  padding: 24rpx;
  background: #FFF7E6;
  border-radius: 16rpx;
  border: 2rpx solid #FFD591;
  display: flex;
  gap: 16rpx;
  
  .rule-icon {
    font-size: 40rpx;
    flex-shrink: 0;
  }
  
  .rule-content {
    flex: 1;
    
    .rule-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #D46B08;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .rule-text {
      font-size: 24rpx;
      color: #D48806;
      display: block;
      line-height: 1.8;
      margin-bottom: 8rpx;
      
      &.highlight {
        color: #D4380D;
        font-weight: 600;
      }
      
      &:last-child {
        margin-bottom: 0;
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
    background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 6rpx 20rpx rgba(200, 22, 29, 0.4);
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}
</style>



