<template>
  <view class="page-container">
    <!-- 员工信息 -->
    <view class="employee-info-card">
      <text class="label">为以下员工购买课程：</text>
      <text class="employee-name">{{ employeeName }}</text>
    </view>

    <!-- 课程列表 -->
    <view class="course-list">
      <view 
        v-for="course in courses" 
        :key="course.id"
        class="course-card"
        @click="handleSelectCourse(course)"
      >
        <image :src="course.coverImage" class="course-cover" mode="aspectFill" />
        
        <view class="course-info">
          <text class="course-title">{{ course.title }}</text>
          <view class="course-meta">
            <text class="course-time">{{ formatTime(course.startTime) }}</text>
            <text class="course-credit">{{ course.credit }}学分</text>
          </view>
          <view class="course-status">
            <text :class="['status-tag', course.enrollStatus]">
              {{ course.enrollStatus === 'OPEN' ? '报名中' : '已截止' }}
            </text>
          </view>
        </view>
        
        <button class="btn-purchase" @click.stop="handlePurchase(course)">
          立即购买
        </button>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && courses.length === 0" class="empty-state">
        <image src="/static/images/empty.png" class="empty-image" mode="aspectFit" />
        <text class="empty-text">暂无可购买的课程</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseList, getMyCredits } from '@/api/course'
import { purchaseCourseForEmployee } from '../../api/corporate'
import { formatTime } from '@/utils/util'

const employeeId = ref('')
const employeeName = ref('')
const courses = ref([])
const loading = ref(false)
const myCredit = ref(0)

onLoad(async (options) => {
  employeeId.value = options.employeeId
  employeeName.value = decodeURIComponent(options.employeeName || '')
  
  await loadCourses()
  await loadMyCredit()
})

// 加载课程列表
const loadCourses = async () => {
  loading.value = true
  try {
    const data = await getCourseList({
      status: 'PUBLISHED',
      page: 1,
      pageSize: 100
    })
    courses.value = data.items || []
  } catch (error) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载我的学分
const loadMyCredit = async () => {
  try {
    const data = await getMyCredits()
    myCredit.value = data.balance || 0
  } catch (error) {
    console.error('加载学分失败:', error)
  }
}

// 选择课程
const handleSelectCourse = (course) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${course.id}`
  })
}

// 购买课程
const handlePurchase = async (course) => {
  if (course.enrollStatus !== 'OPEN') {
    uni.showToast({
      title: '该课程报名已截止',
      icon: 'none'
    })
    return
  }
  
  if (myCredit.value < course.credit) {
    uni.showToast({
      title: `您的个人学分不足（需要${course.credit}学分）`,
      icon: 'none'
    })
    return
  }
  
  // 确认购买
  uni.showModal({
    title: '确认购买',
    content: `确定为 ${employeeName.value} 购买课程《${course.title}》吗？将消耗您的 ${course.credit} 个人学分。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '购买中...' })
          
          await purchaseCourseForEmployee({
            toUserId: employeeId.value,
            courseId: course.id
          })
          
          uni.hideLoading()
          uni.showToast({
            title: '购买成功',
            icon: 'success'
          })
          
          // 刷新数据
          await loadMyCredit()
          
          // 延迟后返回
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: error.message || '购买失败',
            icon: 'none'
          })
        }
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.employee-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  color: white;
  
  .label {
    display: block;
    font-size: 28rpx;
    opacity: 0.9;
    margin-bottom: 12rpx;
  }
  
  .employee-name {
    font-size: 36rpx;
    font-weight: bold;
  }
}

.course-list {
  padding: 20rpx 30rpx;
}

.course-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  
  .course-cover {
    width: 160rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    margin-right: 20rpx;
  }
  
  .course-info {
    flex: 1;
    
    .course-title {
      display: block;
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 12rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .course-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;
      
      .course-time {
        font-size: 24rpx;
        color: #999;
      }
      
      .course-credit {
        font-size: 26rpx;
        color: #ff9800;
        font-weight: bold;
      }
    }
    
    .course-status {
      .status-tag {
        display: inline-block;
        padding: 4rpx 12rpx;
        font-size: 22rpx;
        border-radius: 4rpx;
        
        &.OPEN {
          background: #e8f5e9;
          color: #4caf50;
        }
        
        &.CLOSED {
          background: #ffebee;
          color: #f44336;
        }
      }
    }
  }
  
  .btn-purchase {
    width: 140rpx;
    height: 60rpx;
    line-height: 60rpx;
    font-size: 26rpx;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;
    border-radius: 30rpx;
    flex-shrink: 0;
    margin-left: 16rpx;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>

