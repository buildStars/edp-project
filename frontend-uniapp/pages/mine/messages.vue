<template>
  <view class="page">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="filter-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
        <view v-if="tab.value === 'unread' && unreadCount > 0" class="badge">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      scroll-y 
      class="message-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherpulling="onPullDownRefresh"
      @refresherrefresh="onPullDownRefresh"
      @refresherrestore="onRestore"
    >
      <view v-if="list.length > 0">
        <view 
          v-for="item in list" 
          :key="item.id"
          class="message-item"
          :class="{ unread: !item.isRead }"
          @click="handleItemClick(item)"
        >
          <view class="message-icon">
            <Icon :name="getIconByType(item.type)" :size="48" :color="getColorByType(item.type)" />
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{ item.title }}</text>
              <text class="message-time">{{ formatTime(item.createdAt) }}</text>
            </view>
            <view class="message-body">{{ item.content }}</view>
            <view v-if="!item.isRead" class="unread-dot"></view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <empty-view v-else :text="currentTab === 'unread' ? '暂无未读消息' : '暂无消息'" />

      <!-- 加载更多 -->
      <view v-if="hasMore && list.length > 0" class="load-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="!hasMore && list.length > 0" class="load-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view v-if="list.length > 0" class="action-bar">
      <button class="action-btn" @click="markAllAsRead">
        <Icon name="check" :size="32" color="#666" />
        <text>全部已读</text>
      </button>
      <button v-if="currentTab !== 'unread'" class="action-btn" @click="clearRead">
        <Icon name="delete" :size="32" color="#666" />
        <text>清空已读</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getNotificationList, getUnreadCount, markAsRead, clearReadNotifications } from '@/api/notification'
import Icon from '@/components/icon/icon.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'

// 标签页
const tabs = [
  { label: '全部', value: 'all' },
  { label: '未读', value: 'unread' },
  { label: '已读', value: 'read' }
]

const currentTab = ref('all')
const list = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const unreadCount = ref(0)

const hasMore = computed(() => list.value.length < total.value)

// 切换标签
const switchTab = (tab) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  page.value = 1
  list.value = []
  fetchList()
}

// 获取消息列表
const fetchList = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    // 根据当前标签设置查询参数
    if (currentTab.value === 'unread') {
      params.isRead = false
    } else if (currentTab.value === 'read') {
      params.isRead = true
    }
    
    const data = await getNotificationList(params)
    
    if (page.value === 1) {
      list.value = data.items || []
    } else {
      list.value = [...list.value, ...(data.items || [])]
    }
    
    total.value = data.total || 0
  } catch (error) {
    console.error('获取消息列表失败：', error)
    uni.showToast({ 
      title: error.msg || '获取失败', 
      icon: 'none' 
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 获取未读数量
const fetchUnreadCount = async () => {
  try {
    const data = await getUnreadCount()
    unreadCount.value = data.count || 0
  } catch (error) {
    console.error('获取未读数量失败：', error)
  }
}

// 下拉刷新
const onPullDownRefresh = () => {
  refreshing.value = true
  page.value = 1
  list.value = []
  fetchList()
  fetchUnreadCount()
}

const onRestore = () => {
  refreshing.value = false
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    page.value++
    fetchList()
  }
}

// 点击消息项
const handleItemClick = async (item) => {
  // 如果未读，先标记为已读
  if (!item.isRead) {
    try {
      await markAsRead({ ids: [item.id], isRead: true })
      
      // 更新本地状态
      item.isRead = true
      item.readAt = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      
      // 如果当前在"未读"标签，从列表中移除该消息
      if (currentTab.value === 'unread') {
        const index = list.value.findIndex(msg => msg.id === item.id)
        if (index > -1) {
          list.value.splice(index, 1)
          total.value = Math.max(0, total.value - 1)
        }
      }
    } catch (error) {
      console.error('标记已读失败：', error)
    }
  }
  
  // 根据通知类型跳转
  if (item.data) {
    // 优先使用 link 字段
    if (item.data.link) {
      uni.navigateTo({ url: item.data.link })
      return
    }
    
    // 兼容旧的 url 字段
    if (item.data.url) {
      uni.navigateTo({ url: item.data.url })
      return
    }
    
    // 签到通知特殊处理
    if (item.type === 'COURSE_CHECKIN' && item.data.courseId) {
      const url = `/pages/course/detail?id=${item.data.courseId}&action=checkin`
      uni.navigateTo({ url })
      return
    }
  }
  
  // 默认显示详情弹窗
  uni.showModal({
    title: item.title,
    content: item.content,
    showCancel: false,
    confirmText: '知道了'
  })
}

// 全部标记为已读
const markAllAsRead = async () => {
  try {
    uni.showLoading({ title: '处理中...' })
    await markAsRead({ isRead: true })
    
    // 更新未读数量
    unreadCount.value = 0
    
    // 如果当前在"未读"标签，清空列表并显示空状态
    if (currentTab.value === 'unread') {
      list.value = []
      total.value = 0
    } else {
      // 如果在"全部"或"已读"标签，更新列表中的状态
      list.value.forEach(item => {
        item.isRead = true
        item.readAt = new Date().toISOString()
      })
    }
    
    // 重新获取未读数量（以服务器为准）
    fetchUnreadCount()
    
    uni.showToast({ 
      title: '已全部标记为已读', 
      icon: 'success' 
    })
  } catch (error) {
    console.error('标记失败：', error)
    uni.showToast({ 
      title: error.msg || '操作失败', 
      icon: 'none' 
    })
  } finally {
    uni.hideLoading()
  }
}

// 清空已读
const clearRead = async () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有已读消息吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '清空中...' })
          await clearReadNotifications()
          
          // 刷新列表
          page.value = 1
          list.value = []
          fetchList()
          
          uni.showToast({ 
            title: '清空成功', 
            icon: 'success' 
          })
        } catch (error) {
          console.error('清空失败：', error)
          uni.showToast({ 
            title: error.msg || '清空失败', 
            icon: 'none' 
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  }
  
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `昨天 ${hours}:${minutes}`
  }
  
  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}-${day}`
  }
  
  // 其他
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 根据类型获取图标
const getIconByType = (type) => {
  const iconMap = {
    NEWS_UPDATE: 'message',
    ACTIVITY_REMIND: 'time',
    COURSE_CHECKIN: 'course',
    ENROLLMENT_AUDIT: 'check',
    COURSE_EVALUATE: 'star',
    CREDIT_EXPIRE: 'time',
    SYSTEM: 'message'
  }
  return iconMap[type] || 'message'
}

// 根据类型获取颜色
const getColorByType = (type) => {
  const colorMap = {
    NEWS_UPDATE: '#1890ff',
    ACTIVITY_REMIND: '#52c41a',
    COURSE_CHECKIN: '#722ed1',
    ENROLLMENT_AUDIT: '#faad14',
    COURSE_EVALUATE: '#eb2f96',
    CREDIT_EXPIRE: '#f5222d',
    SYSTEM: '#666'
  }
  return colorMap[type] || '#666'
}

onMounted(() => {
  fetchList()
  fetchUnreadCount()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  background-color: #fff;
  padding: 24rpx 32rpx;
  gap: 32rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .filter-item {
    position: relative;
    padding: 12rpx 24rpx;
    font-size: 28rpx;
    color: #666;
    border-radius: 32rpx;
    transition: all 0.3s;

    &.active {
      color: #C8161D;
      background-color: rgba(200, 22, 29, 0.1);
      font-weight: 500;
    }

    .badge {
      position: absolute;
      top: 4rpx;
      right: -8rpx;
      background-color: #f5222d;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 8rpx;
      border-radius: 20rpx;
      min-width: 32rpx;
      text-align: center;
    }
  }
}

.message-list {
  flex: 1;

}

.message-item {
  display: flex;
  padding: 32rpx;
  margin-bottom: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &.unread {
    background-color: #fffbe6;
  }

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }

  .message-icon {
    flex-shrink: 0;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    margin-right: 24rpx;
  }

  .message-content {
    flex: 1;
    position: relative;

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .message-title {
        flex: 1;
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-right: 16rpx;
      }

      .message-time {
        flex-shrink: 0;
        font-size: 24rpx;
        color: #999;
      }
    }

    .message-body {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .unread-dot {
      position: absolute;
      top: 8rpx;
      right: -16rpx;
      width: 16rpx;
      height: 16rpx;
      background-color: #f5222d;
      border-radius: 50%;
    }
  }
}

.load-more {
  text-align: center;
  padding: 32rpx 0;
  font-size: 26rpx;
  color: #999;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  padding: 24rpx 32rpx;
  gap: 24rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
  z-index: 10;

  .action-btn {
    flex: 1;
    height: 88rpx;
    background-color: #f5f5f5;
    color: #666;
    font-size: 28rpx;
    border: none;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    transition: all 0.3s;

    &:active {
      opacity: 0.7;
      transform: scale(0.98);
    }
  }
}
</style>

