<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-input-wrapper">
        <Icon name="search" :size="36" color="#999" />
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索资讯、课程、活动"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <Icon 
          v-if="keyword" 
          name="close" 
          :size="32" 
          color="#999" 
          @click="clearKeyword" 
        />
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索结果分类Tab -->
    <view v-if="hasSearched" class="result-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-count">({{ tab.count }})</text>
      </view>
    </view>

    <!-- 搜索结果内容 -->
    <scroll-view v-if="hasSearched" class="result-content" scroll-y>
      <!-- 全部结果 -->
      <view v-if="currentTab === 'all'">
        <!-- 资讯结果 -->
        <view v-if="searchResult.news.length > 0" class="result-section">
          <view class="section-header">
            <text class="section-title">资讯</text>
            <text class="section-count">{{ searchResult.news.length }}</text>
          </view>
          <view 
            v-for="item in searchResult.news" 
            :key="item.id"
            class="result-item"
            @click="goNewsDetail(item.id)"
          >
            <news-card :news="item" />
          </view>
        </view>

        <!-- 课程结果 -->
        <view v-if="searchResult.courses.length > 0" class="result-section">
          <view class="section-header">
            <text class="section-title">课程</text>
            <text class="section-count">{{ searchResult.courses.length }}</text>
          </view>
          <view 
            v-for="item in searchResult.courses" 
            :key="item.id"
            class="result-item"
            @click="goCourseDetail(item.id)"
          >
            <course-card :course="item" />
          </view>
        </view>

        <!-- 活动结果 -->
        <view v-if="searchResult.activities.length > 0" class="result-section">
          <view class="section-header">
            <text class="section-title">活动</text>
            <text class="section-count">{{ searchResult.activities.length }}</text>
          </view>
          <view 
            v-for="item in searchResult.activities" 
            :key="item.id"
            class="result-item"
            @click="goActivityDetail(item.id)"
          >
            <activity-card :activity="item" />
          </view>
        </view>

        <!-- 无结果 -->
        <empty-view 
          v-if="searchResult.total === 0"
          text="未找到相关内容"
          :show-btn="false"
        />
      </view>

      <!-- 资讯Tab -->
      <view v-else-if="currentTab === 'news'">
        <view 
          v-for="item in searchResult.news" 
          :key="item.id"
          class="result-item"
          @click="goNewsDetail(item.id)"
        >
          <news-card :news="item" />
        </view>
        <empty-view 
          v-if="searchResult.news.length === 0"
          text="未找到相关资讯"
          :show-btn="false"
        />
      </view>

      <!-- 课程Tab -->
      <view v-else-if="currentTab === 'course'">
        <view 
          v-for="item in searchResult.courses" 
          :key="item.id"
          class="result-item"
          @click="goCourseDetail(item.id)"
        >
          <course-card :course="item" />
        </view>
        <empty-view 
          v-if="searchResult.courses.length === 0"
          text="未找到相关课程"
          :show-btn="false"
        />
      </view>

      <!-- 活动Tab -->
      <view v-else-if="currentTab === 'activity'">
        <view 
          v-for="item in searchResult.activities" 
          :key="item.id"
          class="result-item"
          @click="goActivityDetail(item.id)"
        >
          <activity-card :activity="item" />
        </view>
        <empty-view 
          v-if="searchResult.activities.length === 0"
          text="未找到相关活动"
          :show-btn="false"
        />
      </view>
    </scroll-view>

    <!-- 搜索前的内容 -->
    <view v-else class="search-hints">
      <!-- 热门搜索 -->
      <view class="hint-section">
        <view class="hint-title">🔥 热门搜索</view>
        <view class="hot-keywords">
          <view 
            v-for="(item, index) in hotKeywords" 
            :key="index"
            class="keyword-tag"
            @click="searchHotKeyword(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <!-- 搜索建议 -->
      <view class="hint-section">
        <view class="hint-title">💡 搜索建议</view>
        <view class="suggestion-list">
          <view class="suggestion-item" @click="searchHotKeyword('企业战略管理')">
            <Icon name="search" :size="32" color="#999" />
            <text class="suggestion-text">企业战略管理</text>
          </view>
          <view class="suggestion-item" @click="searchHotKeyword('数字化转型')">
            <Icon name="search" :size="32" color="#999" />
            <text class="suggestion-text">数字化转型</text>
          </view>
          <view class="suggestion-item" @click="searchHotKeyword('领导力培训')">
            <Icon name="search" :size="32" color="#999" />
            <text class="suggestion-text">领导力培训</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { globalSearch, getHotKeywords } from '@/api/search'
import Icon from '@/components/icon/icon.vue'
import NewsCard from '@/components/news-card/news-card.vue'
import CourseCard from '@/components/course-card/course-card.vue'
import ActivityCard from '@/components/activity-card/activity-card.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'

// 状态栏高度
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

// 搜索关键词
const keyword = ref('')

// 当前Tab
const currentTab = ref('all')

// 是否已搜索
const hasSearched = ref(false)

// 搜索结果
const searchResult = ref({
  news: [],
  courses: [],
  activities: [],
  total: 0
})

// 热门关键词
const hotKeywords = ref([])

// Tab配置
const tabs = computed(() => [
  { key: 'all', label: '全部', count: searchResult.value.total },
  { key: 'news', label: '资讯', count: searchResult.value.news.length },
  { key: 'course', label: '课程', count: searchResult.value.courses.length },
  { key: 'activity', label: '活动', count: searchResult.value.activities.length }
])

// 页面加载
onMounted(() => {
  loadHotKeywords()
})

// 加载热门关键词
const loadHotKeywords = async () => {
  try {
    const data = await getHotKeywords()
    hotKeywords.value = data || []
  } catch (error) {
    console.error('加载热门关键词失败：', error)
  }
}

// 执行搜索
const handleSearch = async () => {
  if (!keyword.value || keyword.value.trim() === '') {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({ title: '搜索中...' })
    
    const data = await globalSearch(keyword.value.trim())
    searchResult.value = data
    hasSearched.value = true
    currentTab.value = 'all'
    
    uni.hideLoading()
  } catch (error) {
    console.error('搜索失败：', error)
    uni.hideLoading()
    uni.showToast({
      title: '搜索失败',
      icon: 'none'
    })
  }
}

// 切换Tab
const switchTab = (tab) => {
  currentTab.value = tab
}

// 清空关键词
const clearKeyword = () => {
  keyword.value = ''
  hasSearched.value = false
  searchResult.value = {
    news: [],
    courses: [],
    activities: [],
    total: 0
  }
}

// 搜索热门关键词
const searchHotKeyword = (kw) => {
  keyword.value = kw
  handleSearch()
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 跳转资讯详情
const goNewsDetail = (id) => {
  uni.navigateTo({
    url: `/pages/news/detail?id=${id}`
  })
}

// 跳转课程详情
const goCourseDetail = (id) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${id}`
  })
}

// 跳转活动详情
const goActivityDetail = (id) => {
  uni.navigateTo({
    url: `/pages/association/activity-detail?id=${id}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .search-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 48rpx;
    padding: 16rpx 24rpx;
    margin-right: 24rpx;
    
    .search-input {
      flex: 1;
      font-size: 28rpx;
      margin: 0 16rpx;
    }
  }
  
  .cancel-btn {
    font-size: 28rpx;
    color: #666;
  }
}

.result-tabs {
  display: flex;
  background-color: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tab-item {
    padding: 24rpx 32rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #C8161D;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 4rpx;
        background-color: #C8161D;
        border-radius: 2rpx;
      }
    }
    
    .tab-count {
      margin-left: 8rpx;
      font-size: 24rpx;
    }
  }
}

.result-content {
  height: calc(100vh - 200rpx);
  padding: 24rpx;
  box-sizing: border-box;
  .result-section {
    margin-bottom: 32rpx;
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }
      
      .section-count {
        margin-left: 12rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .result-item {
      margin-bottom: 24rpx;
    }
  }
}

.search-hints {
  padding: 32rpx 24rpx;
  
  .hint-section {
    margin-bottom: 48rpx;
    
    .hint-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 24rpx;
    }
    
    .hot-keywords {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      
      .keyword-tag {
        padding: 16rpx 32rpx;
        background-color: #f5f5f5;
        border-radius: 48rpx;
        font-size: 26rpx;
        color: #666;
      }
    }
    
    .suggestion-list {
      .suggestion-item {
        display: flex;
        align-items: center;
        padding: 24rpx 0;
        border-bottom: 1rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .suggestion-text {
          margin-left: 16rpx;
          font-size: 28rpx;
          color: #666;
        }
      }
    }
  }
}
</style>
