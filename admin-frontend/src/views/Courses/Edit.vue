<template>
  <div class="course-edit">
    <!-- 自定义面包屑（替换默认面包屑） -->
    <div class="custom-breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="breadcrumbFirstPath">
          {{ breadcrumbFirstTitle }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          {{ isEdit ? '编辑课程' : '创建课程' }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-header">
      <div>
        <h2 class="page-title">{{ isEdit ? '课程详情' : '创建课程' }}</h2>
        <p v-if="isEdit" class="page-subtitle">{{ formData.title || '管理课程完整信息' }}</p>
      </div>
      <el-button @click="handleCancel">返回列表</el-button>
    </div>

    <!-- 编辑模式：显示Tab -->
    <el-tabs v-if="isEdit" v-model="activeTab" class="course-tabs">
      <el-tab-pane label="基本信息" name="basic">
        <CourseForm
          ref="formRef"
          :form-data="formData"
          :rules="rules"
          :is-teacher="isTeacher"
          :is-edit="isEdit"
          :submitting="submitting"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </el-tab-pane>
      
      <el-tab-pane label="章节管理" name="chapters">
        <CourseChapters v-if="route.params.id" :course-id="route.params.id as string" />
      </el-tab-pane>
    </el-tabs>

    <!-- 创建模式：没有tabs，直接显示基本信息表单 -->
    <CourseForm
      v-else
      ref="formRef"
      :form-data="formData"
      :rules="rules"
      :is-teacher="isTeacher"
      :is-edit="isEdit"
      :submitting="submitting"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  getCourseDetail,
  createCourse,
  updateCourse,
  type CourseFormData,
} from '@/api/course'
import CourseForm from './components/CourseForm.vue'
import CourseChapters from './Chapters/index.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const activeTab = ref('basic') // Tab切换状态

// 判断是否为教师角色
const isTeacher = computed(() => authStore.userInfo?.role === 'TEACHER')

// 自定义面包屑（根据角色显示不同的第一级）
const breadcrumbFirstTitle = computed(() => {
  return isTeacher.value ? '我的课程' : '课程管理'
})

const breadcrumbFirstPath = computed(() => {
  return isTeacher.value ? '/teacher/courses' : '/courses/list'
})

const formData = reactive<CourseFormData>({
  title: '',
  coverImage: '',
  introduction: '', // 初始化为空字符串，避免undefined
  teacherId: '',
  teacherName: '',
  teacherAvatar: '',
  teacherTitle: '',
  teacherIntro: '',
  startTime: '',
  endTime: '',
  location: '',
  credit: 1,
  maxStudents: 50,
  requiredCheckins: 0,  // 要求签到次数，默认0表示不要求
  achievementCredit: 0,  // 成就学分，默认0
  enrollStatus: 'OPEN',
  status: 'DRAFT',
} as CourseFormData)

// 自定义验证规则：验证结束时间
const validateEndTime = (_rule: any, value: any, callback: any) => {
  if (value && formData.startTime) {
    const startTime = new Date(formData.startTime).getTime()
    const endTime = new Date(value).getTime()
    if (endTime <= startTime) {
      callback(new Error('结束时间必须晚于开始时间'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

const rules: FormRules = {
  title: [{ required: true, message: '请输入课程标题', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请输入讲师ID', trigger: 'blur' }],
  teacherName: [{ required: true, message: '请输入讲师姓名', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ validator: validateEndTime, trigger: 'change' }],
  credit: [{ required: true, message: '请输入所需学分', trigger: 'blur' }],
  enrollStatus: [{ required: true, message: '请选择报名状态', trigger: 'change' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }],
}

// 重置表单
const resetForm = () => {
  const defaultData = {
    title: '',
    coverImage: '',
    introduction: '',
    teacherId: '',
    teacherName: '',
    teacherAvatar: '',
    teacherTitle: '',
    teacherIntro: '',
    startTime: '',
    endTime: '',
    location: '',
    credit: 1,
    maxStudents: 50,
    enrollStatus: 'OPEN',
    status: 'DRAFT',
  }
  
  // 如果是教师角色且是创建模式，自动填充教师信息
  if (isTeacher.value && !isEdit.value && authStore.userInfo) {
    defaultData.teacherId = authStore.userInfo.id
    defaultData.teacherName = authStore.userInfo.nickname || ''
    defaultData.teacherAvatar = authStore.userInfo.avatar || ''
  }
  
  Object.assign(formData, defaultData)
  formRef.value?.clearValidate()
}

// 加载课程详情
const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) return

  try {
    const data = await getCourseDetail(id)
    
    // 只复制表单需要的字段，排除只读字段
    Object.assign(formData, {
      title: data.title,
      coverImage: data.coverImage || '',
      introduction: data.introduction || '',
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      teacherAvatar: data.teacherAvatar || '',
      teacherTitle: data.teacherTitle || '',
      teacherIntro: data.teacherIntro || '',
      startTime: data.startTime,
      endTime: data.endTime || '',
      location: data.location || '',
      credit: data.credit,
      maxStudents: data.maxStudents,
      enrollStatus: data.enrollStatus,
      status: data.status,
    })
  } catch (error: any) {
    ElMessage.error(error.message || '加载课程详情失败')
    handleCancel()
  }
}

// 初始化页面
const initPage = () => {
  resetForm()
  if (route.params.id) {
    isEdit.value = true
    loadDetail()
  } else {
    isEdit.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 只提取需要提交的字段
    const submitData = {
      title: formData.title,
      coverImage: formData.coverImage,
      introduction: formData.introduction,
      teacherId: formData.teacherId,
      teacherName: formData.teacherName,
      teacherAvatar: formData.teacherAvatar,
      teacherTitle: formData.teacherTitle,
      teacherIntro: formData.teacherIntro,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      credit: formData.credit,
      maxStudents: formData.maxStudents,
      enrollStatus: formData.enrollStatus,
      status: formData.status,
    }

    if (isEdit.value) {
      const id = route.params.id as string
      await updateCourse(id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createCourse(submitData)
      ElMessage.success('创建成功')
    }

    handleCancel()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  // 如果是教师访问，返回到教师课程列表
  if (authStore.userInfo?.role === 'TEACHER') {
    router.push('/teacher/courses')
  } else {
    router.push('/courses/list')
  }
}

// 初始化
// 监听路由变化
watch(() => route.path, () => {
  initPage()
}, { immediate: true })

onMounted(() => {
  initPage()
})
</script>

<style scoped lang="scss">
.course-edit {
  padding: 20px;

  // 自定义面包屑
  .custom-breadcrumb {
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-breadcrumb) {
      font-size: 14px;

      .el-breadcrumb__item {
        .el-breadcrumb__inner {
          color: #606266;
          font-weight: 500;
          transition: color 0.3s;

          &:hover {
            color: #409eff;
          }
        }

        &:last-child .el-breadcrumb__inner {
          color: #303133;
          font-weight: 600;
        }
      }
    }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 24px;
    color: #303133;
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .page-subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }

  .course-tabs {
    :deep(.el-tabs__content) {
      padding: 20px 0;
    }
  }

  .form-container {
    max-width: 1200px;

    .form-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-header {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
    }

    :deep(.el-input-number) {
      width: 100%;
    }
    
    .form-tip {
      display: inline-block;
      margin-top: 4px;
      font-size: 12px;
      color: #67c23a;
    }
  }

  .form-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 24px 0;

    .el-button {
      min-width: 120px;
    }
  }

  // 教师只读视图样式
  .teacher-readonly-view {
    .form-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-header {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .text-secondary {
      color: #909399;
      font-size: 14px;
    }

    :deep(.el-descriptions__label) {
      font-weight: 500;
      color: #606266;
    }

    :deep(.el-descriptions__content) {
      color: #303133;
    }
  }
}
</style>
