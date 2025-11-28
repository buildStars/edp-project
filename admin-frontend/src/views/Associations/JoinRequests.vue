<template>
  <div class="join-requests-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="协会">
          <el-select 
            v-model="queryParams.associationId" 
            placeholder="全部协会" 
            clearable 
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="assoc in associationOptions"
              :key="assoc.id"
              :label="assoc.name"
              :value="assoc.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon pending">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">待审核</div>
              <div class="stat-value">{{ stats.pending }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon approved">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已通过</div>
              <div class="stat-value">{{ stats.approved }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon rejected">
              <el-icon :size="32"><CircleClose /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已拒绝</div>
              <div class="stat-value">{{ stats.rejected }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32"><DocumentCopy /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">总申请</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column label="申请人" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.user.avatar">
                {{ row.user.realName?.[0] || row.user.nickname?.[0] || 'U' }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ row.user.realName || row.user.nickname || '未知' }}</div>
                <div class="user-phone">{{ row.user.phone || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="公司/职位" width="200">
          <template #default="{ row }">
            <div v-if="row.user.company || row.user.position">
              <div>{{ row.user.company || '-' }}</div>
              <div class="text-secondary">{{ row.user.position || '-' }}</div>
            </div>
            <div v-else class="text-secondary">-</div>
          </template>
        </el-table-column>
        <el-table-column label="申请协会" width="250">
          <template #default="{ row }">
            <div class="association-info">
              <el-avatar :size="40" :src="row.association.logo" shape="square">
                {{ row.association.name[0] }}
              </el-avatar>
              <div class="association-details">
                <div class="association-name">{{ row.association.name }}</div>
                <el-tag :type="row.association.type === 'ALUMNI' ? 'primary' : 'success'" size="small">
                  {{ row.association.type === 'ALUMNI' ? '同学会' : '俱乐部' }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="申请理由" min-width="200">
          <template #default="{ row }">
            <div class="reason-text">{{ row.reason || '无' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'PENDING'" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 'APPROVED'" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === 'REJECTED'" type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="审批信息" width="200">
          <template #default="{ row }">
            <div v-if="row.reviewedAt">
              <div class="reviewer">{{ row.reviewer?.realName || row.reviewer?.nickname || '-' }}</div>
              <div class="text-secondary">{{ formatDate(row.reviewedAt) }}</div>
              <div v-if="row.reviewNote" class="review-note">{{ row.reviewNote }}</div>
            </div>
            <div v-else class="text-secondary">-</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'PENDING'">
              <el-button type="success" size="small" @click="handleApprove(row)">
                通过
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">
                拒绝
              </el-button>
            </template>
            <template v-else>
              <el-button type="info" size="small" disabled>已处理</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝申请" width="500px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef" label-width="100px">
        <el-form-item label="申请人">
          <span>{{ currentRequest?.user.realName || currentRequest?.user.nickname }}</span>
        </el-form-item>
        <el-form-item label="申请协会">
          <span>{{ currentRequest?.association.name }}</span>
        </el-form-item>
        <el-form-item label="拒绝理由" prop="reviewNote">
          <el-input
            v-model="rejectForm.reviewNote"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝理由，将会展示给申请人"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Clock, CircleCheck, CircleClose, DocumentCopy } from '@element-plus/icons-vue'
import { 
  getJoinRequestList, 
  reviewJoinRequest,
  getAssociationList,
  type AssociationJoinRequest,
  type JoinRequestQueryParams 
} from '@/api/association'
import type { FormInstance, FormRules } from 'element-plus'

// 数据
const loading = ref(false)
const submitting = ref(false)
const tableData = ref<AssociationJoinRequest[]>([])
const total = ref(0)
const associationOptions = ref<any[]>([])

// 查询参数
const queryParams = reactive<JoinRequestQueryParams>({
  page: 1,
  pageSize: 20,
  associationId: undefined,
  status: undefined
})

// 统计数据
const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectFormRef = ref<FormInstance>()
const currentRequest = ref<AssociationJoinRequest>()
const rejectForm = reactive({
  reviewNote: ''
})
const rejectRules: FormRules = {
  reviewNote: [
    { required: true, message: '请输入拒绝理由', trigger: 'blur' },
    { min: 5, message: '拒绝理由至少5个字符', trigger: 'blur' }
  ]
}

// 加载协会列表（用于筛选）
const loadAssociations = async () => {
  try {
    const res = await getAssociationList({ page: 1, pageSize: 100 })
    associationOptions.value = res.items || res.list || []
  } catch (error: any) {
    console.error('加载协会列表失败', error)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getJoinRequestList(queryParams)
    tableData.value = res.items || res.list || []
    total.value = res.total || 0
    
    // 更新统计数据
    updateStats()
  } catch (error: any) {
    ElMessage.error(error.msg || '加载失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = async () => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      getJoinRequestList({ page: 1, pageSize: 1, status: 'PENDING' }),
      getJoinRequestList({ page: 1, pageSize: 1, status: 'APPROVED' }),
      getJoinRequestList({ page: 1, pageSize: 1, status: 'REJECTED' })
    ])
    stats.pending = pending.total
    stats.approved = approved.total
    stats.rejected = rejected.total
    stats.total = stats.pending + stats.approved + stats.rejected
  } catch (error) {
    console.error('更新统计数据失败', error)
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryParams.page = 1
  queryParams.pageSize = 20
  queryParams.associationId = undefined
  queryParams.status = undefined
  loadData()
}

// 分页变化
const handlePageChange = () => {
  loadData()
}

// 通过申请
const handleApprove = (row: AssociationJoinRequest) => {
  ElMessageBox.confirm(
    `确认通过用户「${row.user.realName || row.user.nickname}」加入「${row.association.name}」的申请？`,
    '确认通过',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      await reviewJoinRequest(row.id, {
        status: 'APPROVED'
      })
      ElMessage.success('审批成功')
      loadData()
    } catch (error: any) {
      ElMessage.error(error.msg || '审批失败')
    }
  }).catch(() => {})
}

// 拒绝申请
const handleReject = (row: AssociationJoinRequest) => {
  currentRequest.value = row
  rejectForm.reviewNote = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectFormRef.value) return
  
  await rejectFormRef.value.validate(async (valid) => {
    if (valid && currentRequest.value) {
      try {
        submitting.value = true
        await reviewJoinRequest(currentRequest.value.id, {
          status: 'REJECTED',
          reviewNote: rejectForm.reviewNote
        })
        ElMessage.success('已拒绝申请')
        rejectDialogVisible.value = false
        loadData()
      } catch (error: any) {
        ElMessage.error(error.msg || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化
onMounted(() => {
  loadAssociations()
  loadData()
})
</script>

<style scoped lang="scss">
.join-requests-list {
  .search-card {
    margin-bottom: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.pending {
        background: linear-gradient(135deg, #FFA940 0%, #FFD666 100%);
        color: #fff;
      }

      &.approved {
        background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
        color: #fff;
      }

      &.rejected {
        background: linear-gradient(135deg, #F5222D 0%, #FF4D4F 100%);
        color: #fff;
      }

      &.total {
        background: linear-gradient(135deg, #1890FF 0%, #40A9FF 100%);
        color: #fff;
      }
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: #8c8c8c;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #262626;
      }
    }
  }

  .user-info, .association-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-details, .association-details {
      flex: 1;
      min-width: 0;

      .user-name, .association-name {
        font-weight: 500;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-phone {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }

  .reason-text {
    color: #595959;
    line-height: 1.6;
    max-height: 3.2em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .reviewer {
    font-weight: 500;
    margin-bottom: 2px;
  }

  .review-note {
    font-size: 12px;
    color: #ff4d4f;
    margin-top: 4px;
    line-height: 1.4;
  }

  .text-secondary {
    font-size: 12px;
    color: #8c8c8c;
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

