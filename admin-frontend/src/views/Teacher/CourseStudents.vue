<template>
  <div class="course-students">
    <el-page-header @back="router.back()" class="mb-20">
      <template #content>
        <span class="page-title">{{ courseTitle }} - 学员管理</span>
      </template>
    </el-page-header>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon :size="32"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studentsData.totalStudents }}</div>
              <div class="stat-label">总学员数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon qualified">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studentsData.qualifiedStudents }}</div>
              <div class="stat-label">符合条件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon issued">
              <el-icon :size="32"><Medal /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studentsData.issuedCount }}</div>
              <div class="stat-label">已发学分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon requirement">
              <el-icon :size="32"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studentsData.course?.requiredCheckins || 0 }}</div>
              <div class="stat-label">要求签到次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作栏 -->
    <el-card class="mb-20">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-button
            v-permission="'achievements:issue'"
            type="primary"
            :icon="Medal"
            :disabled="selectedStudents.length === 0"
            @click="handleCompleteSelected"
          >
            发放海报 ({{ selectedStudents.length }})
          </el-button>
          <el-button
            v-permission="'achievements:issue'"
            type="success"
            :icon="CircleCheck"
            @click="handleCompleteQualified"
          >
            发放海报给符合条件的学员
          </el-button>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索学员姓名或手机号"
            style="width: 250px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- 学员列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="filteredStudents"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="学员" min-width="200">
          <template #default="{ row }">
            <div class="student-info">
              <el-avatar :size="40" :src="row.avatar">{{ row.realName[0] }}</el-avatar>
              <div class="info">
                <div class="name">{{ row.realName }}</div>
                <div class="phone">{{ row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="签到情况" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isQualified ? 'success' : 'warning'">
              {{ row.checkinCount }} / {{ row.requiredCheckins }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否符合条件" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isQualified" type="success" :icon="CircleCheck">符合</el-tag>
            <el-tag v-else type="info" :icon="Close">不符合</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="课程状态" width="150" align="center">
          <template #default="{ row }">
            <div v-if="row.isCompleted" class="achievement-info">
              <el-tag type="success" :icon="Medal">
                已完成
              </el-tag>
              <div v-if="row.hasAchievement" class="issue-time">
                {{ formatDate(row.achievement.issuedAt) }}
              </div>
            </div>
            <el-tag v-else type="primary">进行中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.isCompleted"
              v-permission="'achievements:issue'"
              link
              type="primary"
              :icon="Medal"
              @click="handleCompleteSingle(row)"
            >
              发放海报
            </el-button>
            <el-tag v-else type="success" :icon="CircleCheck">已完成</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredStudents.length === 0" description="暂无学员数据" />
    </el-card>

    <!-- 发放海报对话框 -->
    <el-dialog
      v-model="completeDialogVisible"
      title="发放结课海报"
      width="500px"
    >
      <el-alert
        title="发放后学员将标记为“已完成”，并获得结课海报"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form label-width="100px">
        <el-form-item label="课程名称">
          <el-input :model-value="studentsData.course?.title" disabled />
        </el-form-item>
        <el-form-item label="发放对象">
          <el-input :model-value="`${completeUserIds.length} 名学员`" disabled />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="completeRemark"
            type="textarea"
            :rows="3"
            placeholder="选填，记录发放原因或说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="completing"
          @click="handleConfirmComplete"
        >
          确定发放
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  CircleCheck,
  Medal,
  Calendar,
  Search,
  Close,
} from '@element-plus/icons-vue'
import { getCourseStudents } from '@/api/achievement'
import { completeStudentManually, completeStudentsBatch } from '@/api/course-completion'
import type { CourseStudent, CourseStudentsResponse } from '@/api/achievement'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

// 路由参数
const courseId = ref(route.query.courseId as string)
const courseTitle = ref(route.query.courseTitle as string || '课程')

// 数据
const loading = ref(false)
const studentsData = ref<CourseStudentsResponse>({
  course: null,
  totalStudents: 0,
  qualifiedStudents: 0,
  issuedCount: 0,
  students: [],
} as any)
const selectedStudents = ref<CourseStudent[]>([])
const searchKeyword = ref('')

// 过滤后的学员列表
const filteredStudents = computed(() => {
  if (!searchKeyword.value) {
    return studentsData.value.students
  }
  const keyword = searchKeyword.value.toLowerCase()
  return studentsData.value.students.filter((student: CourseStudent) =>
    student.realName.toLowerCase().includes(keyword) ||
    student.phone.includes(keyword)
  )
})

// 发放海报相关
const completeDialogVisible = ref(false)
const completeUserIds = ref<string[]>([])
const completeRemark = ref('')
const completing = ref(false)

// 加载学员数据
const loadStudents = async () => {
  if (!courseId.value) {
    ElMessage.error('缺少课程ID参数')
    return
  }

  loading.value = true
  try {
    const res = await getCourseStudents(courseId.value)
    studentsData.value = res
    console.log('✅ 学员数据加载成功:', res)
  } catch (error: any) {
    ElMessage.error(error.message || '加载学员数据失败')
  } finally {
    loading.value = false
  }
}

// 表格选择变化
const handleSelectionChange = (selection: CourseStudent[]) => {
  selectedStudents.value = selection
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑在computed中实现
}

// 发放海报给选中的学员
const handleCompleteSelected = () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请选择要发放海报的学员')
    return
  }

  // 过滤出未完成的学员
  const incompleteStudents = selectedStudents.value.filter((s) => !s.isCompleted)
  
  if (incompleteStudents.length === 0) {
    ElMessage.warning('选中的学员都已完成课程')
    return
  }

  completeUserIds.value = incompleteStudents.map((s) => s.userId)
  completeRemark.value = ''
  completeDialogVisible.value = true
}

// 发放海报给符合条件的学员
const handleCompleteQualified = () => {
  const qualifiedStudents = studentsData.value.students.filter(
    (s: CourseStudent) => s.isQualified && !s.isCompleted
  )

  if (qualifiedStudents.length === 0) {
    ElMessage.warning('没有符合条件且未完成的学员')
    return
  }

  completeUserIds.value = qualifiedStudents.map((s) => s.userId)
  completeRemark.value = '批量发放给符合签到要求的学员'
  completeDialogVisible.value = true
}

// 发放海报给单个学员
const handleCompleteSingle = (student: CourseStudent) => {
  completeUserIds.value = [student.userId]
  completeRemark.value = ''
  completeDialogVisible.value = true
}

// 确认发放
const handleConfirmComplete = async () => {
  if (completeUserIds.value.length === 0) {
    ElMessage.warning('请选择要发放海报的学员')
    return
  }

  try {
    completing.value = true
    
    // 判断是单个还是批量发放
    if (completeUserIds.value.length === 1) {
      // 单个发放
      await completeStudentManually({
        courseId: courseId.value,
        userId: completeUserIds.value[0],
        remark: completeRemark.value || '教师手动发放',
      })
    } else {
      // 批量发放
      await completeStudentsBatch({
        courseId: courseId.value,
        userIds: completeUserIds.value,
        remark: completeRemark.value || '教师批量发放',
      })
    }

    ElMessage.success('发放成功')
    completeDialogVisible.value = false
    
    // 刷新数据
    await loadStudents()
    
    // 清空选择
    selectedStudents.value = []
  } catch (error: any) {
    ElMessage.error(error.msg || error.message || '发放失败')
  } finally {
    completing.value = false
  }
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped lang="scss">
.course-students {
  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;

        &.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.qualified {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.issued {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.requirement {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }

  .student-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .info {
      .name {
        font-weight: 500;
        color: #303133;
      }

      .phone {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }

  .achievement-info {
    .issue-time {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}
</style>
