<template>
  <div class="teacher-courses">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card courses">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCourses }}</div>
              <div class="stat-label">总课程数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card active">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><VideoPlay /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.activeCourses }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card students">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalStudents }}</div>
              <div class="stat-label">总学员数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card pending">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pendingCheckins }}</div>
              <div class="stat-label">待签到</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程列表 -->
    <el-card class="courses-list">
      <template #header>
        <div class="card-header">
          <span>我的课程</span>
          <div>
            <el-button
              :icon="Refresh"
              @click="loadCourses"
              :loading="loading"
            >
              刷新
            </el-button>
            <el-button
              v-permission="'courses:create'"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              创建课程
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="courses">
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              fit="cover"
              style="width: 100px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.coverImage]"
            />
            <span v-else class="text-secondary">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="课程名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="报名人数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success">{{ row._count.enrollments }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'DRAFT'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'PUBLISHED'" type="success">已发布</el-tag>
            <el-tag v-else type="warning">已归档</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开课时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="700" fixed="right">
          <template #default="{ row }">
            <!-- 第一行：主要操作 -->
            <div style="margin-bottom: 8px;">
              <el-button 
                link 
                type="primary"
                @click="handleViewDetail(row)"
              >
                <el-icon><Reading /></el-icon>
                课程详情
              </el-button>
              <el-button link type="primary" @click="handleViewStudents(row)">
                <el-icon><UserFilled /></el-icon>
                学员({{ row._count.enrollments }})
              </el-button>
              <el-button 
                v-if="row.status === 'DRAFT'" 
                v-permission="'courses:edit'" 
                link 
                type="primary" 
                @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑课程
              </el-button>
              <el-button 
                v-if="row.status === 'DRAFT'" 
                link 
                type="warning" 
                @click="handleSubmitApproval(row)"
              >
                <el-icon><Promotion /></el-icon>
                提交审批
              </el-button>
            </div>
            
            <!-- 第二行：签到操作 -->
            <div style="margin-bottom: 8px;">
              <el-button 
                v-if="row.status === 'PUBLISHED' && row.activeCheckin"
                link 
                type="warning" 
                @click="handleViewActiveCheckin(row)"
              >
                <el-icon><Clock /></el-icon>
                查看签到
              </el-button>
              <el-button 
                v-else-if="row.status === 'PUBLISHED'"
                link 
                type="success" 
                @click="handleStartCheckin(row)"
              >
                <el-icon><CircleCheck /></el-icon>
                开始签到
              </el-button>
              <el-button link @click="handleViewCheckins(row)">
                <el-icon><List /></el-icon>
                签到记录
              </el-button>
              <el-button link @click="handleManageMaterials(row)">
                <el-icon><Folder /></el-icon>
                课件管理
              </el-button>
            </div>
            
            <!-- 第三行：其他操作 -->
            <div>
              <el-button 
                v-permission="'achievements:students'"
                link 
                type="primary" 
                @click="handleManageStudents(row)"
              >
                <el-icon><Tickets /></el-icon>
                学员管理
              </el-button>
              <el-button link @click="handleViewEvaluations(row)">
                <el-icon><Star /></el-icon>
                课程评价
              </el-button>
              <el-button 
                v-if="row.status === 'PUBLISHED'"
                v-permission="'completion:create'"
                link 
                type="warning" 
                @click="handleRequestCompletion(row)"
              >
                <el-icon><CircleCheck /></el-icon>
                申请结课
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!loading && courses.length === 0" description="暂无课程" />
    </el-card>

    <!-- 开启签到对话框 -->
    <el-dialog
      v-model="checkinDialogVisible"
      title="开启签到"
      width="600px"
    >
      <el-form :model="checkinForm" label-width="120px">
        <el-form-item label="课程名称">
          <el-input :model-value="currentCourse?.title" disabled />
        </el-form-item>
        
        <el-form-item label="选择章节" required>
          <el-select 
            v-model="checkinForm.chapterId" 
            placeholder="请选择章节" 
            style="width: 100%"
            :loading="loadingChapters"
            @visible-change="handleChapterSelectVisible"
          >
            <el-option
              v-for="chapter in courseChapters"
              :key="chapter.id"
              :label="`${chapter.sortOrder}. ${chapter.title}`"
              :value="chapter.id"
            />
          </el-select>
          <div style="margin-top: 4px; font-size: 12px; color: #909399;">
           
          </div>
        </el-form-item>
        
        <el-form-item label="签到时长" required>
          <el-input-number
            v-model="checkinForm.duration"
            :min="5"
            :max="60"
            :step="5"
            style="width: 200px"
          />
          <span style="margin-left: 10px; color: #909399">分钟</span>
        </el-form-item>
        
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          style="margin-top: 10px"
        >
          签到开启后，学员可在指定时间内完成签到。签到时长建议设置为5-60分钟。
          <br />
          签到将统计到选中章节的签到记录中。
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="checkinDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="startingCheckin"
          @click="handleConfirmStartCheckin"
        >
          开启签到
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Reading,
  VideoPlay,
  UserFilled,
  Clock,
  Plus,
  CircleCheck,
  List,
  Star,
  Folder,
  Edit,
  Promotion,
  Tickets,
  Refresh,
} from '@element-plus/icons-vue'
import { getTeacherCourses } from '@/api/teacher'
import { submitCourseApproval } from '@/api/course'
import { startCheckin } from '@/api/checkin'
import { createCompletionRequest } from '@/api/course-completion'
import { getChapters, type Chapter } from '@/api/chapter'
import type { Course } from '@/types/models'
import { formatDate } from '@/utils/format'

const router = useRouter()

// 数据
const loading = ref(false)
const courses = ref<Course[]>([])
const statistics = ref({
  totalCourses: 0,
  activeCourses: 0,
  totalStudents: 0,
  pendingCheckins: 0,
})

// 章节相关
const loadingChapters = ref(false)
const courseChapters = ref<Chapter[]>([])

// 加载课程列表
const loadCourses = async () => {
  loading.value = true
  try {
    const res = await getTeacherCourses()
    courses.value = res.courses
    statistics.value = res.statistics
    
    // 🔍 调试：查看课程数据中的 activeCheckin
    console.log('📚 课程列表数据:', res.courses)
    res.courses.forEach((course: any) => {
      if (course.activeCheckin) {
        console.log(`✅ 课程 "${course.title}" 有活跃签到:`, course.activeCheckin)
      }
    })
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 创建课程
const handleCreate = () => {
  router.push('/courses/create')
}

// 编辑课程
// 编辑课程
const handleEdit = (row: Course) => {
  router.push(`/courses/edit/${row.id}`)
}

// 查看课程详情
const handleViewDetail = (row: Course) => {
  router.push(`/courses/edit/${row.id}`)
}

const handleViewStudents = (row: Course) => {
  router.push({
    path: '/teacher/course-students',
    query: {
      courseId: row.id,
      courseTitle: row.title,
    },
  })
}

// 签到相关
const checkinDialogVisible = ref(false)
const currentCourse = ref<Course | null>(null)
const checkinForm = reactive({
  duration: 30, // 默认30分钟
  chapterId: '', // 章节ID
})
const startingCheckin = ref(false)

// 查看进行中的签到
const handleViewActiveCheckin = (row: any) => {
  console.log('🔍 查看签到 - 课程数据:', row)
  console.log('🔍 activeCheckin:', row.activeCheckin)
  
  if (row.activeCheckin) {
    // ✅ 后端返回的是 id 字段，不是 sessionId
    const sessionId = row.activeCheckin.sessionId || row.activeCheckin.id
    console.log('✅ 跳转到签到详情页，sessionId:', sessionId)
    
    router.push({
      path: '/teacher/course-checkins',
      query: {
        courseId: row.id,
        courseTitle: row.title,
        sessionId: sessionId,
      },
    })
  } else {
    console.warn('❌ 没有 activeCheckin 数据，无法跳转')
    ElMessage.warning('当前课程没有进行中的签到')
  }
}

// 加载章节列表
const loadCourseChapters = async (courseId: string) => {
  loadingChapters.value = true
  try {
    const res = await getChapters({ courseId })
    // API返回的数据已经被响应拦截器提取，直接使用
    courseChapters.value = res.items || []
  } catch (error: any) {
    console.error('加载章节失败:', error)
    courseChapters.value = []
  } finally {
    loadingChapters.value = false
  }
}

// 章节选择器可见性变化
const handleChapterSelectVisible = (visible: boolean) => {
  if (visible && currentCourse.value && courseChapters.value.length === 0) {
    loadCourseChapters(currentCourse.value.id)
  }
}

// 开始签到
const handleStartCheckin = (row: Course) => {
  currentCourse.value = row
  checkinForm.duration = 30
  checkinForm.chapterId = ''
  courseChapters.value = [] // 清空之前的章节列表
  checkinDialogVisible.value = true
}

const handleConfirmStartCheckin = async () => {
  if (!currentCourse.value) return
  
  // 验证必须选择章节
  if (!checkinForm.chapterId) {
    ElMessage.warning('请选择要签到的章节')
    return
  }
  
  try {
    startingCheckin.value = true
    const data: any = {
      duration: checkinForm.duration,
      chapterId: checkinForm.chapterId,
    }
    
    const session = await startCheckin(currentCourse.value.id, data)
    
    ElMessage.success('章节签到已开启')
    checkinDialogVisible.value = false
    
    // 跳转到签到详情页面，实时查看签到情况
    router.push({
      path: '/teacher/course-checkins',
      query: {
        courseId: currentCourse.value.id,
        courseTitle: currentCourse.value.title,
        sessionId: session.sessionId, // 传递签到会话ID
      },
    })
  } catch (error: any) {
    ElMessage.error(error.message || '开启签到失败')
  } finally {
    startingCheckin.value = false
  }
}

// 查看签到记录
const handleViewCheckins = (row: Course) => {
  router.push({
    path: '/teacher/course-checkins',
    query: {
      courseId: row.id,
      courseTitle: row.title,
    },
  })
}

// 查看评价
const handleViewEvaluations = (row: Course) => {
  router.push({
    path: '/teacher/course-evaluations',
    query: {
      courseId: row.id,
      courseTitle: row.title,
    },
  })
}

// 课件管理
const handleManageMaterials = (row: Course) => {
  router.push({
    path: '/materials/list',
    query: {
      courseId: row.id,
      title: row.title
    }
  })
}

// 学员管理
const handleManageStudents = (row: Course) => {
  router.push({
    path: '/teacher/course-students',
    query: {
      courseId: row.id,
      courseTitle: row.title,
    },
  })
}

// 申请结课
const handleRequestCompletion = async (row: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要为课程"${row.title}"申请结课吗？<br/><br/>
      <strong>审批通过后将：</strong><br/>
      1. 课程状态更新为"已归档"<br/>
      2. 自动发放学习成果给符合签到要求的学员`,
      '申请结课',
      {
        type: 'warning',
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定申请',
        cancelButtonText: '取消',
      }
    )

    await createCompletionRequest({ courseId: row.id })
    ElMessage.success('结课申请已提交，等待审批')
    
    // 跳转到结课申请列表页面
    router.push('/teacher/completion-requests')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '提交失败')
    }
  }
}

// 提交审批
const handleSubmitApproval = async (row: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要提交课程"${row.title}"的审批申请吗？提交后将由管理员或教务人员审核。`,
      '提交审批',
      {
        type: 'warning',
        confirmButtonText: '确定提交',
        cancelButtonText: '取消',
      }
    )
    
    await submitCourseApproval(row.id)
    ElMessage.success('审批申请已提交，请等待审核')
    loadCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '提交失败')
    }
  }
}

onMounted(() => {
  loadCourses()
  
  // 监听页面可见性变化，用户返回页面时自动刷新
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 页面可见性变化处理
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    console.log('页面重新可见，刷新课程列表')
    loadCourses()
  }
}

// 组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped lang="scss">
.teacher-courses {
  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 12px;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }

      &.courses {
        .stat-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
        .stat-value {
          color: #667eea;
        }
      }

      &.active {
        .stat-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: #fff;
        }
        .stat-value {
          color: #f5576c;
        }
      }

      &.students {
        .stat-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: #fff;
        }
        .stat-value {
          color: #4facfe;
        }
      }

      &.pending {
        .stat-icon {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: #fff;
        }
        .stat-value {
          color: #fa709a;
        }
      }
    }
  }

  .courses-list {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .text-secondary {
      color: #909399;
      font-size: 12px;
    }

    :deep(.el-button--link) {
      margin-right: 4px;
    }
  }
}
</style>

