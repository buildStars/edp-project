<template>
  <view class="page">
    <!-- 课程信息 -->
    <view class="course-card">
      <image :src="course.coverImage" class="cover" mode="aspectFill" />
      <view class="course-info">
        <text class="title">{{ course.title }}</text>
        <text class="teacher">讲师：{{ course.teacherName }}</text>
      </view>
    </view>
    
    <!-- 评价表单 -->
    <view class="evaluation-form">
      <view class="form-title">{{ viewMode ? '我的评价' : '课程评价' }}</view>
      
      <!-- 1. 教学态度 -->
      <view class="form-section">
        <view class="section-title">教学态度</view>
        <view class="rating-item">
          <view class="item-desc">老师教学投入、有激情</view>
          <rating-star v-model="form.attitude1" :disabled="viewMode" size="small" />
        </view>
        <view class="rating-item">
          <view class="item-desc">老师教学认真、耐心、诚恳、友好</view>
          <rating-star v-model="form.attitude2" :disabled="viewMode" size="small" />
        </view>
      </view>

      <!-- 2. 教学内容 -->
      <view class="form-section">
        <view class="section-title">教学内容</view>
        <view class="rating-item">
          <view class="item-desc">课程主题明晰，内容清晰，论证严密</view>
          <rating-star v-model="form.content1" :disabled="viewMode" size="small" />
        </view>
        <view class="rating-item">
          <view class="item-desc">课程内容实践性强，案例丰富</view>
          <rating-star v-model="form.content2" :disabled="viewMode" size="small" />
        </view>
      </view>

      <!-- 3. 教学方法 -->
      <view class="form-section">
        <view class="section-title">教学方法</view>
        <view class="rating-item">
          <view class="item-desc">教学方法得当：逻辑性强，条理清晰，重点突出</view>
          <rating-star v-model="form.method1" :disabled="viewMode" size="small" />
        </view>
        <view class="rating-item">
          <view class="item-desc">教学对问题的阐析性强</view>
          <rating-star v-model="form.method2" :disabled="viewMode" size="small" />
        </view>
      </view>

      <!-- 4. 教学效果 -->
      <view class="form-section">
        <view class="section-title">教学效果</view>
        <view class="rating-item">
          <view class="item-desc">达到预期要求，学习有效，对工作或成长提供帮助</view>
          <rating-star v-model="form.effect1" :disabled="viewMode" size="small" />
        </view>
        <view class="rating-item">
          <view class="item-desc">学习了掌握新思想或新技能</view>
          <rating-star v-model="form.effect2" :disabled="viewMode" size="small" />
        </view>
      </view>

      <!-- 5. 教务组织 -->
      <view class="form-section">
        <view class="section-title">教务组织</view>
        <view class="rating-item">
          <view class="item-desc">教学课程资料准备充分</view>
          <rating-star v-model="form.organization" :disabled="viewMode" size="small" />
        </view>
      </view>

      <!-- 6. 文本建议 -->
      <view class="form-section">
        <view class="section-title">您对本次课程的建议</view>
        <textarea 
          v-model="form.suggestion"
          :disabled="viewMode"
          class="suggestion-input"
          placeholder="请输入您的建议和意见（选填）"
          maxlength="500"
          :show-confirm-bar="false"
        />
        <view class="char-count">{{ form.suggestion.length }}/500</view>
      </view>
    </view>
    
    <!-- 提示说明 -->
    <view class="tip-section">
      <view class="tip-title">温馨提示</view>
      <view class="tip-item">
        <text class="icon">⭐</text>
        <text class="text">每项评价满分10分，您的评价将帮助我们改进课程质量</text>
      </view>
      <view class="tip-item highlight">
        <text class="icon">🔒</text>
        <text class="text">您的评价为匿名评价，授课老师无法查看具体评价内容</text>
      </view>
      <view class="tip-item highlight">
        <text class="icon">👥</text>
        <text class="text">管理员/教务人员会对老师进行反馈，帮助改进教学质量</text>
      </view>
      <view class="tip-item">
        <text class="icon">📄</text>
        <text class="text">评价完成后即可下载课件资料</text>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="footer">
      <button v-if="viewMode" class="btn-back" @click="handleCancel">返回</button>
      <template v-else>
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <button class="btn-submit" @click="handleSubmit" :loading="submitting" :disabled="!canSubmit">
          提交评价
        </button>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseDetail } from '@/api/course'
import { createEvaluation, getMyCourseEvaluation } from '@/api/evaluation'
import RatingStar from '@/components/rating-star/rating-star.vue'

const courseId = ref('')
const chapterId = ref('')
const viewMode = ref(false)
const evaluationId = ref('')

const course = ref({
  title: '',
  coverImage: '',
  teacherName: ''
})

const form = ref({
  // 教学态度
  attitude1: 0,
  attitude2: 0,
  // 教学内容
  content1: 0,
  content2: 0,
  // 教学方法
  method1: 0,
  method2: 0,
  // 教学效果
  effect1: 0,
  effect2: 0,
  // 教务组织
  organization: 0,
  // 文本建议
  suggestion: ''
})

const submitting = ref(false)

// 检查是否可以提交（至少有一项评分）
const canSubmit = computed(() => {
  return form.value.attitude1 > 0 || 
         form.value.attitude2 > 0 || 
         form.value.content1 > 0 || 
         form.value.content2 > 0 || 
         form.value.method1 > 0 || 
         form.value.method2 > 0 || 
         form.value.effect1 > 0 || 
         form.value.effect2 > 0 || 
         form.value.organization > 0
})

// 页面加载
onLoad(async (options) => {
  courseId.value = options.courseId
  chapterId.value = options.chapterId || ''
  viewMode.value = options.viewMode === 'true' || options.viewMode === true
  
  console.log('📝 评价页面参数:', { 
    courseId: courseId.value, 
    chapterId: chapterId.value,
    viewMode: viewMode.value
  })
  
  await loadCourseDetail()
  
  if (viewMode.value) {
    await loadMyEvaluation()
  }
})

// 加载课程详情
const loadCourseDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const data = await getCourseDetail(courseId.value)
    course.value = data
  } catch (error) {
    uni.showToast({
      title: error.msg || '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 加载我的评价（查看模式）
const loadMyEvaluation = async () => {
  try {
    uni.showLoading({ title: '加载评价...' })
    
    const chapterIdParam = chapterId.value && chapterId.value.trim() !== '' ? chapterId.value : null
    const data = await getMyCourseEvaluation(courseId.value, chapterIdParam)
    
    if (data) {
      // 填充表单数据
      form.value = {
        attitude1: data.attitude1 || 0,
        attitude2: data.attitude2 || 0,
        content1: data.content1 || 0,
        content2: data.content2 || 0,
        method1: data.method1 || 0,
        method2: data.method2 || 0,
        effect1: data.effect1 || 0,
        effect2: data.effect2 || 0,
        organization: data.organization || 0,
        suggestion: data.suggestion || ''
      }
      evaluationId.value = data.id
    }
  } catch (error) {
    console.error('❌ 加载评价失败:', error)
    uni.showToast({
      title: error.msg || '加载评价失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 提交评价
const handleSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请至少完成一项评价',
      icon: 'none'
    })
    return
  }
  
  try {
    submitting.value = true
    
    // 计算总分（所有项的平均分）
    const scores = [
      form.value.attitude1,
      form.value.attitude2,
      form.value.content1,
      form.value.content2,
      form.value.method1,
      form.value.method2,
      form.value.effect1,
      form.value.effect2,
      form.value.organization
    ].filter(score => score > 0)
    
    const totalScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) 
      : 0
    
    const data = {
      courseId: courseId.value,
      rating: totalScore, // 总评分（1-10分）
      attitude1: form.value.attitude1,
      attitude2: form.value.attitude2,
      content1: form.value.content1,
      content2: form.value.content2,
      method1: form.value.method1,
      method2: form.value.method2,
      effect1: form.value.effect1,
      effect2: form.value.effect2,
      organization: form.value.organization,
      suggestion: form.value.suggestion
    }
    
    if (chapterId.value) {
      data.chapterId = chapterId.value
    }
    
    console.log('📝 提交评价数据:', data)
    await createEvaluation(data)
    
    uni.showToast({
      title: '评价成功',
      icon: 'success',
      duration: 2000
    })
    
    setTimeout(() => {
      uni.navigateBack({
        success: () => {
          uni.$emit('evaluationSubmitted')
        }
      })
    }, 2000)
  } catch (error) {
    uni.showToast({
      title: error.msg || '评价失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F7FA;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

// 课程卡片
.course-card {
  background: #fff;
  padding: 32rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
  
  .cover {
    width: 180rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }
  
  .course-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .teacher {
      font-size: 26rpx;
      color: #666;
    }
  }
}

// 评价表单
.evaluation-form {
  background: #fff;
  margin-top: 24rpx;
  padding: 32rpx;
  
  .form-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 32rpx;
    text-align: center;
  }
  
  .form-section {
    margin-bottom: 40rpx;
    padding-bottom: 32rpx;
    border-bottom: 2rpx solid #F0F0F0;
    
    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    
    .section-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 24rpx;
      padding-left: 16rpx;
      border-left: 6rpx solid #C8161D;
    }
    
    .rating-item {
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .item-desc {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 16rpx;
      }
    }
  }
}

// 文本建议输入框
.suggestion-input {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  background: #F5F7FA;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  border: 2rpx solid #E5E5E5;
  box-sizing: border-box;
  
  &:focus {
    border-color: #C8161D;
    background: #fff;
  }
  
  &:disabled {
    background: #F5F5F5;
    color: #999;
  }
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

// 提示说明
.tip-section {
  background: #FFF7E6;
  margin: 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  border: 2rpx solid #FFE7BA;
  
  .tip-title {
    font-size: 28rpx;
    color: #F59A23;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
  
  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.highlight {
      background: #E6F7FF;
      padding: 16rpx;
      border-radius: 12rpx;
      border: 2rpx solid #91D5FF;
      margin-bottom: 20rpx;
      
      .text {
        color: #0050B3;
        font-weight: 500;
      }
    }
    
    .icon {
      font-size: 28rpx;
      flex-shrink: 0;
    }
    
    .text {
      flex: 1;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

// 底部按钮
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 24rpx;
  z-index: 100;
  
  button {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 600;
    
    &.btn-cancel {
      background: #F5F5F5;
      color: #666;
      border: none;
    }
    
    &.btn-back {
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      color: #fff;
      border: none;
      flex: none;
      width: 100%;
    }
    
    &.btn-submit {
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      color: #fff;
      border: none;
      
      &:disabled {
        background: #E0E0E0;
        color: #999;
      }
    }
  }
}
</style>
