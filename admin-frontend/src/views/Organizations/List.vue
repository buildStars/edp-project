<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="企业名称/联系人"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建企业
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 企业列表 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="企业名称" min-width="200" />
        
        <el-table-column label="企业管理员" min-width="150">
          <template #default="{ row }">
            <div>{{ row.admin?.realName || row.admin?.nickname || '-' }}</div>
            <div style="color: #999; font-size: 12px">
              {{ row.admin?.phone || '-' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="员工数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row._count?.users || 0 }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="联系信息" min-width="150">
          <template #default="{ row }">
            <div>{{ row.contactPerson || '-' }}</div>
            <div style="color: #999; font-size: 12px">
              {{ row.contactPhone || '-' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="学分配额" width="120" align="center">
          <template #default="{ row }">
            <div style="color: #52C41A; font-weight: bold">
              {{ row.totalCredits || 0 }}
            </div>
            <div style="color: #999; font-size: 12px">
              已用: {{ row.usedCredits || 0 }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleManageEmployees(row)">
              <el-icon><User /></el-icon>
              员工管理
            </el-button>
            <el-button link type="success" size="small" @click="handleAllocateCredit(row)">
              <el-icon><CreditCard /></el-icon>
              充值学分
            </el-button>
            <el-button link type="info" size="small" @click="handleStatistics(row)">
              <el-icon><DataAnalysis /></el-icon>
              统计
            </el-button>
            <el-button link type="warning" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑企业' : '新建企业'"
      width="40%"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入企业名称" />
        </el-form-item>

        <el-form-item label="企业管理员" prop="adminId">
          <el-select
            v-model="formData.adminId"
            filterable
            remote
            :remote-method="searchUsers"
            placeholder="搜索用户（输入姓名或手机号）"
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.realName || user.nickname} (${user.phone})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="最大员工数" prop="maxStudents">
          <el-input-number
            v-model="formData.maxStudents"
            :min="0"
            placeholder="最大员工数（0为不限制）"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="初始学分配额" prop="totalCredits">
          <el-input-number
            v-model="formData.totalCredits"
            :min="0"
            placeholder="企业初始学分配额"
            style="width: 100%"
          />
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            创建企业时分配的学分配额
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 充值学分弹窗 -->
    <el-dialog
      v-model="creditDialogVisible"
      title="为企业管理员充值学分"
      width="35%"
    >
      <el-alert
        title="提示"
        type="info"
        description="充值的学分会添加到企业管理员的个人学分账户中，管理员可以将学分分配给企业员工或为员工购买课程。"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form label-width="120px">
        <el-form-item label="企业名称">
          <el-input :value="selectedOrg?.name" disabled />
        </el-form-item>

        <el-form-item label="企业管理员">
          <el-input 
            :value="selectedOrg?.admin ? `${selectedOrg.admin.realName || selectedOrg.admin.nickname} (${selectedOrg.admin.phone})` : '-'" 
            disabled 
          />
        </el-form-item>

        <el-form-item label="充值学分数" required>
          <el-input-number
            v-model="creditAmount"
            :min="1"
            :max="10000"
            placeholder="请输入充值学分数"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="creditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAllocate" :loading="allocating">
          确认充值
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, User, DataAnalysis, CreditCard } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import * as organizationApi from '@/api/organization'
import * as userApi from '@/api/user'

const router = useRouter()

// 类型定义
interface Organization {
  id: string
  name: string
  adminId: string
  contactPerson?: string
  contactPhone?: string
  maxStudents: number
  totalCredits: number
  usedCredits: number
  createdAt: string
  admin?: any
  _count?: {
    users: number
  }
}

interface UserOption {
  id: string
  realName?: string
  nickname?: string
  phone: string
}

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref<Organization[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  adminId: '',
  contactPerson: '',
  contactPhone: '',
  maxStudents: 0,
  totalCredits: 0,
  usedCredits: 0
})

// 用户选项
const userOptions = ref<UserOption[]>([])

// 充值学分相关
const creditDialogVisible = ref(false)
const selectedOrg = ref<any>(null)
const creditAmount = ref(10)
const allocating = ref(false)

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  adminId: [{ required: true, message: '请选择企业管理员', trigger: 'change' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const data = await organizationApi.getOrganizations(params)
    tableData.value = (data as any).items || []
    pagination.total = (data as any).total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  pagination.page = 1
  loadData()
}

// 新建
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, row)
  userOptions.value = row.admin ? [row.admin] : []
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  if (!row.id) {
    ElMessage.error('企业 ID 不存在，无法删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除企业"${row.name}"吗？删除后无法恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await organizationApi.deleteOrganization(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}



const handleManageEmployees = (row: any) => {
  if (!row.id) {
    ElMessage.error('企业 ID 不存在，无法打开员工管理页面')
    return
  }
  
  router.push({
    path: `/organizations/${row.id}/employees`,
    query: { name: row.name }
  })
}

// 充值学分
const handleAllocateCredit = (row: any) => {
  selectedOrg.value = row
  creditAmount.value = 10
  creditDialogVisible.value = true
}

// 确认充值
const handleConfirmAllocate = async () => {
  if (!creditAmount.value || creditAmount.value <= 0) {
    ElMessage.warning('请输入有效的学分数量')
    return
  }

  if (!selectedOrg.value?.admin?.id) {
    ElMessage.error('企业管理员信息不完整')
    return
  }

  allocating.value = true
  try {
    // 直接调用用户学分充值API
    await userApi.allocateCredit(selectedOrg.value.admin.id, creditAmount.value)
    
    ElMessage.success(`成功为企业管理员充值 ${creditAmount.value} 学分`)
    creditDialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '充值失败')
  } finally {
    allocating.value = false
  }
}

// 查看统计
const handleStatistics = async (row: any) => {
  try {
    const stats = await organizationApi.getOrganizationStatistics(row.id) as any
    ElMessageBox.alert(
      `<div style="padding: 20px;">
        <div style="margin-bottom: 15px;">
          <strong>员工总数：</strong>${stats.totalUsers || 0} 人
        </div>
        <div style="margin-bottom: 15px;">
          <strong>总学分：</strong><span style="color: #52C41A;">${stats.totalCredits || 0}</span>
        </div>
        <div style="margin-bottom: 15px;">
          <strong>剩余学分：</strong><span style="color: #1890FF;">${stats.remainingCredits || 0}</span>
        </div>
        <div style="margin-bottom: 15px;">
          <strong>已使用学分：</strong><span style="color: #FF4D4F;">${stats.usedCredits || 0}</span>
        </div>
        <div>
          <strong>课程报名数：</strong>${stats.totalEnrollments || 0}
        </div>
      </div>`,
      `${row.name} - 统计信息`,
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭'
      }
    )
  } catch (error: any) {
    ElMessage.error(error.message || '获取统计信息失败')
  }
}

// 搜索用户
const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }
  try {
    const data = await userApi.getUsers({ keyword: query, pageSize: 20 })
    userOptions.value = (data as any).items || []
  } catch (error) {
    console.error('搜索用户失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      await organizationApi.updateOrganization(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      // 创建时，不传递 id 字段，让数据库自动生成
      const { id, ...createData } = formData
      await organizationApi.createOrganization(createData)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    adminId: '',
    contactPerson: '',
    contactPhone: '',
    maxStudents: 0,
    totalCredits: 0,
    usedCredits: 0
  })
  userOptions.value = []
  formRef.value?.clearValidate()
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
