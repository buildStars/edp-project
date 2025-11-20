<template>
  <view class="page">
    <!-- 用户信息区域 - 优化版 -->
    <view class="user-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 背景装饰 -->
      <view class="bg-decoration">
        <view class="decoration-circle circle-1"></view>
        <view class="decoration-circle circle-2"></view>
        <view class="decoration-circle circle-3"></view>
      </view>
      
      <view v-if="!userStore.isLogin" class="login-prompt" @click="goLogin">
        <view class="avatar-wrapper">
          <Icon name="user" :size="120" class="avatar" />
          <view class="avatar-glow"></view>
        </view>
        <view class="login-text">
          <text class="login-title">欢迎来到EDP</text>
          <text class="login-subtitle">点击登录 · 开启学习之旅</text>
        </view>
        <Icon name="arrow-right" :size="48" color="rgba(255, 255, 255, 0.8)" />
      </view>
      
      <view v-else class="user-info">
        <view class="avatar-wrapper">
          <image :src="userStore.avatar" class="avatar" />
          <view class="avatar-glow"></view>
          <view class="avatar-decoration"></view>
          <!-- 企业用户/管理员标识 -->
          <view v-if="isCorpAdmin || isCorpUser" class="user-badge" :class="{ 'badge-admin': isCorpAdmin, 'badge-user': isCorpUser && !isCorpAdmin }">
            <text class="badge-text">{{ isCorpAdmin ? '企业管理员' : '企业用户' }}</text>
          </view>
        </view>
        <view class="user-detail">
          <view class="user-name-row">
            <text class="user-name">{{ userStore.nickname }}</text>
            <!-- 企业名称标签 -->
            <view v-if="organizationName" class="org-tag">
              <Icon name="work" :size="24" color="#fff" />
              <text class="org-name">{{ organizationName }}</text>
            </view>
          </view>
          <view v-if="userInfo.company" class="user-company">
            <Icon name="work" :size="28" color="rgba(255, 255, 255, 0.8)" />
            <text>{{ userInfo.company }} {{ userInfo.position ? '·' + userInfo.position : '' }}</text>
          </view>
        </view>
        <view class="edit-btn" @click="goEditInfo">
          <Icon name="edit" :size="40" color="#fff" />
        </view>
      </view>
      
      <!-- 学分信息 - 优化版 -->
      <view v-if="userStore.isLogin" class="credit-card">
        <view class="credit-item" @click="goMyCredits">
          <view class="credit-icon">
            <Icon name="star" :size="48" color="#FFD700" />
          </view>
          <view class="credit-content">
            <view class="credit-value">{{ credits.balance || 0 }}</view>
            <view class="credit-label">总学分</view>
          </view>
        </view>
        
        <view class="credit-divider"></view>
        
        <view class="credit-item">
          <view class="credit-icon">
            <Icon name="user" :size="48" color="#52C41A" />
          </view>
          <view class="credit-content">
            <view class="credit-value">{{ credits.personalBalance || 0 }}</view>
            <view class="credit-label">个人学分</view>
            <view class="credit-tip">可赠课</view>
          </view>
        </view>
       
        <view class="credit-divider"></view>
        
        <view class="credit-item">
          <view class="credit-icon">
            <Icon name="work" :size="48" color="#FF6B6B" />
          </view>
          <view class="credit-content">
            <view class="credit-value">{{ credits.lockedBalance || 0 }}</view>
            <view class="credit-label">锁定学分</view>
            <view class="credit-tip">只能购课</view>
          </view>
        </view>
      </view>
    </view>
    
  
    <!-- 功能菜单 - 优化版 -->
    <view class="menu-section">
      <view class="menu-grid">
        <view class="menu-card" @click="goMyCourses" v-if="userStore.isLogin">
          <view class="menu-icon-wrapper gradient-blue">
            <Icon name="course" :size="56" color="#fff" />
          </view>
          <text class="menu-label">我的课程</text>
        </view>
        
        <view class="menu-card" @click="goMyCollection" v-if="userStore.isLogin">
          <view class="menu-icon-wrapper gradient-red">
            <Icon name="star" :size="56" color="#fff" />
          </view>
          <text class="menu-label">我的收藏</text>
        </view>
        
        <view class="menu-card" @click="goMessages" v-if="userStore.isLogin">
          <view class="menu-icon-wrapper gradient-purple">
            <Icon name="message" :size="56" color="#fff" />
            <view v-if="unreadCount > 0" class="icon-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
          </view>
          <text class="menu-label">消息中心</text>
        </view>
        
        <view class="menu-card" @click="goDownloadList" v-if="userStore.isLogin">
          <view class="menu-icon-wrapper gradient-green">
            <Icon name="download" :size="56" color="#fff" />
          </view>
          <text class="menu-label">课件下载</text>
        </view>
      </view>
    </view>
    
    <!-- 企业功能区 - 优化版 -->
    <view v-if="userStore.isLogin && (isCorpAdmin || isCorpUser)" class="corp-section">
      <view class="section-header">
        <view class="header-left">
          <Icon name="work" :size="40" color="#9C27B0" />
          <text class="section-title">企业功能</text>
        </view>
        <view v-if="organizationName" class="org-info">
          <text class="org-name-text">{{ organizationName }}</text>
        </view>
      </view>
      
      <view class="corp-cards">
        <!-- 企业管理员功能 -->
        <view v-if="isCorpAdmin" class="corp-card admin-card" @click="goCorpEmployees">
          <view class="card-header">
            <view class="card-icon gradient-purple">
              <Icon name="teacher" :size="52" color="#fff" />
            </view>
            <view class="card-badge">管理员</view>
          </view>
          <view class="card-content">
            <text class="card-title">员工管理</text>
            <text class="card-desc">分配学分 · 购买课程 · 员工管理</text>
          </view>
          <view class="card-footer">
            <text class="card-link">立即管理</text>
            <Icon name="arrow-right" :size="28" color="#9C27B0" />
          </view>
        </view>
        
        <!-- 企业用户功能 -->
        <view v-if="isCorpUser" class="corp-card user-card" @click="showCorpInfo">
          <view class="card-header">
            <view class="card-icon gradient-blue">
              <Icon name="user" :size="52" color="#fff" />
            </view>
            <view class="card-badge">企业用户</view>
          </view>
          <view class="card-content">
            <text class="card-title">我的企业</text>
            <text class="card-desc">{{ organizationName || '暂无企业信息' }}</text>
          </view>
          <view class="card-footer">
            <text class="card-link">查看详情</text>
            <Icon name="arrow-right" :size="28" color="#1890FF" />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 快捷功能 - 优化版 -->
    <view class="quick-actions">
    
      <view class="action-item" @click="goCheckinRecords" v-if="userStore.isLogin">
        <view class="action-icon">
          <Icon name="check" :size="44" color="#52C41A" />
        </view>
        <view class="action-content">
          <text class="action-title">签到记录</text>
          <text class="action-desc">查看我的签到统计</text>
        </view>
        <Icon name="arrow-right" :size="32" color="#ccc" />
      </view>
    
      <view class="action-item" @click="goAIReport" v-if="userStore.isLogin">
        <view class="action-icon">
          <Icon name="ai" :size="44" color="#1890FF" />
        </view>
        <view class="action-content">
          <text class="action-title">AI报告</text>
          <text class="action-desc">智能分析您的学习情况</text>
        </view>
        <view class="action-badge">HOT</view>
        <Icon name="arrow-right" :size="32" color="#ccc" />
      </view>
      
      <view class="action-item" @click="contactService">
        <view class="action-icon">
          <Icon name="service" :size="44" color="#FF6B00" />
        </view>
        <view class="action-content">
          <text class="action-title">联系客服</text>
          <text class="action-desc">40077-20111</text>
        </view>
        <Icon name="arrow-right" :size="32" color="#ccc" />
      </view>
      
      <view class="action-item" @click="goAbout">
        <view class="action-icon">
          <Icon name="about" :size="44" color="#666" />
        </view>
        <view class="action-content">
          <text class="action-title">关于我们</text>
          <text class="action-desc">了解更多关于EDP</text>
        </view>
        <Icon name="arrow-right" :size="32" color="#ccc" />
      </view>
    </view>
    
    <!-- 退出登录按钮 - 优化版 -->
    <view v-if="userStore.isLogin" class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        <Icon name="logout" :size="36" color="#C8161D" />
        <text>退出登录</text>
      </button>
    </view>
    
    <!-- 底部间距 -->
    <view class="page-footer"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useCourseStore } from '@/store/course'
import { formatTime } from '@/utils/util'
import { getUnreadCount } from '@/api/notification'
import CourseCard from '@/components/course-card/course-card.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'

// 状态栏高度
const statusBarHeight = ref(0)

// Store
const userStore = useUserStore()
const courseStore = useCourseStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 学分信息
const credits = ref({})

// 未读消息数量
const unreadCount = ref(0)

// 判断是否是企业管理员
const isCorpAdmin = computed(() => {
  // 通过判断 adminOrganizations 是否有数据来判断是否是企业管理员
  return userInfo.value.adminOrganizations && userInfo.value.adminOrganizations.length > 0
})

// 判断是否是企业用户
const isCorpUser = computed(() => {
  // 有 organizationId 说明是企业用户
  return !!userInfo.value.organizationId
})

// 获取企业名称
const organizationName = computed(() => {
  if (isCorpAdmin.value && userInfo.value.adminOrganizations && userInfo.value.adminOrganizations.length > 0) {
    return userInfo.value.adminOrganizations[0].name
  }
  if (isCorpUser.value && userInfo.value.organization) {
    return userInfo.value.organization.name
  }
  return ''
})

// 当前Tab
const currentTab = ref('enrolled')

// 课程Tab列表
const courseTabs = ref([
  { label: '我的课程', value: 'enrolled' },
  { label: '已上课程', value: 'completed' }
])

// 当前课程列表
const currentCourseList = computed(() => {
  if (currentTab.value === 'enrolled') {
    return courseStore.myCourses.enrolled
  } else {
    return courseStore.myCourses.completed
  }
})

// 页面加载
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  if (userStore.isLogin) {
    loadUserData()
  }
})

// 加载用户数据
const loadUserData = async () => {
  try {
    // 获取用户信息
    await userStore.fetchUserInfo()
    
    // 获取学分信息
    const creditsData = await userStore.fetchCredits()
    credits.value = creditsData || {}
    
    // 获取我的课程
    await courseStore.fetchMyCourses('enrolled')
    await courseStore.fetchMyCourses('completed')
    
    // 获取未读消息数量
    fetchUnreadCount()
  } catch (error) {
    console.error('加载用户数据失败：', error)
  }
}

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const data = await getUnreadCount()
    unreadCount.value = data.count || 0
  } catch (error) {
    console.error('获取未读消息数量失败：', error)
  }
}

// 格式化有效期
const formatExpireDate = (date) => {
  if (!date) return '-'
  return formatTime(date, 'YYYY-MM-DD')
}

// 切换Tab
const switchTab = (tab) => {
  currentTab.value = tab
}

// 跳转登录
const goLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

// 跳转编辑资料
const goEditInfo = () => {
  uni.navigateTo({
    url: '/pages/mine/edit-info'
  })
}

// 跳转我的学分
const goMyCredits = () => {
  uni.navigateTo({
    url: '/pages/mine/my-credits'
  })
}

// 跳转签到记录
const goCheckinRecords = () => {
  uni.navigateTo({
    url: '/pages/checkin/records'
  })
}

// 跳转课程详情
const goCourseDetail = (course) => {
  uni.navigateTo({
    url: `/pages/course/detail?id=${course.id}`
  })
}

// 跳转我的课程
const goMyCourses = () => {
  uni.navigateTo({
    url: '/pages/mine/my-courses'
  })
}

// 跳转我的收藏
const goMyCollection = () => {
  uni.navigateTo({
    url: '/pages/mine/my-collection'
  })
}

// 跳转消息中心
const goMessages = () => {
  uni.navigateTo({
    url: '/pages/mine/messages'
  })
}

// 跳转企业员工管理
const goCorpEmployees = () => {
  uni.navigateTo({
    url: '/pages/corporate/employees'
  })
}

// 显示企业信息
const showCorpInfo = () => {
  const org = isCorpAdmin.value 
    ? userInfo.value.adminOrganizations[0] 
    : userInfo.value.organization
  
  if (!org) {
    uni.showToast({
      title: '暂无企业信息',
      icon: 'none'
    })
    return
  }
  
  const infoText = [
    `企业名称：${org.name}`,
    `可上课人数：${org.maxStudents || 0}人`,
    `总学分：${org.totalCredits || 0}`,
    `已使用学分：${org.usedCredits || 0}`,
    `剩余学分：${(org.totalCredits || 0) - (org.usedCredits || 0)}`
  ].join('\n')
  
  uni.showModal({
    title: '企业信息',
    content: infoText,
    showCancel: false,
    confirmText: '知道了'
  })
}

// 跳转课件下载
const goDownloadList = () => {
  uni.navigateTo({
    url: '/pages/mine/download-list'
  })
}

// 跳转AI报告
const goAIReport = () => {
  uni.navigateTo({
    url: '/pages/ai/report'
  })
}

// 联系客服
const contactService = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：40077-20111',
    confirmText: '拨打电话',
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: '40077-20111'
        })
      }
    }
  })
}

// 关于我们
const goAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index'
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

// 下拉刷新
onPullDownRefresh(() => {
  if (userStore.isLogin) {
    loadUserData().then(() => {
      uni.stopPullDownRefresh()
    })
  } else {
    uni.stopPullDownRefresh()
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

// 用户信息区域 - 优化版
.user-section {
  position: relative;
  background: linear-gradient(135deg, #C8161D 0%, #A0141A 100%);
  padding: 40rpx 32rpx 32rpx;
  overflow: hidden;
  
  // 背景装饰
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      
      &.circle-1 {
        width: 300rpx;
        height: 300rpx;
        top: -100rpx;
        right: -50rpx;
      }
      
      &.circle-2 {
        width: 200rpx;
        height: 200rpx;
        bottom: -50rpx;
        left: -30rpx;
      }
      
      &.circle-3 {
        width: 150rpx;
        height: 150rpx;
        top: 50%;
        right: 10%;
      }
    }
  }
  
  // 登录提示
  .login-prompt {
    position: relative;
    display: flex;
    align-items: center;
    padding: 40rpx 0;
    z-index: 1;
    
    .avatar-wrapper {
      position: relative;
      margin-right: 24rpx;
      
      .avatar {
        width: 136rpx;
        height: 136rpx;
        border-radius: 50%;
        border: 6rpx solid rgba(255, 255, 255, 0.2);
      }
      
      .avatar-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 136rpx;
        height: 136rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        filter: blur(20rpx);
        z-index: -1;
      }
    }
    
    .login-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .login-title {
        font-size: 36rpx;
        font-weight: 700;
        color: #fff;
      }
      
      .login-subtitle {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
  
  // 用户信息
  .user-info {
    position: relative;
    display: flex;
    align-items: center;
    padding: 40rpx 0;
    z-index: 1;
    
    .avatar-wrapper {
      position: relative;
      margin-right: 24rpx;
      
      .avatar {
        width: 136rpx;
        height: 136rpx;
        border-radius: 50%;
        border: 6rpx solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
      }
      
      .avatar-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 136rpx;
        height: 136rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        filter: blur(20rpx);
        z-index: -1;
      }
      
      .avatar-decoration {
        position: absolute;
        bottom: 4rpx;
        right: 4rpx;
        width: 40rpx;
        height: 40rpx;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        border-radius: 50%;
        border: 4rpx solid #C8161D;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
      }
      
      // 企业用户/管理员标识
      .user-badge {
        position: absolute;
        bottom: -8rpx;
        left: 50%;
        transform: translateX(-50%);
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        white-space: nowrap;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
        
        &.badge-admin {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        &.badge-user {
          background: linear-gradient(135deg, #1890FF 0%, #096dd9 100%);
        }
        
        .badge-text {
          font-size: 20rpx;
          font-weight: 600;
          color: #fff;
        }
      }
    }
    
    .user-detail {
      flex: 1;
      
      .user-name-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 12rpx;
        flex-wrap: wrap;
      }
      
      .user-name {
        font-size: 40rpx;
        font-weight: 700;
        color: #fff;
      }
      
      .org-tag {
        display: flex;
        align-items: center;
        gap: 6rpx;
        padding: 4rpx 12rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20rpx;
        backdrop-filter: blur(10rpx);
        
        .org-name {
          font-size: 22rpx;
          color: #fff;
          font-weight: 500;
        }
      }
      
      .user-company {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }
    
    .edit-btn {
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      backdrop-filter: blur(10rpx);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.9);
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
  
  // 学分卡片
  .credit-card {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20rpx);
    border-radius: 24rpx;
    padding: 32rpx 24rpx;
    margin-top: 32rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    z-index: 1;
    gap: 5px;
    .credit-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .credit-icon {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
      }
      
      .credit-content {
        flex: 1;
        
        .credit-value {
          font-size: 40rpx;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8rpx;
        }
        
        .credit-label {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .credit-tip {
          font-size: 20rpx;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 4rpx;
        }
      }
    }
    
    .credit-divider {
      width: 2rpx;
      height: 80rpx;
      margin: 0 10rpx;
      background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
    }
  }
}

// 功能菜单 - 优化版
.menu-section {
  margin: 32rpx 24rpx;
  
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24rpx;
    
    .menu-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32rpx 20rpx;
      background: #fff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      
      .menu-icon-wrapper {
        position: relative;
        width: 96rpx;
        height: 96rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 24rpx;
        margin-bottom: 16rpx;
        box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
        
        &.gradient-blue {
          background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
        }
        
        &.gradient-red {
          background: linear-gradient(135deg, #C8161D 0%, #A0141A 100%);
        }
        
        &.gradient-purple {
          background: linear-gradient(135deg, #722ED1 0%, #531DAB 100%);
        }
        
        &.gradient-green {
          background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
        }
        
        .icon-badge {
          position: absolute;
          top: -8rpx;
          right: -8rpx;
          min-width: 36rpx;
          height: 36rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8rpx;
          background: linear-gradient(135deg, #FF4757 0%, #f5222d 100%);
          color: #fff;
          font-size: 20rpx;
          font-weight: 700;
          border-radius: 18rpx;
          box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.4);
        }
      }
      
      .menu-label {
        font-size: 24rpx;
        font-weight: 600;
        color: #333;
        text-align: center;
      }
      
      &:active {
        transform: scale(0.95);
        box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
      }
    }
  }
}

// 企业功能区 - 优化版
.corp-section {
  margin: 0 24rpx 32rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12rpx;
    }
    
    .section-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #333;
    }
    
    .org-info {
      .org-name-text {
        font-size: 24rpx;
        color: #666;
        padding: 6rpx 16rpx;
        background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        border-radius: 20rpx;
      }
    }
  }
  
  .corp-cards {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    
    .corp-card {
      background: #fff;
      border-radius: 20rpx;
      padding: 28rpx 24rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16rpx;
        
        .card-icon {
          width: 88rpx;
          height: 88rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20rpx;
          box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
          
          &.gradient-purple {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.gradient-blue {
            background: linear-gradient(135deg, #1890FF 0%, #096dd9 100%);
          }
        }
        
        .card-badge {
          padding: 6rpx 16rpx;
          border-radius: 20rpx;
          font-size: 22rpx;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #FF6B6B 0%, #ff5252 100%);
          box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
        }
      }
      
      .card-content {
        margin-bottom: 16rpx;
        
        .card-title {
          font-size: 32rpx;
          font-weight: 700;
          color: #333;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .card-desc {
          font-size: 24rpx;
          color: #999;
          line-height: 1.6;
          display: block;
        }
      }
      
      .card-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8rpx;
        padding-top: 12rpx;
        border-top: 1rpx solid #f0f0f0;
        
        .card-link {
          font-size: 26rpx;
          font-weight: 600;
        }
      }
      
      &.admin-card {
        border: 2rpx solid #9C27B0;
        
        .card-footer .card-link {
          color: #9C27B0;
        }
      }
      
      &.user-card {
        border: 2rpx solid #1890FF;
        
        .card-footer .card-link {
          color: #1890FF;
        }
      }
    }
  }
}

// 快捷功能 - 优化版
.quick-actions {
  margin: 0 24rpx 32rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  
  .action-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    transition: all 0.3s ease;
    
    &:last-child {
      border-bottom: none;
    }
    
    .action-icon {
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
      border-radius: 16rpx;
      margin-right: 20rpx;
    }
    
    .action-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;
      
      .action-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }
      
      .action-desc {
        font-size: 22rpx;
        color: #999;
      }
    }
    
    .action-badge {
      padding: 6rpx 14rpx;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%);
      color: #fff;
      font-size: 20rpx;
      font-weight: 700;
      border-radius: 20rpx;
      margin-right: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.3);
    }
    
    &:active {
      background: #fafafa;
    }
  }
}

// 退出登录 - 优化版
.logout-section {
  padding: 0 24rpx 32rpx;
  
  .logout-btn {
    width: 100%;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    background: #fff;
    color: #C8161D;
    font-size: 30rpx;
    font-weight: 600;
    border-radius: 48rpx;
    border: 2rpx solid #C8161D;
    box-shadow: 0 4rpx 16rpx rgba(200, 22, 29, 0.15);
    transition: all 0.3s ease;
    
    text {
      color: #C8161D;
    }
    
    &:active {
      transform: scale(0.98);
      background: #FFF1F0;
    }
  }
}

// 底部间距
.page-footer {
  height: 48rpx;
}
</style>

