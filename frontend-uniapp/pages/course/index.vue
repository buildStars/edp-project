<template>
  <view class="page">
    <!-- 顶部装饰 -->
    <view class="page-header-decoration"></view>
    
    <!-- 页面标题 -->
    <view class="page-title">
      <text class="title-text">课程中心</text>
      <text class="title-desc">精品课程 · 助力成长</text>
    </view>
    
    <!-- 课程列表 - 优化版 -->
    <view class="course-list">
      <view 
        v-for="(item, index) in courseList" 
        :key="item.id"
        class="course-item-wrapper"
        :style="{ 'animation-delay': `${index * 0.1}s` }"
      >
        <course-card 
          :course="item"
          @click="goCourseDetail"
          @enroll="handleEnroll"
        />
      </view>
      
      <!-- 空状态 -->
      <empty-view 
        v-if="!loading && courseList.length === 0"
        text="暂无课程"
        :show-btn="true"
        @click="onRefresh"
      />
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view v-if="!hasMore && courseList.length > 0" class="no-more">
        <view class="no-more-line"></view>
        <text class="no-more-text">已经到底了</text>
        <view class="no-more-line"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { useCourseStore } from '@/store/course'
import { useUserStore } from '@/store/user'
import CourseCard from '@/components/course-card/course-card.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'

// 加载状态
const loading = ref(false)

// 页码
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 课程store
const courseStore = useCourseStore()
const userStore = useUserStore()

// 课程列表
const courseList = computed(() => courseStore.courseList)

// 页面加载
onMounted(() => {
  loadCourseList(true)
})

// 加载课程列表
const loadCourseList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  if (isRefresh) {
    page.value = 1
    hasMore.value = true
  }
  
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    const data = await courseStore.fetchCourseList(params)
    
    // 后端返回的是 { items: [], total, page, pageSize, totalPages }
    // 前端 request.js 已经提取了 data.data，所以这里直接用 items
    const list = data.items || data.data || data.list || []
    if (list.length < pageSize.value) {
      hasMore.value = false
    }
    
    page.value++
  } catch (error) {
    console.error('加载课程失败：', error)
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

// 下拉刷新
const onRefresh = () => {
  courseStore.clearCourseList()
  loadCourseList(true)
}

// 上拉加载更多
const handleReachBottom = () => {
  if (hasMore.value && !loading.value) {
    loadCourseList(false)
  }
}

// 跳转课程详情
const goCourseDetail = (course) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${course.id}`
  })
}

// 处理报名
const handleEnroll = (course) => {
  // 检查登录状态
  if (!userStore.checkLogin()) {
    return
  }
  
  // 跳转到课程详情页处理报名
  goCourseDetail(course)
}

// 监听下拉刷新
onPullDownRefresh(() => {
  onRefresh()
})

// 监听上拉加载
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

// 顶部装饰
.page-header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(135deg, rgba(200, 22, 29, 0.05) 0%, transparent 100%);
  z-index: 0;
}

// 页面标题
.page-title {
  padding: 32rpx 32rpx 24rpx;
  background: #fff;
  margin-bottom: 24rpx;
  
  .title-text {
    display: block;
    font-size: 44rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .title-desc {
    display: block;
    font-size: 24rpx;
    color: #999;
  }
}

// 课程列表 - 优化版
.course-list {
  padding: 0 24rpx 24rpx;
  position: relative;
  z-index: 1;
  
  .course-item-wrapper {
    margin-bottom: 24rpx;
    animation: fadeInUp 0.6s ease both;
  }
}

// 加载更多
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;
  
  .loading-spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #f0f0f0;
    border-top-color: #C8161D;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 16rpx;
  }
  
  .loading-text {
    font-size: 26rpx;
    color: #999;
  }
}

// 没有更多
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;
  gap: 16rpx;
  
  .no-more-line {
    width: 80rpx;
    height: 2rpx;
    background: linear-gradient(90deg, transparent 0%, #e0e0e0 50%, transparent 100%);
  }
  
  .no-more-text {
    font-size: 24rpx;
    color: #999;
  }
}

// 动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

