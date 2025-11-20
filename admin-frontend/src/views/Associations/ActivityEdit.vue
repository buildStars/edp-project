<template>
  <div class="activity-edit">
    <el-page-header :title="isEdit ? '编辑活动' : '创建活动'" @back="handleBack" />

    <el-card shadow="never" class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="form-container"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入活动标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活动图片" prop="images">
          <ImageUploadMultiple
            v-model="imageUrls"
            :limit="9"
            tips="建议尺寸：750x420，支持jpg、png格式，最多9张"
          />
        </el-form-item>

        <el-form-item label="活动内容" prop="content">
          <RichEditor
            v-model="(formData.content as string)"
            placeholder="请输入活动详细内容"
          />
        </el-form-item>

        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="formData.publishTime"
            type="datetime"
            placeholder="选择发布时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss.000Z"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="DRAFT">草稿</el-radio>
            <el-radio label="PUBLISHED">已发布</el-radio>
            <el-radio label="ARCHIVED">已归档</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  getActivityDetail,
  createActivity,
  updateActivity,
  type ActivityFormData,
} from '@/api/activity'
import ImageUploadMultiple from '@/components/Upload/ImageUploadMultiple.vue'
import RichEditor from '@/components/RichEditor/index.vue'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<ActivityFormData>({
  associationId: '',
  title: '',
  images: [],
  content: '',
  publishTime: '',
  status: 'DRAFT',
})

// 图片URL（用于组件绑定）
const imageUrls = computed({
  get: () => {
    // images可能是JSON字符串或数组
    if (typeof formData.images === 'string') {
      try {
        return JSON.parse(formData.images)
      } catch {
        return []
      }
    }
    return formData.images || []
  },
  set: (value: string[]) => {
    formData.images = value
  },
})

// 表单验证规则
const rules: FormRules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  images: [{ required: true, message: '请上传活动图片', trigger: 'change' }],
  content: [{ required: true, message: '请输入活动内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 重置表单
const resetForm = () => {
  const associationId = route.query.associationId as string
  Object.assign(formData, {
    associationId: associationId || '',
    title: '',
    images: [],
    content: '',
    publishTime: new Date().toISOString(),
    status: 'DRAFT',
  })
  formRef.value?.clearValidate()
}

// 加载活动详情
const loadDetail = async () => {
  const id = route.query.id as string
  if (!id) return

  try {
    const data = await getActivityDetail(id)
    
    // 填充表单数据
    formData.associationId = data.associationId
    formData.title = data.title
    formData.content = data.content
    formData.publishTime = data.publishTime
    formData.status = data.status as any
    
    // 处理图片数据
    if (typeof data.images === 'string') {
      try {
        formData.images = JSON.parse(data.images)
      } catch {
        formData.images = []
      }
    } else {
      formData.images = data.images || []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载活动详情失败')
    handleBack()
  }
}

// 初始化页面
const initPage = () => {
  resetForm()
  if (route.query.id) {
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

    // 准备提交数据
    const submitData: ActivityFormData = {
      ...formData,
      // 确保images是数组
      images: Array.isArray(formData.images) ? formData.images : [],
      // 处理 associationId：如果为空或 undefined，设置为 undefined（后端会处理为 null）
      associationId: formData.associationId && formData.associationId !== 'undefined' 
        ? formData.associationId 
        : undefined,
    }

    if (isEdit.value) {
      const id = route.query.id as string
      await updateActivity(id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createActivity(submitData)
      ElMessage.success('创建成功')
    }

    handleBack()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 返回
const handleBack = () => {
  const associationId = route.query.associationId as string
  if (associationId) {
    router.push(`/associations/activities?associationId=${associationId}`)
  } else {
    router.back()
  }
}

// 监听路由变化
watch(() => route.fullPath, () => {
  initPage()
}, { immediate: true })

// 初始化
onMounted(() => {
  initPage()
})
</script>

<style scoped lang="scss">
.activity-edit {
  padding: 20px;

  .el-page-header {
    margin-bottom: 20px;
  }

  .form-card {
    border-radius: 8px;

    .form-container {
      max-width: 1000px;

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
      }
    }
  }
}
</style>

