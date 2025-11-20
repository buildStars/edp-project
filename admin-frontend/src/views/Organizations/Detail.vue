<template>
  <div class="organization-detail">
    <el-page-header title="返回" @back="handleBack">
      <template #content>
        <span class="page-title">企业详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" shadow="never" style="margin-top: 16px">
      <!-- 基本信息 -->
      <div class="section">
        <div class="section-title">
          <el-icon><OfficeBuilding /></el-icon>
          企业信息
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="企业名称">{{ orgInfo.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="负责人ID">{{ orgInfo.adminId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="可上课人数">
            <el-tag type="primary">{{ orgInfo.maxStudents || 0 }} 人</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="员工数量">
            <el-tag type="success">{{ orgInfo._count?.users || 0 }} 人</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总学分">
            <span style="font-size: 18px; font-weight: bold; color: var(--el-color-primary)">
              {{ orgInfo.totalCredits || 0 }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="已用学分">
            <span style="font-size: 18px; font-weight: bold; color: var(--el-color-warning)">
              {{ orgInfo.usedCredits || 0 }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="剩余学分">
            <span style="font-size: 18px; font-weight: bold; color: var(--el-color-success)">
              {{ (orgInfo.totalCredits || 0) - (orgInfo.usedCredits || 0) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="学分使用率">
            <el-progress
              :percentage="creditUsageRate"
              :color="getProgressColor(creditUsageRate)"
            />
          </el-descriptions-item>
          <el-descriptions-item label="联系人">{{ orgInfo.contactPerson || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ orgInfo.contactPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDate(orgInfo.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 学分使用统计 -->
      <div class="section">
        <div class="section-title">
          <el-icon><PieChart /></el-icon>
          学分使用统计
        </div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-icon total">
                <el-icon :size="32"><Coin /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">总学分</div>
                <div class="stat-value">{{ orgInfo.totalCredits || 0 }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-icon used">
                <el-icon :size="32"><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">已用学分</div>
                <div class="stat-value">{{ orgInfo.usedCredits || 0 }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-icon remaining">
                <el-icon :size="32"><Wallet /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">剩余学分</div>
                <div class="stat-value">
                  {{ (orgInfo.totalCredits || 0) - (orgInfo.usedCredits || 0) }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 员工列表 -->
      <div class="section">
        <div class="section-title">
          <el-icon><User /></el-icon>
          企业员工 ({{ users.length }})
          <el-button
            type="primary"
            size="small"
            style="margin-left: auto"
            @click="handleViewAllUsers"
          >
            查看全部
          </el-button>
        </div>
        <el-table :data="users.slice(0, 10)" border>
          <el-table-column label="头像" width="80">
            <template #default="{ row }">
              <el-avatar :src="row.avatar" :size="40">
                {{ row.realName?.charAt(0) || '员' }}
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="姓名" width="120" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="getRoleType(row.role)">
                {{ getRoleLabel(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
                {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="职位" width="120" />
          <el-table-column label="加入时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
        <div v-if="users.length > 10" class="more-tip">
          还有 {{ users.length - 10 }} 位员工，<el-link type="primary" @click="handleViewAllUsers">查看全部</el-link>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" @click="handleEdit">编辑企业</el-button>
        <el-button type="success" @click="handleAllocateCredits">分配学分</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-card>

    <!-- 分配学分对话框 -->
    <el-dialog v-model="creditDialogVisible" title="分配学分" width="500px">
      <el-form :model="creditForm" label-width="100px">
        <el-form-item label="企业名称">
          <el-input v-model="orgInfo.name" disabled />
        </el-form-item>
        <el-form-item label="学分数量">
          <el-input-number
            v-model="creditForm.amount"
            :min="1"
            :max="1000"
            placeholder="请输入学分数量"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="有效天数">
          <el-input-number
            v-model="creditForm.validDays"
            :min="1"
            :max="3650"
            placeholder="请输入有效天数"
            style="width: 100%"
          />
          <div class="form-tip">学分将在指定天数后过期</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="creditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveCredits">
          确定分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  OfficeBuilding,
  User,
  PieChart,
  Coin,
  TrendCharts,
  Wallet,
} from '@element-plus/icons-vue'
import { getOrganizationDetail, allocateCredits } from '@/api/organization'
import { formatDate } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const orgInfo = reactive<any>({})
const users = ref<any[]>([])

// 学分使用率
const creditUsageRate = computed(() => {
  const total = orgInfo.totalCredits || 0
  const used = orgInfo.usedCredits || 0
  return total > 0 ? Math.round((used / total) * 100) : 0
})

// 进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#F56C6C'
  if (percentage >= 70) return '#E6A23C'
  return '#67C23A'
}

// 角色标签
const getRoleType = (role: string): 'info' | 'success' | 'warning' | 'primary' | 'danger' => {
  const map: Record<string, 'info' | 'success' | 'warning' | 'primary' | 'danger'> = {
    STUDENT: 'info',
    ADVISOR: 'success',
    TEACHER: 'warning',
    STAFF: 'primary',
    ADMIN: 'danger',
  }
  return map[role] || 'info'
}

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    STUDENT: '学员',
    ADVISOR: '课程顾问',
    TEACHER: '教师',
    STAFF: '教务人员',
    ADMIN: '管理员',
  }
  return map[role] || role
}

// 加载详情
const loadDetail = async () => {
  const id = route.query.id as string
  if (!id) {
    ElMessage.error('企业ID不存在')
    handleBack()
    return
  }

  try {
    loading.value = true
    const data = await getOrganizationDetail(id)
    Object.assign(orgInfo, data)
    users.value = (data as any).users || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载企业详情失败')
    handleBack()
  } finally {
    loading.value = false
  }
}

// 分配学分
const creditDialogVisible = ref(false)
const submitting = ref(false)
const creditForm = reactive({
  amount: 10,
  validDays: 365,
})

const handleAllocateCredits = () => {
  creditForm.amount = 10
  creditForm.validDays = 365
  creditDialogVisible.value = true
}

const handleSaveCredits = async () => {
  try {
    submitting.value = true
    await allocateCredits(route.query.id as string, creditForm)
    ElMessage.success('学分分配成功')
    creditDialogVisible.value = false
    loadDetail()
  } catch (error: any) {
    ElMessage.error(error.message || '分配失败')
  } finally {
    submitting.value = false
  }
}

// 编辑
const handleEdit = () => {
  router.push(`/organizations/list?edit=${route.query.id}`)
}

// 查看所有员工
const handleViewAllUsers = () => {
  router.push(`/users/list?organizationId=${route.query.id}`)
}

// 返回
const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped lang="scss">
.organization-detail {
  .page-title {
    font-size: 16px;
    font-weight: 500;
  }

  .section {
    margin-bottom: 32px;

    &:last-of-type {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 3px solid var(--el-color-primary);
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.used {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.remaining {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: var(--el-text-color-primary);
      }
    }
  }

  .more-tip {
    margin-top: 16px;
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .form-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
    margin-top: 4px;
  }

  .actions {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
