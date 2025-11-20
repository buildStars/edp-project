<template>
  <view class="course-card" @click="handleClick">
    <view class="course-image">
      <image :src="course.coverImage" mode="aspectFill" />
      <view class="course-credit">{{ course.credit }}学分</view>
    </view>
  
    <view class="course-info">
      <view class="course-title">{{ course.title }}</view>
      <view class="course-teacher">
        <image v-if="course.teacherAvatar" :src="course.teacherAvatar" class="teacher-avatar" />
        <text>{{ course.teacherName }}</text>
      </view>
      <view class="course-time">{{ formatCourseTime(course.startTime) }}</view>
      <view class="course-footer">
        <view class="course-location">{{ course.location }}</view>
        <view class="course-actions">
          <!-- 查看章节按钮 (仅已报名课程显示) -->
          <view 
            v-if="showChapterButton && course.isEnrolled"
            class="course-btn btn-chapter" 
            @click.stop="handleViewChapters"
          >
            查看章节
          </view>
          <!-- 退课按钮或退课中状态 -->
          <view 
            v-if="showRefundButton && course.refundStatus === 'PENDING'"
            class="course-btn btn-refunding"
          >
            退课审核中
          </view>
          <view 
            v-else-if="showRefundButton"
            class="course-btn btn-refund" 
            @click.stop="handleRefund"
          >
            申请退课
          </view>
          <!-- 报名按钮 -->
          <view 
            v-else-if="!showChapterButton || !course.isEnrolled"
            class="course-btn" 
            :class="{ 
              'btn-ongoing': course.isEnrolled && course.enrollmentStatus === 'ENROLLED',
              'btn-completed': course.isEnrolled && course.enrollmentStatus === 'COMPLETED',
              'btn-refunding': course.refundStatus === 'PENDING',
              'btn-closed': course.enrollStatus === 'CLOSED',
              'disabled': isButtonDisabled()
            }"
            @click.stop="handleEnroll"
          >
            {{ getBtnText() }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { formatTime } from '@/utils/util'

// Props
const props = defineProps({
  course: {
    type: Object,
    required: true,
    default: () => ({})
  },
  showRefundButton: {
    type: Boolean,
    default: false
  },
  showChapterButton: {
    type: Boolean,
    default: false
  }
})

// 格式化课程时间
const formatCourseTime = (time) => {
  return formatTime(time, 'MM月DD日 HH:mm')
}

// 获取按钮文本
const getBtnText = () => {
  const { enrollStatus, isEnrolled, refundStatus, enrollmentStatus } = props.course
  
  // 如果已报名，根据 enrollmentStatus 显示不同状态
  if (isEnrolled) {
    if (refundStatus === 'PENDING') return '退课中'
    if (enrollmentStatus === 'COMPLETED') return '已完成'
    return '进行中'  // ENROLLED 状态显示为"进行中"
  }
  
  // 未报名的课程
  if (enrollStatus === 'CLOSED') return '已截止'
  return '报名'
}

// 判断按钮是否禁用
const isButtonDisabled = () => {
  const { enrollStatus, isEnrolled, refundStatus } = props.course
  // 已截止、已报名、退课中的按钮都应该禁用
  return enrollStatus === 'CLOSED' || isEnrolled || refundStatus === 'PENDING'
}

// 点击卡片
const emit = defineEmits(['click', 'enroll', 'refund', 'viewChapters'])
const handleClick = () => {
  emit('click', props.course)
}

// 点击报名
const handleEnroll = () => {
  // 如果按钮禁用，不触发任何操作
  if (isButtonDisabled()) {
    return
  }
  emit('enroll', props.course)
}

// 点击退课
const handleRefund = () => {
  emit('refund', props.course)
}

// 点击查看章节
const handleViewChapters = () => {
  emit('viewChapters', props.course)
}
</script>

<style lang="scss" scoped>
.course-card {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  
  .course-image {
    width: 100%;
    height: 360rpx;
    position: relative;
    
    image {
      width: 100%;
      height: 100%;
    }
    
    .course-credit {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      background-color: rgba(200, 22, 29, 0.9);
      color: #fff;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
    }
  }
  
  .course-info {
    padding: 24rpx;
    
    .course-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      line-height: 1.4;
      margin-bottom: 16rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .course-teacher {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #666;
      margin-bottom: 12rpx;
      
      .teacher-avatar {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
    }
    
    .course-time {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 16rpx;
    }
    
    .course-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .course-location {
        font-size: 24rpx;
        color: #999;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .course-actions {
        display: flex;
        gap: 16rpx;
      }
      
      .course-btn {
        padding: 12rpx 32rpx;
        background-color: #C8161D;
        color: #fff;
        border-radius: 20rpx;
        font-size: 26rpx;
        white-space: nowrap;
        transition: opacity 0.3s;
        
        &.btn-ongoing {
          background-color: #52C41A;  // 绿色 - 进行中
        }
        
        &.btn-completed {
          background-color: #1890FF;  // 蓝色 - 已完成
        }
        
        &.btn-refunding {
          background-color: #FF9800;  // 橙色 - 退课中
        }
        
        &.btn-closed {
          background-color: #999;  // 灰色 - 已截止
        }
        
        &.btn-refund {
          background-color: #FF9800;
          
          &:active {
            background-color: #FB8C00;
          }
        }
        
        &.btn-chapter {
          background-color: #1890FF;
          
          &:active {
            background-color: #1976D2;
          }
        }
        
        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>

