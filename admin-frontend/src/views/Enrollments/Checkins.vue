<template>
  <div class="page-container">
    <h2 class="page-title">签到管理</h2>
    
    <!-- 课程选择 -->
    <el-card class="course-select-card">
      <el-form inline>
        <el-form-item label="选择课程">
          <el-select
            v-model="selectedCourseId"
            placeholder="请选择课程"
            filterable
            clearable
            style="width: 400px"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="`${course.title} - ${formatDate(course.startTime)}`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="!activeSession && selectedCourseId">
          <el-button type="primary" :icon="Calendar" @click="showStartDialog = true">
            开启签到
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 签到控制面板 -->
    <el-card v-if="activeSession" class="checkin-panel">
      <template #header>
        <div class="panel-header">
          <div class="header-left">
            <el-tag type="success" size="large">
              <el-icon><Checked /></el-icon>
              签到进行中
            </el-tag>
            <span class="course-name">{{ statistics?.courseName }}</span>
          </div>
          <div class="header-right">
            <el-button type="danger" :icon="Close" @click="handleStopCheckin">
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

            <!-- 倒计时 -->
            <div class="countdown-wrapper">
              <div class="countdown-title">
                <el-icon><Timer /></el-icon>
                <span>剩余时间</span>
              </div>
              <div class="countdown-time">{{ formattedRemainingTime }}</div>
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
                    v-if="statistics?.notCheckinList.length"
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
                      type="primary"
                      size="small"
                      link
                      @click="showMakeupDialog(item)"
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

    <!-- 空状态 -->
    <el-card v-if="!activeSession && selectedCourseId" class="empty-state">
      <el-empty description="当前课程没有进行中的签到">
        <el-button type="primary" :icon="Calendar" @click="showStartDialog = true">
          开启签到
        </el-button>
      </el-empty>
    </el-card>

    <el-card v-if="!selectedCourseId" class="empty-state">
      <el-empty description="请先选择课程" />
    </el-card>

    <!-- 开启签到对话框 -->
    <el-dialog
      v-model="showStartDialog"
      title="开启签到"
      width="35%"
      :close-on-click-modal="false"
    >
      <el-form :model="startForm" label-width="120px">
        <el-form-item label="签到有效期">
          <el-input-number
            v-model="startForm.duration"
            :min="5"
            :max="60"
            :step="5"
            controls-position="right"
          />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul style="margin: 0; padding-left: 20px">
              <li>签到开启后将生成唯一的签到码和二维码</li>
              <li>学员可通过扫描二维码或输入签到码完成签到</li>
              <li>建议签到时长：10-15分钟</li>
            </ul>
          </template>
        </el-alert>
      </el-form>

      <template #footer>
        <el-button @click="showStartDialog = false">取消</el-button>
        <el-button type="primary" :loading="starting" @click="handleStartCheckin">
          开启签到
        </el-button>
      </template>
    </el-dialog>

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
            closable
            @close="removeFromBatchMakeup"
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
  TrendCharts
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getCourseList } from '@/api/course'
import type { Course } from '@/types/models'
import {
  startCheckin,
  stopCheckin,
  getCheckinStatistics,
  getActiveCheckinSessionAdmin,
  makeupCheckin,
  batchMakeupCheckin,
  type CheckinStatistics,
  type CheckinSession
} from '@/api/checkin'

// 课程列表
const courseList = ref<Course[]>([])
const selectedCourseId = ref('')

// 签到会话
const activeSession = ref<CheckinSession | null>(null)
const statistics = ref<CheckinStatistics | null>(null)

// 对话框
const showStartDialog = ref(false)
const startForm = ref({
  duration: 15
})
const starting = ref(false)

// 补签对话框
const showMakeupDialogVisible = ref(false)
const makeupForm = ref({
  userId: '',
  userName: '',
  reason: ''
})
const makingUp = ref(false)

// 批量补签对话框
const showBatchMakeupDialogVisible = ref(false)
const batchMakeupForm = ref({
  reason: ''
})
const batchMakingUp = ref(false)

// 标签页
const activeTab = ref('checked')

// 定时器
let refreshTimer: number | null = null
let countdownTimer: number | null = null

// 剩余时间（毫秒）
const remainingTime = ref(0)

// 格式化剩余时间
const formattedRemainingTime = computed(() => {
  const total = Math.floor(remainingTime.value / 1000) // 转换为秒
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

// 加载课程列表
const loadCourseList = async () => {
  try {
    const res = await getCourseList({
      page: 1,
      pageSize: 100,
      status: 'PUBLISHED'
    })
    courseList.value = res.items || []
  } catch (error) {
    console.error('加载课程列表失败', error)
  }
}

// 课程切换
const handleCourseChange = (courseId: string) => {
  // 先停止之前的定时器
  stopAutoRefresh()
  stopCountdown()
  
  if (!courseId) {
    activeSession.value = null
    statistics.value = null
    return
  }
  
  // 重新加载签到状态
  loadCheckinStatus(courseId)
}

// 加载签到状态
const loadCheckinStatus = async (courseId: string) => {
  try {
    const result = await getActiveCheckinSessionAdmin(courseId)
    
    if (result.hasActiveSession) {
      // 先停止旧的定时器（如果有的话）
      stopAutoRefresh()
      stopCountdown()
      
      // 有活跃的签到会话
      activeSession.value = {
        sessionId: result.sessionId!,
        code: result.code!,
        courseId: result.courseId!,
        courseName: result.courseName!,
        startTime: result.startTime!,
        endTime: result.endTime!,
        isActive: true,
      }
      
      // 加载统计数据
      await refreshStatistics()
      
      // 开启自动刷新
      startAutoRefresh()
      
      // 开启倒计时
      startCountdown(result.endTime!)
    } else {
      // 没有活跃的签到会话
      activeSession.value = null
      statistics.value = null
      stopAutoRefresh()
      stopCountdown()
    }
  } catch (error) {
    console.error('加载签到状态失败', error)
  }
}

// 开启签到
const handleStartCheckin = async () => {
  if (!selectedCourseId.value) {
    ElMessage.warning('请先选择课程')
    return
  }

  try {
    starting.value = true
    
    // 先停止之前的定时器（如果有的话）
    stopAutoRefresh()
    stopCountdown()
    
    const result = await startCheckin(selectedCourseId.value, {
      duration: startForm.value.duration
    })
    
    activeSession.value = result
    showStartDialog.value = false
    
    ElMessage.success('签到已开启，通知已发送给所有学生')
    
    // 加载统计数据
    await refreshStatistics()
    
    // 开启自动刷新
    startAutoRefresh()
    
    // 开启倒计时
    startCountdown(result.endTime)
  } catch (error: any) {
    ElMessage.error(error.msg || '开启签到失败')
  } finally {
    starting.value = false
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
        type: 'warning'
      }
    )

    if (!selectedCourseId.value || !activeSession.value) return

    await stopCheckin(selectedCourseId.value, activeSession.value.sessionId)
    
    ElMessage.success('签到已结束')
    
    // 最后刷新一次统计
    await refreshStatistics()
    
    // 停止自动刷新和倒计时
    stopAutoRefresh()
    stopCountdown()
    
    // 显示最终统计
    setTimeout(() => {
      ElMessageBox.alert(
        `本次签到已结束！\n\n应到人数：${statistics.value?.statistics.totalStudents}\n已签到：${statistics.value?.statistics.checkedIn}\n未签到：${statistics.value?.statistics.notCheckedIn}\n签到率：${statistics.value?.statistics.checkinRate}`,
        '签到统计',
        {
          confirmButtonText: '知道了'
        }
      )
      
      // 清空状态
      activeSession.value = null
    }, 500)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.msg || '结束签到失败')
    }
  }
}

// 刷新统计
const refreshStatistics = async () => {
  if (!selectedCourseId.value || !activeSession.value) return

  try {
    const result = await getCheckinStatistics(
      selectedCourseId.value,
      activeSession.value.sessionId
    )
    statistics.value = result
  } catch (error) {
    console.error('刷新统计失败', error)
  }
}

// 二维码相关功能已移除，现在只使用数字签到码

// 开启自动刷新
const startAutoRefresh = () => {
  // 每5秒刷新一次统计
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
    
    // 如果时间到了，停止倒计时
    if (remainingTime.value <= 0) {
      stopCountdown()
      ElMessage.warning('签到时间已到')
    }
  }
  
  // 立即执行一次
  updateCountdown()
  
  // 每秒更新一次
  countdownTimer = window.setInterval(updateCountdown, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 显示补签对话框
const showMakeupDialog = (user: any) => {
  makeupForm.value = {
    userId: user.userId,
    userName: user.userName,
    reason: ''
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
  if (!selectedCourseId.value || !activeSession.value) {
    ElMessage.warning('签到会话不存在')
    return
  }

  try {
    makingUp.value = true
    await makeupCheckin(
      selectedCourseId.value,
      activeSession.value.sessionId,
      {
        userId: makeupForm.value.userId,
        reason: makeupForm.value.reason
      }
    )
    
    ElMessage.success(`已为 ${makeupForm.value.userName} 补签成功`)
    showMakeupDialogVisible.value = false
    
    // 刷新统计
    await refreshStatistics()
  } catch (error: any) {
    ElMessage.error(error.msg || '补签失败')
  } finally {
    makingUp.value = false
  }
}

// 批量补签
const handleBatchMakeupCheckin = async () => {
  if (!selectedCourseId.value || !activeSession.value) {
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
        type: 'warning'
      }
    )

    batchMakingUp.value = true
    const userIds = statistics.value.notCheckinList.map(u => u.userId)
    
    const result = await batchMakeupCheckin(
      selectedCourseId.value,
      activeSession.value.sessionId,
      {
        userIds,
        reason: batchMakeupForm.value.reason
      }
    )
    
    ElMessage.success(result.message || '批量补签完成')
    showBatchMakeupDialogVisible.value = false
    
    // 刷新统计
    await refreshStatistics()
    
    // 如果有失败的，显示详情
    if (result.failed && result.failed.length > 0) {
      ElMessageBox.alert(
        `成功：${result.success.length} 人\n失败：${result.failed.length} 人`,
        '批量补签结果',
        {
          confirmButtonText: '知道了'
        }
      )
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.msg || '批量补签失败')
    }
  } finally {
    batchMakingUp.value = false
  }
}

// 从批量补签中移除
const removeFromBatchMakeup = () => {
  // 实际上这里不需要实现，因为我们使用的是statistics的数据
  // 如果需要实现选择性补签，需要维护一个单独的选中列表
  ElMessage.info('批量补签会为所有未签到学员进行补签')
}

// 页面加载
onMounted(() => {
  loadCourseList()
})

// 页面卸载
onUnmounted(() => {
  stopAutoRefresh()
  stopCountdown()
})
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.course-select-card {
  margin-bottom: 20px;
}

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

  .qr-code-wrapper {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    margin-bottom: 20px;

    .qr-code-title {
      font-size: 16px;
      color: #666;
      margin-bottom: 16px;
    }

    .qr-code {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 16px;
      min-height: 280px;
    }
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

.empty-state {
  margin-top: 20px;
}

// 响应式弹窗宽度
@media (max-width: 1200px) {
  :deep(.el-dialog) {
    width: 50% !important;
  }
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
  }
}
</style>
