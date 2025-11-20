<template>
  <div class="course-checkins">
    <!-- 实时签到详情模式 -->
    <div v-if="sessionId" class="checkin-session-detail">
      <el-page-header @back="handleBack">
        <template #content>
          <div class="page-title-wrapper">
            <span class="page-title">{{ courseTitle }} - 实时签到</span>
            <el-tag v-if="activeSession?.chapter" type="primary" class="chapter-tag">
              <el-icon><Reading /></el-icon>
              {{ activeSession.chapter.title }}
            </el-tag>
            <el-tag v-else type="info" class="chapter-tag">
              <el-icon><List /></el-icon>
              课程级签到
            </el-tag>
          </div>
        </template>
      </el-page-header>

      <!-- 签到控制面板 -->
      <el-card v-if="activeSession" class="checkin-panel mt-20">
        <template #header>
          <div class="panel-header">
            <div class="header-left">
              <el-tag v-if="activeSession.isActive" type="success" size="large">
                <el-icon><Checked /></el-icon>
                签到进行中
              </el-tag>
              <el-tag v-else type="info" size="large">
                <el-icon><CircleCheck /></el-icon>
                签到已结束
              </el-tag>
              <span class="course-name">{{ courseTitle }}</span>
            </div>
            <div class="header-right">
              <el-button
                v-if="activeSession.isActive"
                type="danger"
                :icon="Close"
                @click="handleStopCheckin"
              >
                结束签到
              </el-button>
              <el-button :icon="Refresh" @click="refreshStatistics">
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <!-- 左侧：签到码和倒计时 -->
          <el-col :span="8">
            <div class="qr-section">
              <h3>签到方式</h3>
              
              <!-- 签到码 -->
              <div class="checkin-code-wrapper">
                <div class="code-title">数字签到码</div>
                <div class="code-display">{{ activeSession.code }}</div>
                <div class="code-hint">请向学员口头告知或板书展示此6位数字</div>
              </div>

              <!-- 倒计时（仅进行中显示） -->
              <div v-if="activeSession.isActive" class="countdown-wrapper">
                <div class="countdown-title">
                  <el-icon><Timer /></el-icon>
                  <span>剩余时间</span>
                </div>
                <div class="countdown-time">{{ formattedRemainingTime }}</div>
              </div>
              
              <!-- 已结束提示 -->
              <div v-else class="finished-wrapper">
                <el-alert
                  title="签到已结束"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <div style="line-height: 1.6">
                      <p>开始时间：{{ formatDate(activeSession.startTime) }}</p>
                      <p>结束时间：{{ formatDate(activeSession.endTime) }}</p>
                    </div>
                  </template>
                </el-alert>
              </div>
            </div>
          </el-col>

          <!-- 右侧：签到统计 -->
          <el-col :span="16">
            <div class="statistics-section">
              <h3>签到统计</h3>
              
              <!-- 统计卡片 -->
              <div class="stat-cards">
                <div class="stat-card total">
                  <div class="stat-icon">
                    <el-icon><UserFilled /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ statistics?.statistics.totalStudents || 0 }}</div>
                    <div class="stat-label">应到人数</div>
                  </div>
                </div>
                
                <div class="stat-card checked">
                  <div class="stat-icon">
                    <el-icon><CircleCheck /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ statistics?.statistics.checkedIn || 0 }}</div>
                    <div class="stat-label">已签到</div>
                  </div>
                </div>
                
                <div class="stat-card unchecked">
                  <div class="stat-icon">
                    <el-icon><CircleClose /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ statistics?.statistics.notCheckedIn || 0 }}</div>
                    <div class="stat-label">未签到</div>
                  </div>
                </div>
                
                <div class="stat-card rate">
                  <div class="stat-icon">
                    <el-icon><TrendCharts /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ statistics?.statistics.checkinRate || '0%' }}</div>
                    <div class="stat-label">签到率</div>
                  </div>
                </div>
              </div>

              <!-- 签到名单标签页 -->
              <el-tabs v-model="activeTab" class="checkin-tabs">
                <el-tab-pane label="已签到" name="checked">
                  <div class="checkin-list">
                    <el-empty 
                      v-if="!statistics?.checkinList.length"
                      description="暂无签到记录"
                      :image-size="100"
                    />
                    <div
                      v-for="(item, index) in statistics?.checkinList"
                      :key="item.userId"
                      class="checkin-item"
                    >
                      <div class="item-index">{{ index + 1 }}</div>
                      <el-avatar :src="item.avatar" :size="40">
                        {{ item.userName?.charAt(0) || '学' }}
                      </el-avatar>
                      <div class="item-info">
                        <div class="item-name">{{ item.userName }}</div>
                        <div class="item-time">
                          {{ formatDateTime(item.checkinTime) }}
                        </div>
                      </div>
                      <el-tag 
                        :type="item.method === 'MAKEUP' ? 'warning' : 'success'" 
                        size="small"
                      >
                        {{ item.method === 'MAKEUP' ? '补签' : '签到码' }}
                      </el-tag>
                    </div>
                  </div>
                </el-tab-pane>

              <el-tab-pane label="未签到" name="unchecked">
                <template #label>
                  <span>未签到</span>
                  <el-button
                    v-if="activeSession.isActive && statistics?.notCheckinList.length"
                    type="primary"
                    size="small"
                    link
                    style="margin-left: 10px"
                    @click.stop="showBatchMakeupDialog"
                  >
                    批量补签
                  </el-button>
                </template>
                  
                  <div class="checkin-list">
                    <el-empty 
                      v-if="!statistics?.notCheckinList.length"
                      description="全员已签到"
                      :image-size="100"
                    />
                    <div
                      v-for="(item, index) in statistics?.notCheckinList"
                      :key="item.userId"
                      class="checkin-item unchecked-item"
                    >
                      <div class="item-index">{{ index + 1 }}</div>
                      <el-avatar :src="item.avatar" :size="40">
                        {{ item.userName?.charAt(0) || '学' }}
                      </el-avatar>
                      <div class="item-info">
                        <div class="item-name">{{ item.userName }}</div>
                        <div class="item-status">待签到</div>
                      </div>
                      <el-tag type="info" size="small">未签到</el-tag>
                      <el-button
                        v-if="activeSession.isActive"
                        type="primary"
                        size="small"
                        link
                        @click="showMakeupDialogFunc(item)"
                      >
                        补签
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 签到已结束提示 -->
      <el-card v-else class="empty-state mt-20">
        <el-empty description="签到已结束">
          <el-button type="primary" @click="handleBack">返回我的课程</el-button>
        </el-empty>
      </el-card>
    </div>

    <!-- 历史签到列表模式 -->
    <div v-else class="checkin-history-list">
      <el-page-header @back="handleBack">
        <template #content>
          <span class="page-title">{{ courseTitle }} - 签到记录</span>
        </template>
      </el-page-header>

      <el-card class="mt-20">
        <!-- 统计信息 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32"><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ historySummary.totalSessions }}</div>
                <div class="stat-label">签到会话数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32"><UserFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ historySummary.totalStudents }}</div>
                <div class="stat-label">总学员数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32"><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ historySummary.totalCheckins }}</div>
                <div class="stat-label">总签到次数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32"><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ historySummary.averageAttendance }}%</div>
                <div class="stat-label">平均出勤率</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 签到会话列表 -->
        <div class="mt-20">
          <div class="section-title">签到会话记录</div>
          <el-table v-loading="loading" :data="sessions">
            <el-table-column label="签到类型" width="180">
              <template #default="{ row }">
                <div v-if="row.chapter" class="chapter-info">
                  <el-tag type="primary" size="small">
                    <el-icon><Reading /></el-icon>
                    章节签到
                  </el-tag>
                  <div class="chapter-name">{{ row.chapter.title }}</div>
                </div>
                <el-tag v-else type="info" size="small">
                  <el-icon><List /></el-icon>
                  课程签到
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="会话时间" width="180">
              <template #default="{ row }">
                <div>{{ formatDate(row.startTime) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="结束时间" width="180">
              <template #default="{ row }">
                <div>{{ formatDate(row.endTime) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.isActive" type="success">进行中</el-tag>
                <el-tag v-else type="info">已结束</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="签到人数" width="120" align="center">
              <template #default="{ row }">
                <el-tag type="success">{{ row.checkinCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="签到率" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="calculateAttendanceRate(row.checkinCount)"
                  :color="getProgressColor(calculateAttendanceRate(row.checkinCount))"
                />
              </template>
            </el-table-column>
            <el-table-column label="持续时间" width="120">
              <template #default="{ row }">
                {{ calculateDuration(row.startTime, row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="handleViewSessionDetail(row)"
                >
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <el-empty v-if="!loading && sessions.length === 0" description="暂无签到记录" />
        </div>
      </el-card>
    </div>

    <!-- 单个补签对话框 -->
    <el-dialog
      v-model="showMakeupDialogVisible"
      title="补签"
      width="35%"
      :close-on-click-modal="false"
    >
      <el-form :model="makeupForm" label-width="100px">
        <el-form-item label="学员姓名">
          <el-input v-model="makeupForm.userName" disabled />
        </el-form-item>
        <el-form-item label="补签原因">
          <el-input
            v-model="makeupForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入补签原因（可选）"
          />
        </el-form-item>
        <el-alert
          title="提示"
          type="warning"
          :closable="false"
          show-icon
        >
          补签后该学员将被标记为已签到，补签记录会单独标注。
        </el-alert>
      </el-form>

      <template #footer>
        <el-button @click="showMakeupDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="makingUp" @click="handleMakeupCheckin">
          确认补签
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量补签对话框 -->
    <el-dialog
      v-model="showBatchMakeupDialogVisible"
      title="批量补签"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form :model="batchMakeupForm" label-width="100px">
        <el-form-item label="补签学员">
          <el-tag
            v-for="user in statistics?.notCheckinList"
            :key="user.userId"
            style="margin: 5px"
          >
            {{ user.userName }}
          </el-tag>
        </el-form-item>
        <el-form-item label="补签原因">
          <el-input
            v-model="batchMakeupForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入补签原因（可选）"
          />
        </el-form-item>
        <el-alert
          title="提示"
          type="warning"
          :closable="false"
          show-icon
        >
          将为所有未签到的学员进行补签，共 {{ statistics?.notCheckinList.length || 0 }} 人。
        </el-alert>
      </el-form>

      <template #footer>
        <el-button @click="showBatchMakeupDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchMakingUp" @click="handleBatchMakeupCheckin">
          确认批量补签
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Checked,
  Close,
  Refresh,
  Timer,
  UserFilled,
  CircleCheck,
  CircleClose,
  TrendCharts,
  View,
  Reading,
  List,
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getCheckinStatistics,
  getActiveCheckinSessionAdmin,
  stopCheckin,
  makeupCheckin,
  batchMakeupCheckin,
  getCheckinHistory,
  type CheckinStatistics,
  type CheckinSession,
  type CheckinHistoryResponse,
} from '@/api/checkin'

const route = useRoute()
const router = useRouter()

// URL 参数
const courseId = ref(route.query.courseId as string)
const courseTitle = ref(route.query.courseTitle as string || '课程')
const sessionId = ref(route.query.sessionId as string || '')

// 实时签到相关
const activeSession = ref<CheckinSession | null>(null)
const statistics = ref<CheckinStatistics | null>(null)
const activeTab = ref('checked')

// 历史签到列表相关
const loading = ref(false)
const sessions = ref<any[]>([])
const historySummary = ref({
  totalSessions: 0,
  totalStudents: 0,
  totalCheckins: 0,
  averageAttendance: 0,
})

// 补签对话框
const showMakeupDialogVisible = ref(false)
const makeupForm = ref({
  userId: '',
  userName: '',
  reason: '',
})
const makingUp = ref(false)

// 批量补签对话框
const showBatchMakeupDialogVisible = ref(false)
const batchMakeupForm = ref({
  reason: '',
})
const batchMakingUp = ref(false)

// 定时器
let refreshTimer: number | null = null
let countdownTimer: number | null = null

// 剩余时间（毫秒）
const remainingTime = ref(0)

// 格式化剩余时间
const formattedRemainingTime = computed(() => {
  const total = Math.floor(remainingTime.value / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm:ss')
}

// 计算签到率
const calculateAttendanceRate = (checkinCount: number) => {
  if (historySummary.value.totalStudents === 0) return 0
  return Math.round((checkinCount / historySummary.value.totalStudents) * 100)
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 计算持续时间
const calculateDuration = (start: string, end: string) => {
  const duration = dayjs(end).diff(dayjs(start), 'minute')
  return `${duration} 分钟`
}

// 返回
const handleBack = () => {
  router.back()
}

// ========== 实时签到模式功能 ==========

// 加载实时签到状态
const loadRealtimeCheckinStatus = async () => {
  if (!courseId.value || !sessionId.value) return

  try {
    // 先尝试获取活跃的签到会话
    const result = await getActiveCheckinSessionAdmin(courseId.value)
    
    if (result.hasActiveSession && result.sessionId === sessionId.value) {
      // 签到进行中
      activeSession.value = {
        sessionId: result.sessionId!,
        code: result.code!,
        courseId: result.courseId!,
        courseName: result.courseName!,
        startTime: result.startTime!,
        endTime: result.endTime!,
        isActive: true,
      }
      
      await refreshStatistics()
      startAutoRefresh()
      startCountdown(result.endTime!)
    } else {
      // 签到已结束，尝试加载历史数据
      await loadHistoricalSessionDetail()
    }
  } catch (error) {
    console.error('加载签到状态失败', error)
    ElMessage.error('加载签到状态失败')
  }
}

// 加载已结束的签到会话详情
const loadHistoricalSessionDetail = async () => {
  if (!courseId.value || !sessionId.value) return

  try {
    // 从历史记录中获取该会话的统计数据
    const result = await getCheckinStatistics(courseId.value, sessionId.value)
    statistics.value = result
    
    // 设置 activeSession 为已结束状态（用于显示签到码和统计）
    activeSession.value = {
      sessionId: result.session.id,
      code: result.session.code,
      courseId: courseId.value,
      courseName: result.courseName,
      startTime: result.session.startTime,
      endTime: result.session.endTime,
      isActive: false, // ✅ 标记为已结束
    }
    
    console.log('✅ 已结束签到会话详情加载成功')
  } catch (error) {
    console.error('❌ 加载签到详情失败', error)
    activeSession.value = null
    ElMessage.error('该签到会话不存在或已被删除')
  }
}

// 刷新统计
const refreshStatistics = async () => {
  if (!courseId.value || !sessionId.value) return

  try {
    const result = await getCheckinStatistics(courseId.value, sessionId.value)
    statistics.value = result
  } catch (error) {
    console.error('刷新统计失败', error)
  }
}

// 结束签到
const handleStopCheckin = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要结束签到吗？结束后学员将无法继续签到。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    if (!courseId.value || !sessionId.value) return

    await stopCheckin(courseId.value, sessionId.value)
    ElMessage.success('签到已结束')
    
    await refreshStatistics()
    stopAutoRefresh()
    stopCountdown()
    
    setTimeout(() => {
      ElMessageBox.alert(
        `本次签到已结束！\n\n应到人数：${statistics.value?.statistics.totalStudents}\n已签到：${statistics.value?.statistics.checkedIn}\n未签到：${statistics.value?.statistics.notCheckedIn}\n签到率：${statistics.value?.statistics.checkinRate}`,
        '签到统计',
        {
          confirmButtonText: '知道了',
        }
      )
      
      activeSession.value = null
    }, 500)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '结束签到失败')
    }
  }
}

// 显示补签对话框
const showMakeupDialogFunc = (user: any) => {
  makeupForm.value = {
    userId: user.userId,
    userName: user.userName,
    reason: '',
  }
  showMakeupDialogVisible.value = true
}

// 显示批量补签对话框
const showBatchMakeupDialog = () => {
  batchMakeupForm.value.reason = ''
  showBatchMakeupDialogVisible.value = true
}

// 补签
const handleMakeupCheckin = async () => {
  if (!courseId.value || !sessionId.value) {
    ElMessage.warning('签到会话不存在')
    return
  }

  try {
    makingUp.value = true
    await makeupCheckin(courseId.value, sessionId.value, {
      userId: makeupForm.value.userId,
      reason: makeupForm.value.reason,
    })
    
    ElMessage.success(`已为 ${makeupForm.value.userName} 补签成功`)
    showMakeupDialogVisible.value = false
    await refreshStatistics()
  } catch (error: any) {
    ElMessage.error(error.message || '补签失败')
  } finally {
    makingUp.value = false
  }
}

// 批量补签
const handleBatchMakeupCheckin = async () => {
  if (!courseId.value || !sessionId.value) {
    ElMessage.warning('签到会话不存在')
    return
  }

  if (!statistics.value?.notCheckinList.length) {
    ElMessage.warning('没有需要补签的学员')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要为 ${statistics.value.notCheckinList.length} 名学员批量补签吗？`,
      '批量补签确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    batchMakingUp.value = true
    const userIds = statistics.value.notCheckinList.map((u) => u.userId)
    
    const result = await batchMakeupCheckin(courseId.value, sessionId.value, {
      userIds,
      reason: batchMakeupForm.value.reason,
    })
    
    ElMessage.success(result.message || '批量补签完成')
    showBatchMakeupDialogVisible.value = false
    await refreshStatistics()
    
    if (result.failed && result.failed.length > 0) {
      ElMessageBox.alert(
        `成功：${result.success.length} 人\n失败：${result.failed.length} 人`,
        '批量补签结果',
        {
          confirmButtonText: '知道了',
        }
      )
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量补签失败')
    }
  } finally {
    batchMakingUp.value = false
  }
}

// 开启自动刷新
const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    refreshStatistics()
  }, 5000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 开启倒计时
const startCountdown = (endTime: string) => {
  const updateCountdown = () => {
    const end = dayjs(endTime).valueOf()
    const now = dayjs().valueOf()
    remainingTime.value = Math.max(0, end - now)
    
    if (remainingTime.value <= 0) {
      stopCountdown()
      ElMessage.warning('签到时间已到')
    }
  }
  
  updateCountdown()
  countdownTimer = window.setInterval(updateCountdown, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// ========== 历史签到列表模式功能 ==========

// 加载历史签到记录
const loadCheckinHistory = async () => {
  if (!courseId.value) return

  loading.value = true
  try {
    const res = await getCheckinHistory(courseId.value)
    sessions.value = res.sessions || []
    historySummary.value = res.summary || {
      totalSessions: 0,
      totalStudents: 0,
      totalCheckins: 0,
      averageAttendance: 0,
    }
    
    console.log('✅ 历史签到记录加载成功:', res)
  } catch (error: any) {
    console.error('❌ 加载签到记录失败:', error)
    ElMessage.error(error.message || '加载签到记录失败')
  } finally {
    loading.value = false
  }
}

// 查看签到会话详情
const handleViewSessionDetail = (session: any) => {
  console.log('🔍 查看签到详情:', session)
  
  // 跳转到签到详情页，传入 sessionId
  router.push({
    path: '/teacher/course-checkins',
    query: {
      courseId: courseId.value,
      courseTitle: courseTitle.value,
      sessionId: session.sessionId || session.id,
    },
  })
}

// 页面加载
onMounted(() => {
  if (sessionId.value) {
    // 实时签到模式
    loadRealtimeCheckinStatus()
  } else {
    // 历史签到列表模式
    loadCheckinHistory()
  }
})

// 页面卸载
onUnmounted(() => {
  stopAutoRefresh()
  stopCountdown()
})
</script>

<style lang="scss" scoped>
.page-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .chapter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.mt-20 {
  margin-top: 20px;
}

// 章节信息样式
.chapter-info {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .chapter-name {
    font-size: 13px;
    color: #606266;
    margin-top: 4px;
  }
}

// ========== 实时签到详情样式 ==========
.checkin-panel {
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .course-name {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .header-right {
      display: flex;
      gap: 10px;
    }
  }
}

.qr-section {
  h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
  }

  .checkin-code-wrapper {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    margin-bottom: 20px;

    .code-title {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 12px;
    }

    .code-display {
      font-size: 48px;
      font-weight: bold;
      color: #fff;
      letter-spacing: 8px;
      margin-bottom: 8px;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .code-hint {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .countdown-wrapper {
    text-align: center;
    padding: 20px;
    background: #fff3e0;
    border-radius: 12px;
    
    .countdown-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
    }

    .countdown-time {
      font-size: 36px;
      font-weight: bold;
      color: #ff9800;
      font-family: 'Monaco', 'Courier New', monospace;
      letter-spacing: 4px;
    }
  }
}

.statistics-section {
  h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #999;
        }
      }

      &.total .stat-icon {
        background: #e3f2fd;
        color: #2196f3;
      }

      &.checked .stat-icon {
        background: #e8f5e9;
        color: #4caf50;
      }

      &.unchecked .stat-icon {
        background: #fce4ec;
        color: #e91e63;
      }

      &.rate .stat-icon {
        background: #fff3e0;
        color: #ff9800;
      }
    }
  }

  .checkin-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }
  }

  .checkin-list {
    max-height: 500px;
    overflow-y: auto;

    .checkin-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.2s;

      &:hover {
        background: #f0f0f0;
      }

      &.unchecked-item {
        opacity: 0.7;
      }

      .item-index {
        width: 28px;
        height: 28px;
        background: #e0e0e0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        color: #666;
      }

      .item-info {
        flex: 1;

        .item-name {
          font-size: 15px;
          color: #333;
          margin-bottom: 4px;
        }

        .item-time {
          font-size: 13px;
          color: #999;
        }

        .item-status {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
}

// ========== 历史签到列表样式 ==========
.stats-row {
  margin-bottom: 24px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #333;
        line-height: 1;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #999;
      }
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.empty-state {
  text-align: center;
  padding: 40px;
}
</style>
