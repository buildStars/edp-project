<template>
  <div class="refund-requests-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">退课申请管理</span>
          <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable @change="handleSearch">
            <el-option label="待审批" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" />
        
        <el-table-column label="学员信息" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <div class="info-row">
                <strong>{{ row.user.realName || row.user.nickname }}</strong>
              </div>
              <div class="info-row text-secondary">
                {{ row.user.phone }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="课程信息" min-width="250">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                :src="row.course.coverImage"
                fit="cover"
                class="course-cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-detail">
                <div class="course-title">{{ row.course.title }}</div>
                <div class="course-meta">
                  <span>退回学分：<el-tag size="small" type="danger">{{ row.creditAmount }}</el-tag></span>
                  <span style="margin-left: 12px">开课：{{ formatDate(row.course.startTime) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="报名时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.enrollment.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="退课原因" min-width="180">
          <template #default="{ row }">
            <el-text v-if="row.reason" type="info" size="small">
              {{ row.reason }}
            </el-text>
            <el-text v-else type="info" size="small">无</el-text>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="dark"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="审批信息" min-width="150">
          <template #default="{ row }">
            <div v-if="row.status !== 'PENDING'" class="review-info">
              <div class="info-row">
                <el-text size="small">
                  {{ formatDateTime(row.reviewedAt) }}
                </el-text>
              </div>
              <div v-if="row.reviewNote" class="info-row">
                <el-text type="info" size="small">
                  {{ row.reviewNote }}
                </el-text>
              </div>
            </div>
            <el-text v-else type="info" size="small">待审批</el-text>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status !== 'PENDING'"
              type="info"
              size="small"
              disabled
            >
              已处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="reviewDialog.visible"
      :title="reviewDialog.isApprove ? '通过退课申请' : '拒绝退课申请'"
      width="600px"
    >
      <el-form
        :model="reviewDialog.form"
        label-width="120px"
      >
        <el-form-item label="学员">
          <el-text>{{ reviewDialog.currentRequest?.user.realName || reviewDialog.currentRequest?.user.nickname }}</el-text>
        </el-form-item>

        <el-form-item label="课程">
          <el-text>{{ reviewDialog.currentRequest?.course.title }}</el-text>
        </el-form-item>

        <el-form-item label="退回学分">
          <el-tag type="danger">{{ reviewDialog.currentRequest?.creditAmount }}</el-tag>
          <el-text type="info" size="small" style="margin-left: 12px">
            通过后将自动退回学分并取消报名
          </el-text>
        </el-form-item>

        <el-form-item label="退课原因">
          <el-text v-if="reviewDialog.currentRequest?.reason" type="info">
            {{ reviewDialog.currentRequest.reason }}
          </el-text>
          <el-text v-else type="info">无</el-text>
        </el-form-item>

        <el-form-item label="审批备注">
          <el-input
            v-model="reviewDialog.form.reviewNote"
            type="textarea"
            :rows="4"
            placeholder="请输入审批备注（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="reviewDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="reviewDialog.loading"
          @click="submitReview"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Picture } from '@element-plus/icons-vue'
import type { RefundRequest, RefundRequestQuery } from '@/api/refund-request'
import { getRefundRequests, reviewRefundRequest } from '@/api/refund-request'
import dayjs from 'dayjs'

// 查询表单
const queryForm = reactive<RefundRequestQuery>({
  page: 1,
  pageSize: 20,
  status: undefined
})

// 表格数据
const loading = ref(false)
const tableData = ref<RefundRequest[]>([])
const total = ref(0)

// 审批对话框
const reviewDialog = reactive({
  visible: false,
  loading: false,
  isApprove: true,
  currentRequest: null as RefundRequest | null,
  form: {
    reviewNote: ''
  }
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const res = await getRefundRequests(queryForm)
    tableData.value = res.items
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.msg || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  loadData()
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return map[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return map[status] || 'info'
}

// 处理通过
const handleApprove = (row: RefundRequest) => {
  reviewDialog.isApprove = true
  reviewDialog.currentRequest = row
  reviewDialog.form.reviewNote = ''
  reviewDialog.visible = true
}

// 处理拒绝
const handleReject = (row: RefundRequest) => {
  reviewDialog.isApprove = false
  reviewDialog.currentRequest = row
  reviewDialog.form.reviewNote = ''
  reviewDialog.visible = true
}

// 提交审批
const submitReview = async () => {
  if (!reviewDialog.currentRequest) return

  try {
    reviewDialog.loading = true

    await reviewRefundRequest(reviewDialog.currentRequest.id, {
      status: reviewDialog.isApprove ? 'APPROVED' : 'REJECTED',
      reviewNote: reviewDialog.form.reviewNote
    })

    ElMessage.success(reviewDialog.isApprove ? '已通过退课申请' : '已拒绝退课申请')
    reviewDialog.visible = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.msg || '操作失败')
  } finally {
    reviewDialog.loading = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.refund-requests-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .search-form {
    margin-bottom: 16px;
  }

  .user-info {
    .info-row {
      line-height: 1.8;
      font-size: 14px;

      &.text-secondary {
        color: #909399;
        font-size: 13px;
      }
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
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background: #f5f7fa;
        color: #909399;
        font-size: 24px;
      }
    }

    .course-detail {
      flex: 1;

      .course-title {
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.4;
      }

      .course-meta {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .review-info {
    .info-row {
      line-height: 1.8;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>



