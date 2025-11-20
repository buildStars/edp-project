<template>
  <div class="course-edit">
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
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          class="form-container"
        >
      <!-- 基本信息 -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form-item label="课程标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入课程标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="封面图片" prop="coverImage">
          <ImageUpload
            v-model="formData.coverImage"
            :limit="1"
            tips="建议尺寸：750x420，支持jpg、png格式，大小不超过2MB"
          />
        </el-form-item>

        <el-form-item label="课程介绍" prop="introduction">
          <RichEditor v-model="(formData.introduction as string)" placeholder="请输入课程详细介绍" />
        </el-form-item>
      </el-card>

      <!-- 讲师信息 -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header">
            <span>讲师信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="讲师姓名" prop="teacherName">
              <el-input 
                v-model="formData.teacherName" 
                placeholder="请输入讲师姓名"
                :disabled="isTeacher"
              />
              <template v-if="isTeacher">
                <span class="form-tip">教师信息已自动填充</span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="讲师ID" prop="teacherId">
              <el-input 
                v-model="formData.teacherId" 
                placeholder="请输入讲师ID"
                :disabled="isTeacher"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="讲师头像">
          <ImageUpload
            v-model="formData.teacherAvatar"
            :limit="1"
            tips="建议尺寸：200x200，支持jpg、png格式"
          />
        </el-form-item>

        <el-form-item label="讲师职称">
          <el-input v-model="formData.teacherTitle" placeholder="如：教授、博士生导师" />
        </el-form-item>

        <el-form-item label="讲师介绍">
          <el-input
            v-model="formData.teacherIntro"
            type="textarea"
            :rows="4"
            placeholder="请输入讲师简介"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 课程安排 -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header">
            <span>课程安排</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.000Z"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.000Z"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="上课地点">
          <el-input v-model="formData.location" placeholder="请输入上课地点" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所需学分" prop="credit">
              <el-input-number
                v-model="formData.credit"
                :min="0"
                :max="100"
                placeholder="请输入学分"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大人数">
              <el-input-number
                v-model="formData.maxStudents"
                :min="1"
                :max="1000"
                placeholder="请输入最大人数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 结课设置 -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header">
            <span>结课设置</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="要求签到次数">
              <el-input-number
                v-model="formData.requiredCheckins"
                :min="0"
                :max="100"
                placeholder="达到此次数才能完成课程"
                style="width: 100%"
              />
              <div class="form-tip">设置为0表示不要求签到，学员都可以完成课程</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成就学分">
              <el-input-number
                v-model="formData.achievementCredit"
                :min="0"
                :max="100"
                placeholder="完成课程后发放的学分"
                style="width: 100%"
              />
              <div class="form-tip">学员完成课程后将获得此学分</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-alert
          title="结课说明"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 10px"
        >
          <template #default>
            <div>
              <p><strong>批量结课：</strong>教师申请结课，管理员审批后，只有达到签到要求的学员才会被标记为"已完成"并获得成就学分。</p>
              <p><strong>手动结课：</strong>教师可以单独给某个学员发放结课海报，无需审批，即时生效。</p>
            </div>
          </template>
        </el-alert>
      </el-card>

      <!-- 状态设置 -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header">
            <span>状态设置</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报名状态" prop="enrollStatus">
              <el-radio-group v-model="formData.enrollStatus">
                <el-radio label="OPEN">报名中</el-radio>
                <el-radio label="CLOSED">已截止</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio label="DRAFT">草稿</el-radio>
                <el-radio label="PUBLISHED">已发布</el-radio>
                <el-radio label="ARCHIVED">已归档</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="章节管理" name="chapters">
        <CourseChapters v-if="route.params.id" :course-id="route.params.id as string" />
      </el-tab-pane>
    </el-tabs>

    <!-- 创建模式：没有tabs，直接显示基本信息表单 -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  getCourseDetail,
  createCourse,
  updateCourse,
  type CourseFormData,
} from '@/api/course'
import ImageUpload from '@/components/Upload/ImageUpload.vue'
import RichEditor from '@/components/RichEditor/index.vue'
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
const isTeacher = authStore.userInfo?.role === 'TEACHER'

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
  if (isTeacher && !isEdit.value && authStore.userInfo) {
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
}
</style>
