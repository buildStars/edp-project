<template>
  <view class="page">
    <!-- 状态选项卡 - 优化版 -->
    <view class="status-tabs">
      <view class="tabs-container">
        <view 
          v-for="tab in statusTabs" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentStatus === tab.value }"
          @click="changeStatus(tab.value)"
        >
          <Icon :name="tab.icon" :size="36" :color="currentStatus === tab.value ? '#C8161D' : '#999'" />
          <text class="tab-label">{{ tab.label }}</text>
        </view>
        <view class="tab-indicator" :style="{ left: currentStatus === 'enrolled' ? '0' : '50%' }"></view>
      </view>
    </view>
    
    <!-- 课程列表 -->
    <view class="course-list">
      <course-card 
        v-for="item in courseList" 
        :key="item.id"
        :course="item"
        :show-refund-button="currentStatus === 'enrolled'"
        :show-chapter-button="currentStatus === 'enrolled'"
        @click="goCourseDetail"
        @refund="handleRefund"
        @viewChapters="handleViewChapters"
      />
      
      <!-- 空状态 -->
      <empty-view 
        v-if="!loading && courseList.length === 0"
        text="暂无课程"
      />
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view v-if="!hasMore && courseList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getMyCourses } from '@/api/course'
import CourseCard from '@/components/course-card/course-card.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'

// 状态选项卡
const statusTabs = [
  { label: '进行中', value: 'enrolled', icon: 'course' },
  { label: '已完成', value: 'completed', icon: 'check' }
]

// 当前状态
const currentStatus = ref('enrolled')

// 课程列表
const courseList = ref([])

// 加载状态
const loading = ref(false)

// 分页
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 页面加载
onMounted(() => {
  loadCourseList(true)
})

// 切换状态
const changeStatus = (status) => {
  if (currentStatus.value === status) return
  currentStatus.value = status
  loadCourseList(true)
}

// 加载课程列表
const loadCourseList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  if (isRefresh) {
    page.value = 1
    hasMore.value = true
  }
  
  try {
    const data = await getMyCourses(currentStatus.value)
    
    // 后端返回的是数组 [{ id, userId, courseId, course: {...} }]
    // 需要提取其中的 course 对象
    let list = []
    if (Array.isArray(data)) {
      // 直接返回数组
      list = data.map(enrollment => enrollment.course).filter(course => course !== null)
    } else {
      // 返回分页对象
      const enrollments = data.items || data.data || data.list || []
      list = enrollments.map(enrollment => enrollment.course).filter(course => course !== null)
    }
    
    if (isRefresh) {
      courseList.value = list
    } else {
      courseList.value = [...courseList.value, ...list]
    }
    
    if (list.length < pageSize.value) {
      hasMore.value = false
    }
    
    page.value++
  } catch (error) {
    console.error('加载课程列表失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}

// 跳转课程详情
const goCourseDetail = (course) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${course.id}`
  })
}

// 查看章节
const handleViewChapters = (course) => {
  uni.navigateTo({
    url: `/pages/course/chapters?courseId=${course.id}&courseTitle=${encodeURIComponent(course.title)}`
  })
}

// 处理退课
const handleRefund = (course) => {
  // 计算距离开课时间
  const startTime = new Date(course.startTime).getTime()
  const now = Date.now()
  const daysLeft = Math.ceil((startTime - now) / (1000 * 60 * 60 * 24))
  
  // 开课前3天以外才能申请退课（即必须 > 3天）
  if (daysLeft <= 3) {
    uni.showModal({
      title: '无法退课',
      content: `开课前3天内不能申请退课，当前距离开课还有${daysLeft}天`,
      showCancel: false
    })
    return
  }
  
  // 跳转到退课申请页面
  uni.navigateTo({
    url: `/pages/refund-request/create?courseId=${course.id}`
  })
}

// 下拉刷新
onPullDownRefresh(() => {
  loadCourseList(true)
})

// 上拉加载
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadCourseList(false)
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

// 状态选项卡 - 优化版
.status-tabs {
  background: #fff;
  padding: 20rpx 24rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  
  .tabs-container {
    position: relative;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    border-radius: 16rpx;
    padding: 8rpx;
    
    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0;
      position: relative;
      z-index: 2;
      transition: all 0.3s ease;
      
      .tab-label {
        font-size: 26rpx;
        color: #999;
        font-weight: 500;
        margin-top: 8rpx;
        transition: all 0.3s ease;
      }
      
      &.active {
        .tab-label {
          color: #C8161D;
          font-weight: 600;
        }
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    .tab-indicator {
      position: absolute;
      bottom: 8rpx;
      width: 50%;
      height: calc(100% - 16rpx);
      background: linear-gradient(135deg, rgba(200, 22, 29, 0.15) 0%, rgba(200, 22, 29, 0.08) 100%);
      border-radius: 12rpx;
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;
      box-shadow: 0 2rpx 8rpx rgba(200, 22, 29, 0.15);
    }
  }
}

// 课程列表
.course-list {
  padding: 0 24rpx 24rpx;
}

// 加载更多
.loading-more {
  text-align: center;
  padding: 48rpx 0;
  font-size: 26rpx;
  color: #999;
}

// 没有更多
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;
  font-size: 24rpx;
  color: #999;
  
  &::before,
  &::after {
    content: '';
    width: 80rpx;
    height: 2rpx;
    background: linear-gradient(90deg, transparent 0%, #e0e0e0 50%, transparent 100%);
    margin: 0 16rpx;
  }
}
</style>

