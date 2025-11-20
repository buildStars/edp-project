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
      
      <!-- 总体评分（必填） -->
      <view class="form-item">
        <view class="item-header">
          <text class="item-label">总体评价</text>
          <text v-if="!viewMode" class="item-required">*</text>
        </view>
        <rating-star v-model="form.rating" @change="handleRatingChange" :disabled="viewMode" />
        <text class="rating-text">{{ getRatingText(form.rating) }}</text>
      </view>
      
      <!-- 内容质量（可选） -->
      <view class="form-item">
        <view class="item-header">
          <text class="item-label">内容质量</text>
          <text v-if="!viewMode" class="item-optional">选填</text>
        </view>
        <rating-star v-model="form.contentRating" :disabled="viewMode" />
      </view>
      
      <!-- 讲师水平（可选） -->
      <view class="form-item">
        <view class="item-header">
          <text class="item-label">讲师水平</text>
          <text v-if="!viewMode" class="item-optional">选填</text>
        </view>
        <rating-star v-model="form.teacherRating" :disabled="viewMode" />
      </view>
      
      <!-- 组织服务（可选） -->
      <view class="form-item">
        <view class="item-header">
          <text class="item-label">组织服务</text>
          <text v-if="!viewMode" class="item-optional">选填</text>
        </view>
        <rating-star v-model="form.organizationRating" :disabled="viewMode" />
      </view>
    </view>
    
    <!-- 提示说明 -->
    <view class="tip-section">
      <view class="tip-title">温馨提示</view>
      <view class="tip-item">
        <text class="icon">⭐</text>
        <text class="text">您的评价将帮助我们改进课程质量</text>
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
const chapterId = ref('') // 章节ID（可选）
const viewMode = ref(false) // 查看模式（true=查看已有评价，false=创建新评价）
const evaluationId = ref('') // 评价ID（查看模式时使用）

const course = ref({
  title: '',
  coverImage: '',
  teacherName: ''
})

const form = ref({
  rating: 0,
  contentRating: 0,
  teacherRating: 0,
  organizationRating: 0
})

const submitting = ref(false)

const canSubmit = computed(() => {
  return form.value.rating > 0
})

// 页面加载
onLoad(async (options) => {
  courseId.value = options.courseId
  chapterId.value = options.chapterId || '' // 获取章节ID（如果有）
  viewMode.value = options.viewMode === 'true' || options.viewMode === true // 查看模式
  
  console.log('📝 评价页面参数:', { 
    courseId: courseId.value, 
    chapterId: chapterId.value,
    viewMode: viewMode.value
  })
  
  await loadCourseDetail()
  
  // 如果是查看模式，加载已有的评价
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
    
    // 传递章节ID（如果有）
    const chapterIdParam = chapterId.value && chapterId.value.trim() !== '' ? chapterId.value : null
    console.log('🔍 查询评价 - courseId:', courseId.value, ', chapterId:', chapterIdParam)
    
    const data = await getMyCourseEvaluation(courseId.value, chapterIdParam)
    
    console.log('📖 加载的评价数据:', data)
    
    if (data) {
      // 填充表单数据
      form.value.rating = data.rating || 0
      form.value.contentRating = data.contentRating || 0
      form.value.teacherRating = data.teacherRating || 0
      form.value.organizationRating = data.organizationRating || 0
      evaluationId.value = data.id
    } else {
      console.warn('⚠️ 未找到评价数据')
      uni.showToast({
        title: '未找到评价记录',
        icon: 'none'
      })
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

// 评分改变
const handleRatingChange = (value) => {
  // 可以添加震动反馈
  if (value > 0) {
    uni.vibrateShort()
  }
}

// 获取评分文字
const getRatingText = (rating) => {
  const texts = {
    5: '非常满意',
    4: '比较满意',
    3: '一般',
    2: '不太满意',
    1: '很不满意',
    0: '请点击星星评分'
  }
  return texts[rating] || ''
}

// 提交评价
const handleSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请先进行总体评价',
      icon: 'none'
    })
    return
  }
  
  try {
    submitting.value = true
    
    const data = {
      courseId: courseId.value,
      rating: form.value.rating
    }
    
    // 如果是章节评价，添加章节ID
    if (chapterId.value) {
      data.chapterId = chapterId.value
      console.log('📝 提交章节评价，chapterId:', chapterId.value)
    } else {
      console.log('📝 提交课程评价')
    }
    
    // 添加可选评分
    if (form.value.contentRating > 0) {
      data.contentRating = form.value.contentRating
    }
    if (form.value.teacherRating > 0) {
      data.teacherRating = form.value.teacherRating
    }
    if (form.value.organizationRating > 0) {
      data.organizationRating = form.value.organizationRating
    }
    
    console.log('📝 提交评价数据:', data)
    await createEvaluation(data)
    
    uni.showToast({
      title: '评价成功',
      icon: 'success',
      duration: 2000
    })
    
    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      // 返回课程详情页并刷新
      uni.navigateBack({
        success: () => {
          // 通知课程详情页刷新
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
  padding-bottom: env(safe-area-inset-bottom);
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
  }
  
  .form-item {
    margin-bottom: 48rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .item-header {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 24rpx;
      
      .item-label {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
      
      .item-required {
        color: #FF4D4F;
        font-size: 28rpx;
      }
      
      .item-optional {
        font-size: 24rpx;
        color: #999;
        background: #F5F5F5;
        padding: 2rpx 12rpx;
        border-radius: 8rpx;
      }
    }
    
    .rating-text {
      display: block;
      margin-top: 16rpx;
      font-size: 26rpx;
      color: #FFB400;
      font-weight: 500;
    }
  }
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
      background: linear-gradient(135deg, #FFB400 0%, #FF9800 100%);
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


