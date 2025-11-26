<template>
  <div class="users-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="用户角色">
          <el-select v-model="queryParams.role" placeholder="全部" clearable style="width: 150px">
            <el-option label="学员" value="STUDENT" />
            <el-option label="课程顾问" value="ADVISOR" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="教务人员" value="STAFF" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="禁用" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="姓名/手机号/邮箱"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <el-button v-permission="'users:create'" type="primary" :icon="Plus" @click="handleAdd">
        新增用户
      </el-button>
      <el-button v-permission="'advisors:view'" :icon="Document" @click="goToAdvisors">
        课程顾问管理
      </el-button>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="50">
              {{ row.realName?.charAt(0) || row.nickname?.charAt(0) || '用' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
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
        <el-table-column prop="company" label="公司" width="150" show-overflow-tooltip />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column label="课程顾问" width="120">
          <template #default="{ row }">
            <span v-if="row.advisor">{{ row.advisor.realName }}</span>
            <span v-else class="text-secondary">未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canViewDetail" link type="primary" @click="handleView(row)">查看</el-button>
            <el-button v-permission="'users:edit'" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="'advisors:assign'" link type="primary" @click="handleAssignAdvisor(row)">
              分配顾问
            </el-button>
            <el-button 
              v-if="hasPermission(['credits:manage', 'credit-requests:create'])" 
              link 
              type="primary" 
              @click="handleManageCredit(row)"
            >
              {{ isTeacher ? '申请学分' : '学分管理' }}
            </el-button>
            <el-button
              v-permission="'users:status'"
              link
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
            </el-button>
            <el-button v-permission="'users:delete'" link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 分配顾问对话框 -->
    <el-dialog v-model="advisorDialogVisible" title="分配课程顾问" width="500px">
      <el-form :model="advisorForm" label-width="100px">
        <el-form-item label="用户">
          <el-input v-model="currentUser.realName" disabled />
        </el-form-item>
        <el-form-item label="课程顾问">
          <el-select v-model="advisorForm.advisorId" placeholder="请选择课程顾问" style="width: 100%">
            <el-option
              v-for="advisor in advisorList"
              :key="advisor.id"
              :label="advisor.realName"
              :value="advisor.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="advisorDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveAdvisor">确定</el-button>
      </template>
    </el-dialog>

    <!-- 学分管理对话框 -->
    <el-dialog v-model="creditDialogVisible" title="学分管理" width="500px">
      <el-alert
        v-if="isTeacher"
        title="提示"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        教师需要提交学分申请，经教务审批后才能生效
      </el-alert>
      <el-alert
        v-else
        title="提示"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        管理员/教务可以直接分配学分，无需审批
      </el-alert>
      <el-form ref="creditFormRef" :model="creditForm" :rules="creditRules" label-width="100px">
        <el-form-item label="用户">
          <el-input v-model="currentUser.realName" disabled />
        </el-form-item>
        <el-form-item label="学分数量" prop="amount">
          <el-input-number
            v-model="creditForm.amount"
            :min="1"
            :max="1000"
            placeholder="请输入学分数量"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="isTeacher ? '申请理由' : '备注'" prop="reason">
          <el-input
            v-model="creditForm.reason"
            type="textarea"
            :rows="3"
            :placeholder="isTeacher ? '请输入申请理由' : '请输入备注（可选）'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="creditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveCredit">
          {{ isTeacher ? '提交申请' : '确定分配' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑用户" width="600px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="editForm.password" 
            type="password" 
            placeholder="留空表示不修改密码" 
            show-password 
            clearable
          />
          <span style="color: #999; font-size: 12px; display: block; margin-top: 4px">
            留空表示不修改密码，如需修改请输入新密码（至少6位）
          </span>
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="editForm.company" placeholder="请输入公司" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="editForm.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select
            v-model="editForm.role"
            placeholder="请选择角色"
            style="width: 100%"
            :disabled="isTeacher"
          >
            <el-option label="学员" value="STUDENT" />
            <el-option v-if="!isTeacher" label="课程顾问" value="ADVISOR" />
            <el-option v-if="!isTeacher" label="教师" value="TEACHER" />
            <el-option v-if="!isTeacher" label="教务人员" value="STAFF" />
            <el-option v-if="!isTeacher" label="管理员" value="ADMIN" />
          </el-select>
          <span v-if="isTeacher" style="color: #999; font-size: 12px; display: block; margin-top: 4px">
            教师不能修改用户角色
          </span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio label="ACTIVE">正常</el-radio>
            <el-radio label="INACTIVE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增用户对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增用户" width="700px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="addForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称">
              <el-input v-model="addForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="addForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="addForm.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="MALE" />
                <el-option label="女" value="FEMALE" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select
                v-model="addForm.role"
                placeholder="请选择角色"
                style="width: 100%"
                :disabled="isTeacher"
              >
                <el-option label="学员" value="STUDENT" />
                <el-option v-if="!isTeacher" label="课程顾问" value="ADVISOR" />
                <el-option v-if="!isTeacher" label="教师" value="TEACHER" />
                <el-option v-if="!isTeacher" label="教务人员" value="STAFF" />
                <el-option v-if="!isTeacher" label="管理员" value="ADMIN" />
              </el-select>
              <span v-if="isTeacher" style="color: #999; font-size: 12px">
                教师只能创建学员账号
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="addForm.status">
                <el-radio label="ACTIVE">正常</el-radio>
                <el-radio label="INACTIVE">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司">
              <el-input v-model="addForm.company" placeholder="请输入公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input v-model="addForm.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="身份证号">
          <el-input v-model="addForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveAdd">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Document } from '@element-plus/icons-vue'
import {
  getUserList,
  createUser,
  deleteUser,
  updateUser,
  assignAdvisor,
  getAdvisorList,
  type CreateUserData,
} from '@/api/user'
import { allocateCredit } from '@/api/credit'
import { createCreditRequest } from '@/api/credit-request'
import type { User } from '@/types/models'
import { formatDate } from '@/utils/format'
import { useTable } from '@/composables/useTable'
import { validatePhone, validateEmail } from '@/utils/validate'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 当前登录用户角色
const currentUserRole = computed(() => authStore.userInfo?.role || '')
const isTeacher = computed(() => currentUserRole.value === 'TEACHER')
// 只有管理员和教务可以查看用户详情
const canViewDetail = computed(() => ['ADMIN', 'STAFF'].includes(currentUserRole.value))

// 权限检查方法：检查用户是否拥有列表中的任一权限
const hasPermission = (permissions: string[]) => {
  const userPermissions = authStore.permissions || []
  return permissions.some(p => userPermissions.includes(p))
}

// 表格数据
const {
  loading,
  tableData,
  total,
  queryParams,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
} = useTable<User>({
  fetchApi: getUserList,
  immediate: false,
})

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

// 分配顾问
const advisorDialogVisible = ref(false)
const advisorList = ref<User[]>([])
const currentUser = reactive<any>({})
const advisorForm = reactive({
  advisorId: '',
})
const submitting = ref(false)

const handleAssignAdvisor = async (row: User) => {
  Object.assign(currentUser, row)
  advisorForm.advisorId = row.advisorId || ''
  
  // 加载顾问列表
  try {
    advisorList.value = await getAdvisorList()
    advisorDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载顾问列表失败')
  }
}

const handleSaveAdvisor = async () => {
  if (!advisorForm.advisorId) {
    ElMessage.warning('请选择课程顾问')
    return
  }

  try {
    submitting.value = true
    await assignAdvisor(currentUser.id, advisorForm.advisorId)
    ElMessage.success('分配成功')
    advisorDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    ElMessage.error(error.message || '分配失败')
  } finally {
    submitting.value = false
  }
}

// 学分管理
const creditDialogVisible = ref(false)
const creditFormRef = ref<FormInstance>()
const creditForm = reactive({
  amount: 1,
  reason: '',
})
const creditRules: FormRules = {
  amount: [{ required: true, message: '请输入学分数量', trigger: 'blur' }],
  reason: [
    {
      required: isTeacher.value,
      message: '请输入申请理由',
      trigger: 'blur',
    },
  ],
}

const handleManageCredit = (row: User) => {
  Object.assign(currentUser, row)
  creditForm.amount = 1
  creditForm.reason = ''
  creditDialogVisible.value = true
}

const handleSaveCredit = async () => {
  if (!creditFormRef.value) return

  try {
    await creditFormRef.value.validate()

    submitting.value = true

    if (isTeacher.value) {
      // 教师提交学分申请
      await createCreditRequest({
        userId: currentUser.id,
        amount: creditForm.amount,
        reason: creditForm.reason,
      })
      ElMessage.success('学分申请已提交，等待审批')
    } else {
      // 管理员/教务直接分配学分
      await allocateCredit({
        userId: currentUser.id,
        amount: creditForm.amount,
        remark: creditForm.reason || '管理员分配',
      })
      ElMessage.success('学分分配成功')
    }

    creditDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 编辑用户
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: '',
  realName: '',
  phone: '',
  email: '',
  password: '',
  company: '',
  position: '',
  role: 'STUDENT',
  status: 'ACTIVE',
})

// 密码验证器（可选字段，但如果填写则至少6位）
const validateEditPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    // 密码为空，不修改密码，验证通过
    callback()
  } else if (value.length < 6) {
    callback(new Error('密码至少需要6位'))
  } else {
    callback()
  }
}

const editRules: FormRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ validator: validatePhone as any, trigger: 'blur' }],
  email: [{ validator: validateEmail as any, trigger: 'blur' }],
  password: [{ validator: validateEditPassword as any, trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const handleEdit = (row: User) => {
  Object.assign(editForm, {
    id: row.id,
    realName: row.realName || '',
    phone: row.phone || '',
    email: row.email || '',
    password: '', // 默认为空，不修改密码
    company: row.company || '',
    position: row.position || '',
    role: row.role,
    status: row.status,
  })
  editDialogVisible.value = true
}

const handleSaveEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    submitting.value = true

    const { id, password, ...data } = editForm
    // 只有当密码不为空时才包含密码字段
    const updateData = password ? { ...data, password } : data
    await updateUser(id, updateData)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    submitting.value = false
  }
}

// 查看详情
const handleView = (row: User) => {
  router.push(`/users/detail/${row.id}`)
}

// 切换状态
const handleToggleStatus = async (row: User) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const action = newStatus === 'ACTIVE' ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(`确定要${action}用户"${row.realName}"吗？`, '提示', {
      type: 'warning',
    })
    await updateUser(row.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || `${action}失败`)
    }
  }
}

// 删除
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.realName}"吗？此操作不可恢复！`, '提示', {
      type: 'warning',
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 新增用户
const addDialogVisible = ref(false)
const addFormRef = ref<FormInstance>()
const addForm = reactive<CreateUserData>({
  phone: '',
  email: '',
  password: '',
  nickname: '',
  realName: '',
  gender: undefined,
  role: 'STUDENT',
  status: 'ACTIVE',
  company: '',
  position: '',
  idCard: '',
})

const addRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: validatePhone as any, trigger: 'blur' },
  ],
  email: [{ validator: validateEmail as any, trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const handleAdd = () => {
  addDialogVisible.value = true
  // 重置表单
  Object.assign(addForm, {
    phone: '',
    email: '',
    password: '',
    nickname: '',
    realName: '',
    gender: undefined,
    role: 'STUDENT',
    status: 'ACTIVE',
    company: '',
    position: '',
    idCard: '',
  })
  addFormRef.value?.clearValidate()
}

const handleSaveAdd = async () => {
  if (!addFormRef.value) return

  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        await createUser(addForm)
        ElMessage.success('创建成功')
        addDialogVisible.value = false
        handleSearch()
      } catch (error: any) {
        ElMessage.error(error.message || '创建失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 跳转课程顾问管理
const goToAdvisors = () => {
  router.push('/users/advisors')
}

// 初始加载
handleSearch()
</script>

<style scoped lang="scss">
.users-list {
  .search-card,
  .toolbar-card {
    margin-bottom: 16px;
  }

  .text-secondary {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  :deep(.el-pagination) {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
