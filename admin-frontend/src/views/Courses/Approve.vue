<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">课程审批</h2>
      <div class="stats-cards">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">待审批</div>
            <div class="stat-value pending">{{ stats.pending }}</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">已通过</div>
            <div class="stat-value approved">{{ stats.approved }}</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">已拒绝</div>
            <div class="stat-value rejected">{{ stats.rejected }}</div>
          </div>
        </el-card>
      </div>
    </div>

    <el-card>
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-radio-group v-model="queryParams.status" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="DRAFT">待审批</el-radio-button>
          <el-radio-button label="PUBLISHED">已通过</el-radio-button>
          <el-radio-button label="ARCHIVED">已归档</el-radio-button>
        </el-radio-group>

        <div class="search-box">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索课程标题、教师"
            clearable
            style="width: 300px"
            @keyup.enter="loadList"
            @clear="loadList"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="loadList">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>

      <!-- 课程列表 -->
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="课程信息" min-width="300">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                :src="row.coverImage || '/default-course.png'"
                class="course-cover"
                fit="cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-details">
                <div class="course-title">{{ row.title }}</div>
                <div class="course-meta">
                  <span>讲师: {{ row.teacherName }}</span>
                  <span>学分: {{ row.credit }}</span>
                  <span>类型: {{ row.creditType === 'MASTER' ? '大师课' : '平时课' }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="开课时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>

        <el-table-column label="地点" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.location || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="审批状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.approvalStatus)">
              {{ getStatusText(row.approvalStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">
              查看
            </el-button>
            <template v-if="row.approvalStatus === 'PENDING_REVIEW'">
              <el-button link type="success" @click="handleApprove(row, 'APPROVE')">
                通过
              </el-button>
              <el-button link type="danger" @click="handleApprove(row, 'REJECT')">
                拒绝
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadList"
          @size-change="loadList"
        />
      </div>
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="课程详情"
      width="800px"
    >
      <div v-if="currentCourse" class="course-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程标题">
            {{ currentCourse.title }}
          </el-descriptions-item>
          <el-descriptions-item label="讲师">
            {{ currentCourse.teacherName }}
          </el-descriptions-item>
          <el-descriptions-item label="学分">
            {{ currentCourse.credit }}
          </el-descriptions-item>
          <el-descriptions-item label="课程类型">
            {{ currentCourse.creditType === 'MASTER' ? '大师课' : '平时课' }}
          </el-descriptions-item>
          <el-descriptions-item label="开课时间">
            {{ formatDate(currentCourse.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="地点">
            {{ currentCourse.location || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="最大人数">
            {{ currentCourse.maxStudents || '不限' }}
          </el-descriptions-item>
          <el-descriptions-item label="课程状态">
            <el-tag :type="getStatusType(currentCourse.status)">
              {{ getStatusText(currentCourse.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="课程介绍" :span="2">
            <div v-html="currentCourse.introduction"></div>
          </el-descriptions-item>
          <el-descriptions-item label="讲师介绍" :span="2">
            <div v-html="currentCourse.teacherIntro"></div>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentCourse.approvalRemark" label="审批备注" :span="2">
            {{ currentCourse.approvalRemark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <template v-if="currentCourse?.approvalStatus === 'PENDING_REVIEW'">
            <el-button type="success" @click="handleApprove(currentCourse, 'APPROVE')">
              通过
            </el-button>
            <el-button type="danger" @click="handleApprove(currentCourse, 'REJECT')">
              拒绝
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approveVisible"
      :title="approveForm.action === 'APPROVE' ? '审批通过' : '审批拒绝'"
      width="500px"
    >
      <el-form :model="approveForm" label-width="80px">
        <el-form-item label="课程">
          <div>{{ currentCourse?.title }}</div>
        </el-form-item>
        <el-form-item
          label="备注"
          :required="approveForm.action === 'REJECT'"
        >
          <el-input
            v-model="approveForm.remark"
            type="textarea"
            :rows="4"
            :placeholder="approveForm.action === 'APPROVE' ? '审批备注（选填）' : '请说明拒绝原因'"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approveVisible = false">取消</el-button>
          <el-button
            :type="approveForm.action === 'APPROVE' ? 'success' : 'danger'"
            :loading="submitting"
            @click="handleSubmitApprove"
          >
            确认{{ approveForm.action === 'APPROVE' ? '通过' : '拒绝' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Picture } from '@element-plus/icons-vue'
import { getCourseList, reviewCourse, type ReviewCourseData } from '@/api/course'
import type { Course } from '@/types/models'
import { formatDate } from '@/utils/format'

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  status: 'DRAFT', // 默认显示草稿状态（待审批）
  keyword: '',
})

// 列表数据
const loading = ref(false)
const list = ref<Course[]>([])
const total = ref(0)
const selectedRows = ref<Course[]>([])

// 统计数据
const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
})

// 详情对话框
const detailVisible = ref(false)
const currentCourse = ref<Course | null>(null)

// 审批对话框
const approveVisible = ref(false)
const approveForm = reactive<ReviewCourseData>({
  action: 'APPROVE',
  remark: '',
})
const submitting = ref(false)

/**
 * 加载列表
 */
const loadList = async () => {
  loading.value = true
  try {
    const data = await getCourseList(queryParams)
    list.value = data.items || []
    total.value = data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载统计数据
 */
const loadStats = async () => {
  try {
    // 分别获取各状态的数量
    const [pendingRes, approvedRes, archivedRes] = await Promise.all([
      getCourseList({ page: 1, pageSize: 1, status: 'DRAFT' }),
      getCourseList({ page: 1, pageSize: 1, status: 'PUBLISHED' }),
      getCourseList({ page: 1, pageSize: 1, status: 'ARCHIVED' }),
    ])

    stats.pending = pendingRes.total || 0
    stats.approved = approvedRes.total || 0
    stats.rejected = archivedRes.total || 0
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
  }
}

/**
 * 筛选变化
 */
const handleFilterChange = () => {
  queryParams.page = 1
  loadList()
}

/**
 * 选择变化
 */
const handleSelectionChange = (rows: Course[]) => {
  selectedRows.value = rows
}

/**
 * 查看详情
 */
const handleViewDetail = (row: Course) => {
  currentCourse.value = row
  detailVisible.value = true
}

/**
 * 审批
 */
const handleApprove = (row: Course, action: 'APPROVE' | 'REJECT') => {
  currentCourse.value = row
  approveForm.action = action
  approveForm.remark = ''
  approveVisible.value = true
  detailVisible.value = false
}

/**
 * 提交审批
 */
const handleSubmitApprove = async () => {
  if (!currentCourse.value) return

  // 拒绝时必须填写备注
  if (approveForm.action === 'REJECT' && !approveForm.remark?.trim()) {
    ElMessage.warning('请说明拒绝原因')
    return
  }

  submitting.value = true
  try {
    await reviewCourse(currentCourse.value.id, approveForm)
    
    ElMessage.success(
      approveForm.action === 'APPROVE' ? '审批通过成功' : '已拒绝该课程'
    )
    
    approveVisible.value = false
    loadList()
    loadStats()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 获取状态标签类型
 */
const getStatusType = (status?: string) => {
  if (!status) return 'info'
  const map: Record<string, any> = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    ARCHIVED: 'warning',
  }
  return map[status] || 'info'
}

/**
 * 获取状态文本
 */
const getStatusText = (status?: string) => {
  if (!status) return '未知'
  const map: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
  }
  return map[status] || status
}

// 初始化
onMounted(() => {
  loadList()
  loadStats()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 16px;
  }

  .stats-cards {
    display: flex;
    gap: 16px;

    .stat-card {
      flex: 1;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-content {
        text-align: center;

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;

          &.pending {
            color: #e6a23c;
          }

          &.approved {
            color: #67c23a;
          }

          &.rejected {
            color: #f56c6c;
          }
        }
      }
    }
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .search-box {
    display: flex;
    gap: 10px;
  }
}

.course-info {
  display: flex;
  gap: 12px;
  align-items: center;

  .course-cover {
    width: 80px;
    height: 60px;
    border-radius: 4px;
    flex-shrink: 0;

    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #909399;
    }
  }

  .course-details {
    flex: 1;

    .course-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
    }

    .course-meta {
      font-size: 12px;
      color: #909399;
      display: flex;
      gap: 12px;
    }
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.course-detail {
  :deep(.el-descriptions__body) {
    background: #fff;
  }

  :deep(.el-descriptions__label) {
    width: 120px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
