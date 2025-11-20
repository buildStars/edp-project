<template>
  <div class="dashboard-container page-container">
    <h2 class="page-title">首页概览</h2>

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="mb-20">
      <!-- 管理员/教务 - 总用户数 -->
      <el-col v-if="['ADMIN', 'STAFF'].includes(userRole)" :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ecf5ff; color: #409eff">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change positive">
              <el-icon><ArrowUp /></el-icon>
              今日新增: {{ statistics.todayUsers }}
            </span>
          </div>
        </el-card>
      </el-col>

      <!-- 所有角色 - 总课程数 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f0f9ff; color: #67c23a">
              <el-icon :size="32"><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCourses }}</div>
              <div class="stat-label">{{ userRole === 'TEACHER' ? '我的课程' : '总课程数' }}</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change">进行中: {{ statistics.activeCourses }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 所有角色 - 总报名数 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fef0f0; color: #f56c6c">
              <el-icon :size="32"><DocumentChecked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalEnrollments }}</div>
              <div class="stat-label">总报名数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change positive">
              <el-icon><ArrowUp /></el-icon>
              本月: {{ statistics.monthEnrollments }}
            </span>
          </div>
        </el-card>
      </el-col>

      <!-- 教师 - 总学员数 / 管理员教务 - 发布资讯 -->
      <el-col :span="6">
        <el-card v-if="userRole === 'TEACHER'" shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c">
              <el-icon :size="32"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalStudents || 0 }}</div>
              <div class="stat-label">总学员数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change">草稿课程: {{ statistics.draftCourses || 0 }}</span>
          </div>
        </el-card>
        <el-card v-else shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c">
              <el-icon :size="32"><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalNews }}</div>
              <div class="stat-label">发布资讯</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change">本周: {{ statistics.weekNews }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card shadow="hover" class="mb-20">
      <template #header>
        <div class="card-header">
          <span>快捷入口</span>
        </div>
      </template>
      <el-row :gutter="20">
        <!-- 管理员和教务人员 - 待审批课程 -->
        <el-col v-if="['ADMIN', 'STAFF'].includes(userRole)" :span="6">
          <div class="quick-link" @click="$router.push('/courses/approve')">
            <el-icon :size="24" color="#409eff"><DocumentChecked /></el-icon>
            <div class="quick-info">
              <div class="quick-label">待审批课程</div>
              <div class="quick-count">{{ statistics.pendingCourses }}</div>
            </div>
          </div>
        </el-col>
        
        <!-- 管理员和教务人员 - 待审核试听 -->
        <el-col v-if="['ADMIN', 'STAFF'].includes(userRole)" :span="6">
          <div class="quick-link" @click="$router.push('/enrollments/trials')">
            <el-icon :size="24" color="#67c23a"><User /></el-icon>
            <div class="quick-info">
              <div class="quick-label">待审核试听</div>
              <div class="quick-count">{{ statistics.pendingTrials }}</div>
            </div>
          </div>
        </el-col>
        
        <!-- 所有角色 - 今日签到 -->
        <el-col :span="6">
          <div class="quick-link" @click="handleQuickAction('checkins')">
            <el-icon :size="24" color="#e6a23c"><Clock /></el-icon>
            <div class="quick-info">
              <div class="quick-label">今日签到</div>
              <div class="quick-count">{{ statistics.todayCheckins }}</div>
            </div>
          </div>
        </el-col>
        
        <!-- 管理员和教务 - 发布资讯 -->
        <el-col v-if="['ADMIN', 'STAFF'].includes(userRole)" :span="6">
          <div class="quick-link" @click="$router.push('/news/create')">
            <el-icon :size="24" color="#f56c6c"><Edit /></el-icon>
            <div class="quick-info">
              <div class="quick-label">发布资讯</div>
            </div>
          </div>
        </el-col>
        
        <!-- 教师 - 我的课程 -->
        <el-col v-if="userRole === 'TEACHER'" :span="6">
          <div class="quick-link" @click="$router.push('/teacher/courses')">
            <el-icon :size="24" color="#409eff"><Reading /></el-icon>
            <div class="quick-info">
              <div class="quick-label">我的课程</div>
              <div class="quick-count">{{ statistics.totalCourses }}</div>
            </div>
          </div>
        </el-col>
        
        <!-- 教师 - 草稿课程 -->
        <el-col v-if="userRole === 'TEACHER'" :span="6">
          <div class="quick-link" @click="$router.push('/teacher/courses?status=DRAFT')">
            <el-icon :size="24" color="#e6a23c"><Document /></el-icon>
            <div class="quick-info">
              <div class="quick-label">草稿课程</div>
              <div class="quick-count">{{ statistics.draftCourses || 0 }}</div>
            </div>
          </div>
        </el-col>
        
        <!-- 教师 - 我的学员 -->
        <el-col v-if="userRole === 'TEACHER'" :span="6">
          <div class="quick-link" @click="$router.push('/teacher/students')">
            <el-icon :size="24" color="#67c23a"><UserFilled /></el-icon>
            <div class="quick-info">
              <div class="quick-label">我的学员</div>
              <div class="quick-count">{{ statistics.totalStudents || 0 }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ userRole === 'TEACHER' ? '学员增长趋势' : '用户增长趋势' }}</span>
            </div>
          </template>
          <div ref="userChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ userRole === 'TEACHER' ? '课程报名趋势' : '报名趋势' }}</span>
            </div>
          </template>
          <div ref="enrollmentChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { ElMessage } from 'element-plus'
import {
  User,
  Collection,
  DocumentChecked,
  Reading,
  ArrowUp,
  Clock,
  Edit,
  Document,
  UserFilled,
} from '@element-plus/icons-vue'
import { getDashboardStatistics, type DashboardStatistics } from '@/api/statistics'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 获取当前用户角色
const userRole = computed(() => authStore.userInfo?.role || '')

// 统计数据
const statistics = ref<DashboardStatistics>({
  totalUsers: 0,
  todayUsers: 0,
  totalCourses: 0,
  activeCourses: 0,
  totalEnrollments: 0,
  monthEnrollments: 0,
  totalNews: 0,
  weekNews: 0,
  pendingCourses: 0,
  pendingTrials: 0,
  todayCheckins: 0,
  userGrowthData: [],
  enrollmentTrendData: [],
})

// 图表实例
const userChartRef = ref<HTMLDivElement>()
const enrollmentChartRef = ref<HTMLDivElement>()
let userChart: EChartsType | null = null
let enrollmentChart: EChartsType | null = null

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const data = await getDashboardStatistics()
    statistics.value = data
  } catch (error: any) {
    ElMessage.error(error.message || '获取统计数据失败')
  }
}

// 初始化用户增长图表
const initUserChart = () => {
  if (!userChartRef.value) return

  userChart = echarts.init(userChartRef.value)

  const labels = statistics.value.userGrowthData.map((item) => item.label)
  const data = statistics.value.userGrowthData.map((item) => item.count)

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: labels.length > 0 ? labels : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0)' },
          ]),
        },
      },
    ],
  }

  userChart.setOption(option)
}

// 初始化报名趋势图表
const initEnrollmentChart = () => {
  if (!enrollmentChartRef.value) return

  enrollmentChart = echarts.init(enrollmentChartRef.value)

  const labels = statistics.value.enrollmentTrendData.map((item) => item.label)
  const data = statistics.value.enrollmentTrendData.map((item) => item.count)

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: labels.length > 0 ? labels : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '报名人数',
        type: 'bar',
        data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67C23A' },
            { offset: 1, color: '#95D475' },
          ]),
        },
      },
    ],
  }

  enrollmentChart.setOption(option)
}

// 处理快捷操作
const handleQuickAction = () => {
  if (userRole.value === 'TEACHER') {
    // 教师跳转到教师专属的签到管理页面
    router.push('/teacher/checkins')
  } else {
    // 管理员和教务跳转到通用的签到管理页面
    router.push('/enrollments/checkins')
  }
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  userChart?.resize()
  enrollmentChart?.resize()
}

onMounted(async () => {
  await fetchStatistics()
  initUserChart()
  initEnrollmentChart()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  userChart?.dispose()
  enrollmentChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .page-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;

      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #999;
        }
      }
    }

    .stat-footer {
      padding-top: 12px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;

      .stat-change {
        display: flex;
        align-items: center;
        gap: 4px;

        &.positive {
          color: #67c23a;
        }
      }
    }
  }

  .quick-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: #ecf5ff;
      transform: translateY(-2px);
    }

    .quick-info {
      flex: 1;

      .quick-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }

      .quick-count {
        font-size: 20px;
        font-weight: bold;
        color: #333;
      }
    }
  }

  .chart-container {
    width: 100%;
    height: 300px;
  }
}
</style>


