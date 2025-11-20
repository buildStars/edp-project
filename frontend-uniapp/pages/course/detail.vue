<template>
  <view class="page">
    <!-- 课程头部 - 优化版 -->
    <view class="course-header">
      <image :src="courseDetail.coverImage" class="course-cover" mode="aspectFill" />
      <view class="header-overlay">
        <view class="header-gradient"></view>
        <view class="header-badges">
          <view class="credit-badge">
            <Icon name="star" :size="32" color="#fff" />
            <text class="badge-text">{{ courseDetail.credit }}学分</text>
          </view>
          <view v-if="courseDetail.category" class="category-badge">
            <text>{{ getCategoryLabel(courseDetail.category) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 课程信息 - 优化版 -->
    <view class="course-info-section">
      <view class="course-title">{{ courseDetail.title }}</view>
      
      <view class="info-grid">
        <view class="info-card">
          <view class="info-icon-wrapper teacher-icon">
            <Icon name="user" :size="44" color="#C8161D" />
          </view>
          <view class="info-content">
            <view class="info-label">授课老师</view>
            <view class="info-value">{{ courseDetail.teacherName }}</view>
          </view>
        </view>
        
        <view class="info-card">
          <view class="info-icon-wrapper time-icon">
            <Icon name="time" :size="44" color="#667eea" />
          </view>
          <view class="info-content">
            <view class="info-label">上课时间</view>
            <view class="info-value">{{ formatTime(courseDetail.startTime) }}</view>
          </view>
        </view>
        
        <view class="info-card">
          <view class="info-icon-wrapper location-icon">
            <Icon name="location" :size="44" color="#f5576c" />
          </view>
          <view class="info-content">
            <view class="info-label">上课地点</view>
            <view class="info-value">{{ courseDetail.location }}</view>
          </view>
        </view>
        
        <view class="info-card">
          <view class="info-icon-wrapper status-icon">
            <Icon 
              :name="courseDetail.enrollStatus === 'OPEN' ? 'check' : 'close'" 
              :size="44" 
              :color="courseDetail.enrollStatus === 'OPEN' ? '#52C41A' : '#999'" 
            />
          </view>
          <view class="info-content">
            <view class="info-label">报名状态</view>
            <view class="info-value" :class="{ 'status-closed': courseDetail.enrollStatus === 'CLOSED' }">
              {{ courseDetail.enrollStatus === 'OPEN' ? '报名中' : '已截止' }}
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 课程介绍 - 优化版 -->
    <view class="section introduction-section">
      <view class="section-header">
        <view class="section-icon">
          <Icon name="course" :size="40" color="#C8161D" />
        </view>
        <view class="section-title-wrapper">
          <text class="section-title">课程介绍</text>
          <text class="section-subtitle">Course Introduction</text>
        </view>
      </view>
      <view class="section-content">
        <rich-text :nodes="courseDetail.introduction"></rich-text>
      </view>
    </view>
    
    <!-- 讲师介绍 - 优化版 -->
    <view class="section teacher-section">
      <view class="section-header">
        <view class="section-icon">
          <Icon name="user" :size="40" color="#C8161D" />
        </view>
        <view class="section-title-wrapper">
          <text class="section-title">讲师介绍</text>
          <text class="section-subtitle">Teacher Introduction</text>
        </view>
      </view>
      <view class="teacher-card">
        <view class="teacher-avatar-wrapper">
          <image :src="courseDetail.teacherAvatar" class="teacher-avatar" />
          <view class="avatar-decoration"></view>
        </view>
        <view class="teacher-info">
          <view class="teacher-name">{{ courseDetail.teacherName }}</view>
          <view class="teacher-title">{{ courseDetail.teacherTitle }}</view>
        </view>
      </view>
      <view class="section-content">
        <rich-text :nodes="courseDetail.teacherIntro"></rich-text>
      </view>
    </view>
    
    <!-- 章节介绍 -->
    <view class="section chapters-section">
      <view class="section-header">
        <view class="section-icon">
          <Icon name="course" :size="40" color="#C8161D" />
        </view>
        <view class="section-title-wrapper">
          <text class="section-title">章节介绍</text>
          <text class="section-subtitle">Chapters</text>
        </view>
      </view>
      <view v-if="chapterList.length > 0" class="chapters-list">
        <view 
          v-for="(chapter, index) in chapterList" 
          :key="chapter.id"
          class="chapter-item"
        >
          <view class="chapter-number">{{ index + 1 }}</view>
          <view class="chapter-title">{{ chapter.title }}</view>
        </view>
      </view>
      <view v-else class="empty-chapters">
        <text>暂无章节</text>
      </view>
    </view>
    
    <!-- 底部操作栏 - 优化版 -->
    <view class="action-bar">
      <view class="action-container">
        <view class="credit-info" v-if="userStore.isLogin">
          <view class="credit-icon">
            <Icon name="star" :size="40" color="#C8161D" />
          </view>
          <view class="credit-content">
            <text class="credit-label">剩余学分</text>
            <text class="credit-value">{{ userStore.remainingCredits }}</text>
          </view>
        </view>
        <view class="action-btns">
          <!-- 进行中 -->
          <view v-if="courseDetail.isEnrolled && courseDetail.enrollmentStatus !== 'COMPLETED'" class="enrolled-actions">
            <button class="btn-enrolled-tag" disabled>
              <Icon name="check" :size="28" color="#52C41A" />
              <text>进行中</text>
            </button>
            
            <!-- 退课审核中状态 -->
            <button v-if="courseDetail.refundStatus === 'PENDING'" class="btn-refunding" disabled>
              <Icon name="time" :size="28" color="#FF9800" />
              <text>退课审核中</text>
            </button>
            
            <!-- 签到按钮 - 只在有活跃签到会话且未签到时显示 -->
            <button 
              v-if="!courseDetail.refundStatus && checkinSession.hasActiveSession && !checkinSession.alreadyCheckedIn"
              class="btn-checkin"
              @click="showCheckinModal"
            >
              <Icon name="check" :size="32" color="#fff" />
              <text>立即签到</text>
            </button>
            
            <!-- 更多操作按钮 -->
            <view v-if="!courseDetail.refundStatus" class="more-actions">
              <button 
                v-if="canRefund" 
                class="btn-refund"
                @click="handleRefund"
              >
                退课
              </button>
              <button 
                class="btn-gift"
                @click="handleGift"
              >
                赠送
              </button>
            </view>
          </view>
          
          <!-- 已完成 -->
          <view v-else-if="courseDetail.isEnrolled && courseDetail.enrollmentStatus === 'COMPLETED'" class="enrolled-actions">
            <button class="btn-completed-tag" disabled>
              <Icon name="check" :size="28" color="#1890FF" />
              <text>已完成</text>
            </button>
            
            <!-- 查看结课海报按钮 -->
            <button 
              class="btn-poster"
              @click="handleViewCompletionPoster"
            >
              <Icon name="star" :size="24" color="#fff" />
              结课海报
            </button>
          </view>
          
          <!-- 未报名或已截止 -->
          <button v-else-if="courseDetail.enrollStatus === 'CLOSED'" class="btn-closed" disabled>
            <Icon name="close" :size="36" color="#fff" />
            <text>已截止</text>
          </button>
          <button v-else class="btn-enroll" @click="handleEnroll">
            <Icon name="star" :size="36" color="#fff" />
            <text>立即报名</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 签到弹窗 -->
    <view v-if="showCheckinPopup" class="popup-mask" @click="closeCheckinPopup">
      <view class="checkin-modal" @click.stop>
        <view class="modal-title">章节签到</view>
        <view class="modal-subtitle">请输入老师告知的6位数字签到码</view>
        
        <!-- 签到码输入框 -->
        <view class="code-input-section">
          <input
            v-model="checkinCode"
            type="number"
            maxlength="6"
            placeholder="请输入6位签到码"
            class="code-input"
            @confirm="submitCode"
          />
          <button class="btn-submit-code" @click="submitCode">立即签到</button>
        </view>
        
        <button class="btn-cancel-modal" @click="closeCheckinPopup">
          取消
        </button>
      </view>
    </view>

    <!-- 结课海报组件 -->
    <CompletionPoster
      :visible="showCompletionPoster"
      :posterData="posterData"
      @close="handleClosePoster"
      @share="handleSharePoster"
      @confirm="handleConfirmPoster"
    />
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getCourseDetail, enrollCourse } from '@/api/course'
import { getActiveCheckinSession, checkinByCode } from '@/api/checkin'
import { createEnrollmentRequest } from '@/api/enrollment-request'
import { createRefundRequest } from '@/api/refund-request'
import { generateGiftCode } from '@/api/course-gift'
import { getMyCourseEvaluation } from '@/api/evaluation'
import { getChapters } from '@/api/chapter'
import { getCompletionPoster } from '@/api/completion-poster'
import { formatTime } from '@/utils/util'
import { useUserStore } from '@/store/user'
import Icon from '@/components/icon/icon.vue'
import CompletionPoster from '@/components/completion-poster/completion-poster.vue'

// 获取分类标签
const getCategoryLabel = (category) => {
  const categoryMap = {
    'ACCELERATE': '加速课堂',
    'MASTER': '大师课堂',
    'EMPOWER': '赋能课堂'
  }
  return categoryMap[category] || category
}

// 课程详情（初始化为包含默认值的对象，防止渲染报错）
const courseDetail = ref({
  title: '',
  coverImage: '',
  credit: 0,
  teacherName: '',
  teacherAvatar: '',
  teacherTitle: '',
  teacherIntro: '',
  startTime: '',
  location: '',
  enrollStatus: 'CLOSED',
  introduction: '',
  isEnrolled: false,
  hasEvaluated: false  // 是否已评价
})

// 课程ID
const courseId = ref('')
const giftCodeForShare = ref('') // 用于分享的礼物码
const isShareFromPoster = ref(false) // 是否从结课海报分享

// 章节列表
const chapterList = ref([])

// 用户store
const userStore = useUserStore()

// 签到相关
const showCheckinPopup = ref(false)
const checkinSession = ref({
  hasActiveSession: false,
  canCheckin: false,
  alreadyCheckedIn: false,
  remainingMinutes: 0
})
const checkinCode = ref('')

// 结课海报相关
const showCompletionPoster = ref(false)
const posterData = ref({
  userName: '',
  courseName: '',
  teacherName: '',
  completionDate: new Date(),
  courseCredit: 0,
  achievementCredit: 0,
  checkinCount: 0,
  coverImage: '',
  isFirstTime: false
})

// 页面加载
onLoad(async (options) => {
  if (options.id) {
    courseId.value = options.id
    await loadCourseDetail()
    
    // 检查并显示结课海报
    await checkAndShowCompletionPoster()
  }
})

// 监听评价提交事件
uni.$on('evaluationSubmitted', async () => {
  await loadCourseDetail()
})

// 页面卸载时移除监听
onUnmounted(() => {
  uni.$off('evaluationSubmitted')
})

// 加载课程详情
const loadCourseDetail = async () => {
  uni.showLoading({
    title: '加载中...'
  })
  
  try {
    const data = await getCourseDetail(courseId.value)
    console.log('📚 课程详情数据:', data)
    console.log('📌 isEnrolled 字段:', data.isEnrolled)
    courseDetail.value = data
    
    // 加载章节列表（所有人都可以看）
    loadChapterList()
    
    // 如果已报名，加载签到会话信息
    if (data.isEnrolled && userStore.isLogin) {
      fetchActiveCheckinSession()
    }
  } catch (error) {
    console.error('加载课程详情失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 加载章节列表
const loadChapterList = async () => {
  try {
    console.log('📖 开始加载章节列表，courseId:', courseId.value)
    console.log('👤 当前用户登录状态:', userStore.isLogin)
    console.log('🔑 当前 token:', uni.getStorageSync('token') ? '已有token' : '无token')
    
    const res = await getChapters({
      courseId: courseId.value,
      status: 'PUBLISHED' // 只显示已发布的章节
    })
    
    console.log('📚 章节列表返回数据:', JSON.stringify(res, null, 2))
    
    // 检查每个章节的签到状态
    if (res.items && res.items.length > 0) {
      res.items.forEach((chapter, index) => {
        console.log(`章节 ${index + 1}: ${chapter.title}`)
        console.log(`  - hasCheckedIn: ${chapter.hasCheckedIn}`)
        console.log(`  - hasEvaluated: ${chapter.hasEvaluated}`)
      })
    }
    
    chapterList.value = res.items || []
    console.log('✅ 章节列表更新完成，共', chapterList.value.length, '个章节')
  } catch (error) {
    console.error('❌ 加载章节列表失败:', error)
  }
}

// 获取活跃签到会话
const fetchActiveCheckinSession = async () => {
  try {
    const data = await getActiveCheckinSession(courseId.value)
    checkinSession.value = data
    
    // 如果有活跃会话，定时刷新
    if (data.hasActiveSession && data.canCheckin) {
      setTimeout(fetchActiveCheckinSession, 60000) // 每分钟刷新一次
    }
  } catch (error) {
    console.error('获取签到会话失败：', error)
  }
}

// 显示签到弹窗
const showCheckinModal = () => {
  checkinCode.value = ''
  showCheckinPopup.value = true
}

// 关闭签到弹窗
const closeCheckinPopup = () => {
  showCheckinPopup.value = false
  checkinCode.value = ''
}

// 二维码签到功能已移除，现在只使用数字码签到

// 签到码签到
const submitCode = async () => {
  if (!checkinCode.value || checkinCode.value.length !== 6) {
    uni.showToast({ title: '请输入6位签到码', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '签到中...' })
    console.log('📤 发起签到请求:', {
      courseId: courseId.value,
      code: checkinCode.value
    })
    
    const result = await checkinByCode({
      courseId: courseId.value,
      code: checkinCode.value
    })
    
    console.log('✅ 签到成功，返回数据:', result)
    uni.hideLoading()
    
    // 关闭弹窗并刷新状态
    closeCheckinPopup()
    checkinSession.value.alreadyCheckedIn = true
    checkinSession.value.canCheckin = false
    
    // 重新加载课程详情以刷新评价状态
    await loadCourseDetail()
    
    // 重新加载章节列表以更新签到状态
    await loadChapterList()
    
    // 显示签到成功提示（不再自动跳转评价页面）
    uni.showToast({ 
      title: result.message || '签到成功', 
      icon: 'success',
      duration: 2000
    })
    
  } catch (error) {
    console.error('❌ 签到失败:', error)
    uni.hideLoading()
    uni.showToast({ 
      title: error.msg || error.message || '签到失败', 
      icon: 'none' 
    })
  }
}

// 处理报名
const handleEnroll = async () => {
  // 检查登录状态
  if (!userStore.checkLogin()) {
    return
  }
  
  // 获取最新学分信息
  try {
    await userStore.fetchCredits()
  } catch (error) {
    console.error('获取学分失败：', error)
  }
  
  // 检查学分是否足够
  const needCredit = courseDetail.value.credit || 0
  const currentCredit = userStore.remainingCredits || 0
  
  if (currentCredit < needCredit) {
    // 学分不足，显示申请弹窗
    showEnrollmentRequestDialog()
    return
  }
  
  // 学分充足，确认报名
  confirmEnroll()
}

// 显示试听申请对话框
const showEnrollmentRequestDialog = () => {
  const needCredit = courseDetail.value.credit || 0
  const currentCredit = userStore.remainingCredits || 0
  
  uni.showModal({
    title: '学分不足',
    content: `本课程需要 ${needCredit} 学分，您当前剩余 ${currentCredit} 学分。\n\n您可以申请试听课程，课程顾问将与您联系安排试听。`,
    confirmText: '申请试听',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 跳转到试听申请页面
        uni.navigateTo({
          url: `/pages/enrollment-request/create?courseId=${courseId.value}`
        })
      }
    }
  })
}

// 确认报名
const confirmEnroll = () => {
  const needCredit = courseDetail.value.credit || 0
  const currentCredit = userStore.remainingCredits || 0
  const remainingAfterEnroll = currentCredit - needCredit
  
  uni.showModal({
    title: '确认报名',
    content: `本次课程需要消耗 ${needCredit} 学分\n当前剩余学分：${currentCredit}\n报名后剩余：${remainingAfterEnroll}\n\n确认报名吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '报名中...'
          })
          
          const result = await enrollCourse(courseId.value)
          
          uni.hideLoading()
          
          // 新API返回格式：{ success, message, enrollment?, needCredit? }
          if (!result.success && result.needCredit) {
            // 学分不足（理论上不会走到这里，因为前面已检查）
            showEnrollmentRequestDialog()
            return
          }
          
          if (result.success) {
            // 报名成功
            uni.showToast({
              title: result.message || '报名成功',
              icon: 'success'
            })
            
            // 刷新学分信息和课程详情
            await Promise.all([
              userStore.fetchCredits(),
              loadCourseDetail()
            ])
          }
        } catch (error) {
          uni.hideLoading()
          console.error('报名失败：', error)
          uni.showToast({
            title: error.msg || '报名失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 计算是否可以退课
const canRefund = computed(() => {
  if (!courseDetail.value.isEnrolled) return false
  if (courseDetail.value.isGift) return false // 赠送的课程不能退
  
  const now = new Date()
  const courseStart = new Date(courseDetail.value.startTime)
  const daysDiff = Math.ceil((courseStart - now) / (1000 * 60 * 60 * 24))
  
  return daysDiff > 3 // 开课前3天以外才能退课（即必须 > 3天）
})

// 处理退课
const handleRefund = () => {
  const now = new Date()
  const courseStart = new Date(courseDetail.value.startTime)
  const daysDiff = Math.ceil((courseStart - now) / (1000 * 60 * 60 * 24))
  
  if (daysDiff <= 3) {
    uni.showToast({
      title: `开课前3天内不能退课，当前距离开课还有${daysDiff}天`,
      icon: 'none',
      duration: 3000
    })
    return
  }
  
  uni.showModal({
    title: '确认退课',
    content: `退课后将退回 ${courseDetail.value.credit} 学分，确认退课吗？`,
    success: async (res) => {
      if (res.confirm) {
        // 跳转到退课申请页面
        uni.navigateTo({
          url: `/pages/refund-request/create?courseId=${courseId.value}`
        })
      }
    }
  })
}

// 处理赠送
const handleGift = async () => {
  try {
    uni.showLoading({ title: '生成中...' })
    
    // 调用接口生成礼物码
    const res = await generateGiftCode({
      courseId: courseId.value,
      message: `推荐您学习《${courseDetail.value.title}》`
    })
    
    uni.hideLoading()
    
    if (res.giftCode) {
      // 保存礼物码到页面data，用于onShareAppMessage
      giftCodeForShare.value = res.giftCode
      
      // 检测运行环境
      // #ifdef MP-WEIXIN
      // 微信小程序环境
      uni.showModal({
        title: '课程赠送',
        content: `已生成礼物码，点击确定后请点击右上角"..."分享给好友。好友领取后即可免费学习此课程。`,
        confirmText: '知道了',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 显示分享菜单（仅微信小程序支持）
            uni.showShareMenu({
              withShareTicket: true,
              menus: ['shareAppMessage', 'shareTimeline']
            })
            
            uni.showToast({
              title: '请点击右上角"..."分享',
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
      // #endif
      
      // #ifdef H5
      // H5 环境 - 显示礼物码供用户复制
      uni.showModal({
        title: '课程赠送',
        content: `礼物码：${res.giftCode}\n\n请将礼物码分享给好友，好友可在小程序中输入礼物码领取课程。\n\n点击确定复制礼物码。`,
        confirmText: '复制礼物码',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 复制礼物码
            uni.setClipboardData({
              data: res.giftCode,
              success: () => {
                uni.showToast({
                  title: '礼物码已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
      // #endif
      
      // #ifdef APP-PLUS
      // App 环境 - 显示礼物码
      uni.showModal({
        title: '课程赠送',
        content: `礼物码：${res.giftCode}\n\n请将礼物码分享给好友。`,
        confirmText: '复制礼物码',
        success: (modalRes) => {
          if (modalRes.confirm) {
            uni.setClipboardData({
              data: res.giftCode,
              success: () => {
                uni.showToast({
                  title: '礼物码已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
      // #endif
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.msg || '生成失败',
      icon: 'none'
    })
  }
}

// 处理评价
const handleEvaluate = () => {
  uni.navigateTo({
    url: `/pages/evaluation/create?courseId=${courseId.value}`
  })
}

// 查看课件
const handleViewMaterials = () => {
  uni.navigateTo({
    url: `/pages/materials/list?courseId=${courseId.value}&courseTitle=${encodeURIComponent(courseDetail.value.title)}`
  })
}

// 检查并显示结课海报
const checkAndShowCompletionPoster = async () => {
  console.log('🎨 checkAndShowCompletionPoster 开始')
  console.log('   - isLogin:', userStore.isLogin)
  console.log('   - isEnrolled:', courseDetail.value.isEnrolled)
  console.log('   - enrollmentStatus:', courseDetail.value.enrollmentStatus)
  
  if (!userStore.isLogin || !courseDetail.value.isEnrolled) {
    console.log('❌ 未登录或未报名，跳过海报检查')
    return
  }
  
  // 只有已完成的课程才检查海报
  if (courseDetail.value.enrollmentStatus !== 'COMPLETED') {
    console.log('❌ 课程未完成，跳过海报检查')
    return
  }
  
  try {
    console.log('📡 开始获取结课海报...')
    const data = await getCompletionPoster(courseId.value)
    console.log('✅ 获取海报成功:', data)
    
    // 如果是第一次查看，自动弹出海报
    if (data.isFirstTime) {
      console.log('🎉 首次查看，弹出海报！')
      posterData.value = data
      showCompletionPoster.value = true
      console.log('📊 posterData:', posterData.value)
      console.log('📊 showCompletionPoster:', showCompletionPoster.value)
      
      // 使用 nextTick 确保 DOM 更新
      nextTick(() => {
        console.log('🔄 nextTick - showCompletionPoster:', showCompletionPoster.value)
      })
    } else {
      console.log('ℹ️ 非首次查看，不自动弹出')
    }
  } catch (error) {
    // 如果课程未结课或其他错误，静默失败
    console.log('❌ 获取结课海报失败：', error.msg || error.message)
  }
}

// 手动查看结课海报
const handleViewCompletionPoster = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const data = await getCompletionPoster(courseId.value)
    posterData.value = data
    showCompletionPoster.value = true
    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.msg || '加载失败',
      icon: 'none'
    })
  }
}

// 关闭海报
const handleClosePoster = () => {
  showCompletionPoster.value = false
}

// 确认海报
const handleConfirmPoster = () => {
  showCompletionPoster.value = false
  isShareFromPoster.value = false // 重置分享标志
}

// 分享海报
const handleSharePoster = () => {
  isShareFromPoster.value = true
  // 小程序会自动调用 onShareAppMessage
  // 关闭海报，让用户看到分享菜单
  showCompletionPoster.value = false
  
  // 延迟重置标志，确保分享完成
  setTimeout(() => {
    isShareFromPoster.value = false
  }, 3000)
}

// 微信小程序分享配置（仅在小程序环境生效）
// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  if (isShareFromPoster.value) {
    // 分享结课海报
    return {
      title: `我刚完成了《${courseDetail.value.title}》课程学习！`,
      path: `/pages/course/detail?id=${courseId.value}`,
      imageUrl: courseDetail.value.coverImage || ''
    }
  } else if (giftCodeForShare.value) {
    // 分享课程礼物
    return {
      title: `送你一门课程：${courseDetail.value.title}`,
      path: `/pages/course-gift/claim?code=${giftCodeForShare.value}`,
      imageUrl: courseDetail.value.coverImage || ''
    }
  } else {
    // 普通分享
    return {
      title: courseDetail.value.title || '精彩课程',
      path: `/pages/course/detail?id=${courseId.value}`,
      imageUrl: courseDetail.value.coverImage || ''
    }
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  if (giftCodeForShare.value) {
    return {
      title: `送你一门课程：${courseDetail.value.title}`,
      query: `code=${giftCodeForShare.value}`,
      imageUrl: courseDetail.value.coverImage || ''
    }
  } else {
    return {
      title: courseDetail.value.title || '精彩课程',
      query: `id=${courseId.value}`,
      imageUrl: courseDetail.value.coverImage || ''
    }
  }
})
// #endif
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: calc(360rpx + env(safe-area-inset-bottom));
}

// 课程头部 - 优化版
.course-header {
  position: relative;
  width: 100%;
  height: 480rpx;
  overflow: hidden;
  
  .course-cover {
    width: 100%;
    height: 100%;
  }
  
  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    .header-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200rpx;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
    }
    
    .header-badges {
      position: absolute;
      top: 32rpx;
      right: 32rpx;
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      
      .credit-badge {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 12rpx 24rpx;
        background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
        border-radius: 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(200, 22, 29, 0.4);
        backdrop-filter: blur(10rpx);
        
        .badge-text {
          font-size: 26rpx;
          font-weight: 700;
          color: #fff;
        }
      }
      
      .category-badge {
        padding: 8rpx 20rpx;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 20rpx;
        backdrop-filter: blur(10rpx);
        
        text {
          font-size: 24rpx;
          font-weight: 600;
          color: #C8161D;
        }
      }
    }
  }
}

// 课程信息 - 优化版
.course-info-section {
  background: #fff;
  padding: 32rpx 24rpx;
  margin-bottom: 24rpx;
  
  .course-title {
    font-size: 40rpx;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.5;
    margin-bottom: 32rpx;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    
    .info-card {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
      border-radius: 16rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      
      .info-icon-wrapper {
        width: 72rpx;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16rpx;
        margin-right: 16rpx;
        flex-shrink: 0;
        
        &.teacher-icon {
          background: linear-gradient(135deg, rgba(200, 22, 29, 0.1) 0%, rgba(200, 22, 29, 0.05) 100%);
        }
        
        &.time-icon {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
        }
        
        &.location-icon {
          background: linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(245, 87, 108, 0.05) 100%);
        }
        
        &.status-icon {
          background: linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%);
        }
      }
      
      .info-content {
        flex: 1;
        min-width: 0;
        
        .info-label {
          font-size: 22rpx;
          color: #999;
          margin-bottom: 8rpx;
        }
        
        .info-value {
          font-size: 26rpx;
          font-weight: 600;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          
          &.status-closed {
            color: #999;
          }
        }
      }
      
      &:active {
        transform: scale(0.98);
      }
    }
  }
}

// 内容区块 - 优化版
.section {
  background: #fff;
  padding: 32rpx;
  margin: 0 24rpx 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .section-icon {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16rpx;
      background: linear-gradient(135deg, rgba(200, 22, 29, 0.1) 0%, rgba(200, 22, 29, 0.05) 100%);
    }
    
    .section-title-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .section-title {
        font-size: 34rpx;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1.2;
      }
      
      .section-subtitle {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
        text-transform: uppercase;
        letter-spacing: 1rpx;
      }
    }
  }
  
  .section-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 24rpx 0;
      border-radius: 12rpx;
    }
    
    :deep(p) {
      margin: 16rpx 0;
    }
  }
}

// 讲师卡片 - 优化版
.teacher-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  
  .teacher-avatar-wrapper {
    position: relative;
    margin-right: 24rpx;
    
    .teacher-avatar {
      width: 128rpx;
      height: 128rpx;
      border-radius: 50%;
      border: 4rpx solid #fff;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    }
    
    .avatar-decoration {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 36rpx;
      height: 36rpx;
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      border-radius: 50%;
      border: 4rpx solid #fff;
      box-shadow: 0 2rpx 8rpx rgba(200, 22, 29, 0.3);
    }
  }
  
  .teacher-info {
    flex: 1;
    
    .teacher-name {
      font-size: 32rpx;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12rpx;
    }
    
    .teacher-title {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
    }
  }
}

// 章节介绍
.chapters-section {
  .chapters-list {
    .chapter-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      transition: all 0.3s ease;
      
      .chapter-number {
        flex-shrink: 0;
        width: 56rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
        border-radius: 12rpx;
        font-size: 28rpx;
        font-weight: 700;
        color: #fff;
        margin-right: 20rpx;
        box-shadow: 0 4rpx 12rpx rgba(200, 22, 29, 0.25);
      }
      
      .chapter-title {
        flex: 1;
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        line-height: 1.6;
      }
    }
  }
  
  .empty-chapters {
    padding: 80rpx 0;
    text-align: center;
    font-size: 28rpx;
    color: #999;
  }
}

// 底部操作栏 - 优化版
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
  z-index: 100;
  
  .action-container {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }
  
  .credit-info {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background: linear-gradient(135deg, rgba(200, 22, 29, 0.1) 0%, rgba(200, 22, 29, 0.05) 100%);
    border-radius: 16rpx;
    
    .credit-icon {
      margin-right: 12rpx;
    }
    
    .credit-content {
      display: flex;
      flex-direction: column;
      
      .credit-label {
        font-size: 22rpx;
        color: #999;
        margin-bottom: 4rpx;
      }
      
      .credit-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #C8161D;
      }
    }
  }
  
  .action-btns {
    flex: 1;
    
    button {
      width: 100%;
      height: 96rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      font-size: 30rpx;
      font-weight: 600;
      border-radius: 48rpx;
      border: none;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      
      text {
        color: inherit;
      }
      
      &:active {
        transform: scale(0.96);
      }
    }
    
    .enrolled-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      width: 100%;
      
      // 统一按钮样式
      button {
        height: 56rpx;
        font-size: 24rpx;
        padding: 0 20rpx;
        border-radius: 28rpx;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6rpx;
    
        min-width: 0;
      }
      
      .btn-enrolled-tag {
        background-color: #F6FFED;
        color: #52C41A;
        border: 2rpx solid #B7EB8F;
        box-shadow: none;
      }
      
      .btn-completed-tag {
        background-color: #E6F7FF;
        color: #1890FF;
        border: 2rpx solid #91D5FF;
        box-shadow: none;
      }
      
      .btn-refunding {
        background-color: #FFF7E6;
        color: #FF9800;
        border: 2rpx solid #FFD591;
        box-shadow: none;
      }
      
      .btn-checkin {
        background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(200, 22, 29, 0.3);
        animation: pulse 2s infinite;
        flex: 0 0 100%;
        min-width: 0;
      }
      
      .btn-checked-in {
        background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
      }
      
      .btn-chapters {
        background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
        color: #fff;
        border: none;
        box-shadow: 0 4rpx 12rpx rgba(200, 22, 29, 0.3);
        font-weight: 600;
        flex: 0 0 100%;
      }
      
      .more-actions {
        display: flex;
        gap: 12rpx;
        width: 100%;
        
        button {
          flex: 1;
          height: 52rpx;
          font-size: 24rpx;
        }
        
        .btn-refund {
          background: linear-gradient(135deg, #FA8C16 0%, #FFA940 100%);
          color: #fff;
          box-shadow: 0 3rpx 10rpx rgba(250, 140, 22, 0.3);
        }
        
        .btn-gift {
          background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
          color: #fff;
          box-shadow: 0 3rpx 10rpx rgba(114, 46, 209, 0.3);
        }
        
        .btn-poster {
          background: linear-gradient(135deg, #FFB22B 0%, #FFCB42 100%);
          color: #fff;
          box-shadow: 0 3rpx 10rpx rgba(255, 178, 43, 0.3);
          display: flex;
          align-items: center;
          gap: 6rpx;
        }
      }
    }
    
    .btn-enroll {
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      color: #fff;
      box-shadow: 0 6rpx 20rpx rgba(200, 22, 29, 0.4);
    }
    
    .btn-closed {
      background: linear-gradient(135deg, #999 0%, #bbb 100%);
      color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 6rpx 20rpx rgba(200, 22, 29, 0.4);
  }
  50% {
    box-shadow: 0 8rpx 24rpx rgba(200, 22, 29, 0.6);
  }
  100% {
    box-shadow: 0 6rpx 20rpx rgba(200, 22, 29, 0.4);
  }
}

// 弹窗遮罩
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

// 签到弹窗样式
.checkin-modal {
  width: 560rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  animation: modalSlideIn 0.3s ease;
  
  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 16rpx;
  }
  
  .checkin-method-btn {
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    padding: 32rpx;
    background-color: #f8f8f8;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    border: 2rpx solid #f0f0f0;
    transition: all 0.3s ease;
    
    &:active {
      background-color: #FFF1F0;
      border-color: #C8161D;
    }
    
    .method-icon {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #FFF1F0;
      border-radius: 50%;
      margin-right: 24rpx;
    }
    
    .method-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      
      .method-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .method-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .modal-subtitle {
    font-size: 26rpx;
    color: #999;
    text-align: center;
    margin-bottom: 32rpx;
    line-height: 1.5;
  }
  
  .code-input-section {
    margin-top: 24rpx;
    
    .input-label {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 12rpx;
    }
    
    .code-input {
      width: 100%;
      height: 80rpx;
      padding: 0 20rpx;
      font-size: 32rpx;
      font-weight: 600;
      text-align: center;
      letter-spacing: 8rpx;
      background-color: #f8f8f8;
      border-radius: 12rpx;
      border: 2rpx solid #e0e0e0;
      margin-bottom: 20rpx;
      
      &:focus {
        border-color: #C8161D;
        background-color: #fff;
      }
    }
    
    .btn-submit-code {
      width: 100%;
      height: 72rpx;
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      color: #fff;
      font-size: 28rpx;
      font-weight: 600;
      border-radius: 36rpx;
      border: none;
      box-shadow: 0 4rpx 16rpx rgba(200, 22, 29, 0.3);
    }
  }
  
  .btn-cancel-modal {
    width: 100%;
    height: 64rpx;
    margin-top: 16rpx;
    background-color: #f5f5f5;
    color: #666;
    font-size: 26rpx;
    border-radius: 32rpx;
    border: none;
  }
}

// 弹窗动画
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>

