<template>
  <div class="completion-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>结课申请审批</span>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" class="mb-20">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待审批" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="list">
        <el-table-column prop="course.title" label="课程名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="teacherName" label="申请教师" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'PENDING'" type="warning">待审批</el-tag>
            <el-tag v-else-if="row.status === 'APPROVED'" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === 'REJECTED'" type="danger">已拒绝</el-tag>
            <el-tag v-else type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalStudents" label="总学员数" width="100" align="center" />
        <el-table-column prop="qualifiedStudents" label="符合条件" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success">{{ row.qualifiedStudents }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审批人" width="120">
          <template #default="{ row }">
            <span v-if="row.reviewerName">{{ row.reviewerName }}</span>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>
        <el-table-column label="审批时间" width="180">
          <template #default="{ row }">
            <span v-if="row.reviewedAt">{{ formatDate(row.reviewedAt) }}</span>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              v-permission="'completion:review'"
              link
              type="success"
              @click="handleApprove(row)"
            >
              <el-icon><CircleCheck /></el-icon>
              通过
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              v-permission="'completion:review'"
              link
              type="danger"
              @click="handleReject(row)"
            >
              <el-icon><CircleClose /></el-icon>
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="pagination.total > 0"
        class="mt-20"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />

      <el-empty v-if="!loading && list.length === 0" description="暂无申请记录" />
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="结课申请详情"
      width="600px"
    >
      <el-descriptions v-if="currentRequest" :column="2" border>
        <el-descriptions-item label="课程名称" :span="2">
          {{ currentRequest.course.title }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentRequest.status === 'PENDING'" type="warning">待审批</el-tag>
          <el-tag v-else-if="currentRequest.status === 'APPROVED'" type="success">已通过</el-tag>
          <el-tag v-else-if="currentRequest.status === 'REJECTED'" type="danger">已拒绝</el-tag>
          <el-tag v-else type="info">已取消</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请教师">
          {{ currentRequest.teacherName }}
        </el-descriptions-item>
        <el-descriptions-item label="总学员数">
          {{ currentRequest.totalStudents }}
        </el-descriptions-item>
        <el-descriptions-item label="符合条件">
          <el-tag type="success">{{ currentRequest.qualifiedStudents }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">
          {{ formatDate(currentRequest.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRequest.reviewerName" label="审批人">
          {{ currentRequest.reviewerName }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRequest.reviewedAt" label="审批时间">
          {{ formatDate(currentRequest.reviewedAt) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRequest.reviewRemark" label="审批备注" :span="2">
          {{ currentRequest.reviewRemark }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewForm.status === 'APPROVED' ? '通过申请' : '拒绝申请'"
      width="500px"
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="课程名称">
          <el-input :model-value="currentRequest?.course.title" disabled />
        </el-form-item>
        <el-form-item label="申请教师">
          <el-input :model-value="currentRequest?.teacherName" disabled />
        </el-form-item>
        <el-form-item label="符合条件">
          <el-input :model-value="`${currentRequest?.qualifiedStudents} / ${currentRequest?.totalStudents} 人`" disabled />
        </el-form-item>
        <el-form-item label="审批备注">
          <el-input
            v-model="reviewForm.remark"
            type="textarea"
            :rows="4"
            :placeholder="reviewForm.status === 'APPROVED' ? '选填，记录通过原因' : '必填，说明拒绝原因'"
          />
        </el-form-item>
        <el-alert
          v-if="reviewForm.status === 'APPROVED'"
          title="提示：审批通过后将执行以下操作"
          type="success"
          :closable="false"
        >
          <div style="margin-top: 8px;">
            <div>1. 课程状态更新为"已归档"</div>
            <div>2. 自动发放学习成果给符合签到要求的学员</div>
          </div>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button
          :type="reviewForm.status === 'APPROVED' ? 'success' : 'danger'"
          :loading="reviewing"
          @click="handleConfirmReview"
        >
          确定{{ reviewForm.status === 'APPROVED' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import {
  getCompletionRequestList,
  reviewCompletionRequest,
  type CourseCompletionRequest,
} from '@/api/course-completion'
import { formatDate } from '@/utils/format'

// 查询参数
const queryParams = reactive({
  status: '' as any,
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 数据
const loading = ref(false)
const list = ref<CourseCompletionRequest[]>([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentRequest = ref<CourseCompletionRequest | null>(null)

// 审批对话框
const reviewDialogVisible = ref(false)
const reviewForm = reactive({
  status: '' as 'APPROVED' | 'REJECTED',
  remark: '',
})
const reviewing = ref(false)

// 查询列表
const handleSearch = async () => {
  loading.value = true
  try {
    const res = await getCompletionRequestList({
      ...queryParams,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    list.value = res.items
    pagination.total = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  queryParams.status = ''
  pagination.page = 1
  handleSearch()
}

// 查看详情
const handleView = (row: CourseCompletionRequest) => {
  currentRequest.value = row
  detailDialogVisible.value = true
}

// 通过申请
const handleApprove = (row: CourseCompletionRequest) => {
  currentRequest.value = row
  reviewForm.status = 'APPROVED'
  reviewForm.remark = ''
  reviewDialogVisible.value = true
}

// 拒绝申请
const handleReject = (row: CourseCompletionRequest) => {
  currentRequest.value = row
  reviewForm.status = 'REJECTED'
  reviewForm.remark = ''
  reviewDialogVisible.value = true
}

// 确认审批
const handleConfirmReview = async () => {
  if (!currentRequest.value) return

  if (reviewForm.status === 'REJECTED' && !reviewForm.remark.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }

  try {
    reviewing.value = true
    await reviewCompletionRequest(currentRequest.value.id, {
      status: reviewForm.status,
      remark: reviewForm.remark,
    })

    ElMessage.success(reviewForm.status === 'APPROVED' ? '已通过申请' : '已拒绝申请')
    reviewDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    ElMessage.error(error.message || '审批失败')
  } finally {
    reviewing.value = false
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped lang="scss">
.completion-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .text-secondary {
    color: #909399;
  }
}
</style>

