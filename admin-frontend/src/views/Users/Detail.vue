<template>
  <div class="user-detail">
    <el-page-header title="返回" @back="handleBack">
      <template #content>
        <span class="page-title">用户详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" shadow="never" style="margin-top: 16px">
      <!-- 基本信息 -->
      <div class="section">
        <div class="section-title">基本信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="头像">
            <el-avatar :src="userInfo.avatar" :size="60">
              {{ userInfo.realName?.charAt(0) || '用' }}
            </el-avatar>
          </el-descriptions-item>
          <el-descriptions-item label="姓名">{{ userInfo.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ userInfo.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ userInfo.gender === 'MALE' ? '男' : userInfo.gender === 'FEMALE' ? '女' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userInfo.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userInfo.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ userInfo.idCard || '-' }}</el-descriptions-item>
          <el-descriptions-item label="公司">{{ userInfo.company || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ userInfo.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleType(userInfo.role)">
              {{ getRoleLabel(userInfo.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="userInfo.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ userInfo.status === 'ACTIVE' ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="课程顾问">
            {{ userInfo.advisor?.realName || '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ formatDate(userInfo.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(userInfo.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 学分信息 -->
      <div v-if="creditInfo" class="section">
        <div class="section-title">学分信息</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="总学分">
            <el-tag type="primary" size="large">{{ creditInfo.total || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="剩余学分">
            <el-tag type="success" size="large">{{ creditInfo.balance || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已用学分">
            <el-tag type="info" size="large">{{ creditInfo.used || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="个人学分">
            <el-tag type="primary">{{ creditInfo.personalBalance || 0 }}</el-tag>
            <span style="margin-left: 8px; color: #999; font-size: 12px;">可赠课</span>
          </el-descriptions-item>
          <el-descriptions-item label="锁定学分">
            <el-tag type="warning">{{ creditInfo.lockedBalance || 0 }}</el-tag>
            <span style="margin-left: 8px; color: #999; font-size: 12px;">仅购课</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(creditInfo.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 学分记录 -->
        <div v-if="creditInfo.records && creditInfo.records.length > 0" style="margin-top: 16px;">
          <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px; color: #666;">
            最近学分记录
          </div>
          <el-table :data="creditInfo.records" border size="small" max-height="300">
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.type === 'ADMIN_ADD'" type="success" size="small">充值</el-tag>
                <el-tag v-else-if="row.type === 'CONSUME'" type="danger" size="small">消费</el-tag>
                <el-tag v-else-if="row.type === 'REFUND'" type="warning" size="small">退款</el-tag>
                <el-tag v-else type="info" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="变动学分" width="100" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.amount > 0 ? '#67C23A' : '#F56C6C' }">
                  {{ row.amount > 0 ? '+' : '' }}{{ row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="操作后余额" width="100" align="center" />
            <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
            <el-table-column label="时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <!-- 无学分账户提示 -->
      <div v-else class="section">
        <div class="section-title">学分信息</div>
        <el-empty description="该用户暂无学分账户" />
      </div>

      <!-- 课程相关（学员显示报名记录，教师/教务显示所教课程） -->
      <div class="section">
        <div class="section-title">
          {{ isTeacher ? '所教课程' : '报名记录' }}
        </div>
        
        <!-- 学员：报名记录 -->
        <el-table v-if="!isTeacher" :data="enrollments" border>
          <el-table-column prop="course.title" label="课程名称" min-width="200" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'ENROLLED'" type="primary">已报名</el-tag>
              <el-tag v-else-if="row.status === 'COMPLETED'" type="success">已完成</el-tag>
              <el-tag v-else type="info">已取消</el-tag>
            </template>
          </el-table-column>
  
      
          <el-table-column label="报名时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 教师/教务：所教课程 -->
        <el-table v-else :data="teachingCourses" border>
          <el-table-column prop="title" label="课程名称" min-width="200" />
          <el-table-column prop="category" label="课程类型" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.category === 'ACCELERATE'" type="success">加速课堂</el-tag>
              <el-tag v-else-if="row.category === 'MASTER'" type="warning">大师课堂</el-tag>
              <el-tag v-else-if="row.category === 'EMPOWER'" type="primary">赋能课堂</el-tag>
              <el-tag v-else>{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="学分" width="80" align="center">
            <template #default="{ row }">
              {{ row.credit || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="报名人数" width="100" align="center">
            <template #default="{ row }">
              {{ row._count?.enrollments || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'PUBLISHED'" type="success">已发布</el-tag>
              <el-tag v-else-if="row.status === 'DRAFT'" type="info">草稿</el-tag>
              <el-tag v-else-if="row.status === 'ARCHIVED'" type="warning">已归档</el-tag>
              <el-tag v-else>{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
       
        </el-table>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" @click="handleEdit">编辑用户</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserDetail } from '@/api/user'
import { formatDate } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const userInfo = reactive<any>({})
const creditInfo = ref<any>(null)
const enrollments = ref<any[]>([])
const teachingCourses = ref<any[]>([])

// 判断是否为教师或教务
const isTeacher = computed(() => {
  return userInfo.role === 'TEACHER' || userInfo.role === 'STAFF'
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

// 加载详情
const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('用户ID不存在')
    handleBack()
    return
  }

  try {
    loading.value = true
    const data = await getUserDetail(id)
    Object.assign(userInfo, data)
    creditInfo.value = (data as any).credit || null
    enrollments.value = (data as any).enrollments || []
    teachingCourses.value = (data as any).teachingCourses || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户详情失败')
    handleBack()
  } finally {
    loading.value = false
  }
}

// 查看课程详情
const handleViewCourse = (courseId: string) => {
  router.push(`/courses/detail?id=${courseId}`)
}

// 编辑
const handleEdit = () => {
  router.push(`/users/list?edit=${route.params.id}`)
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
.user-detail {
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
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 3px solid var(--el-color-primary);
    }
  }

  .text-secondary {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .actions {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
