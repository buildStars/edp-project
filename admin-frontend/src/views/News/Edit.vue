<template>
  <div class="page-container">
    <h2 class="page-title">{{ isEdit ? '编辑资讯' : '发布资讯' }}</h2>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="news-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入资讯标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-radio-group v-model="form.category">
            <el-radio label="NOTICE">学院通知</el-radio>
            <el-radio label="ALUMNI">校友动态</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="封面图">
          <ImageUpload v-model="form.coverImage" />
          <div class="form-tip">建议尺寸：750x420，大小不超过5MB</div>
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入资讯摘要（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <RichEditor v-model="(form.content as string)" height="500px" />
        </el-form-item>

        <el-form-item label="发布时间">
          <el-radio-group v-model="publishTimeType" @change="handlePublishTimeTypeChange">
            <el-radio label="now">立即发布</el-radio>
            <el-radio label="schedule">定时发布</el-radio>
          </el-radio-group>
          <el-date-picker
            v-if="publishTimeType === 'schedule'"
            v-model="form.publishTime"
            type="datetime"
            placeholder="选择发布时间"
            :disabled-date="disabledDate"
            class="ml-10"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="DRAFT">保存为草稿</el-radio>
            <el-radio label="PUBLISHED">立即发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="置顶">
          <el-switch v-model="form.isTop" />
          <span class="ml-10 text-secondary">仅支持1篇资讯置顶</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ isEdit ? '保存' : '发布' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
          <el-button v-if="!isEdit || form.status === 'DRAFT'" @click="handlePreview">
            预览
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="预览" width="800px" top="5vh">
      <div class="preview-container">
        <h1 class="preview-title">{{ form.title }}</h1>
        <div class="preview-meta">
          <span>分类：{{ getCategoryLabel(form.category) }}</span>
          <span class="ml-20">
            发布时间：{{ form.publishTime ? formatDate(form.publishTime) : '立即' }}
          </span>
        </div>
        <el-image
          v-if="form.coverImage"
          :src="form.coverImage"
          fit="cover"
          class="preview-cover"
        />
        <div v-if="form.summary" class="preview-summary">{{ form.summary }}</div>
        <div class="preview-content" v-html="form.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import RichEditor from '@/components/RichEditor/index.vue'
import ImageUpload from '@/components/Upload/ImageUpload.vue'
import { formatDate } from '@/utils/format'
import { getNewsDetail, createNews, updateNews } from '@/api/news'
import type { NewsFormData } from '@/api/news'

const route = useRoute()
const router = useRouter()

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<NewsFormData>({
  title: '',
  category: 'NOTICE',
  coverImage: '',
  summary: '',
  content: '',
  publishTime: '',
  status: 'PUBLISHED',  // 默认为"立即发布"，避免用户忘记选择
  isTop: false,
})

// 发布时间类型
const publishTimeType = ref<'now' | 'schedule'>('now')

// 表单验证规则
const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 加载状态
const loading = ref(false)

// 预览对话框
const previewVisible = ref(false)

// 禁用的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 不能选择今天之前的日期
}

// 发布时间类型变化
const handlePublishTimeTypeChange = (type: string | number | boolean | undefined) => {
  if (type === 'now') {
    form.publishTime = ''
  }
}

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    NOTICE: '学院通知',
    ALUMNI: '校友动态',
  }
  return map[category] || category
}

// 加载资讯详情
const loadNewsDetail = async (id: string) => {
  try {
    loading.value = true
    const data = await getNewsDetail(id)
    
    console.log('加载的资讯数据:', data)
    
    Object.assign(form, {
      title: data.title || '',
      category: data.category || 'NOTICE',
      coverImage: data.coverImage || '',
      summary: data.summary || '',
      content: data.content || '',
      publishTime: data.publishTime || '',
      status: data.status || 'DRAFT',
      isTop: data.isTop || false,
    })

    // 设置发布时间类型
    if (data.publishTime) {
      publishTimeType.value = 'schedule'
    }
    
    console.log('表单数据已更新:', form)
  } catch (error: any) {
    console.error('加载资讯详情失败:', error)
    ElMessage.error(error.message || '加载资讯详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = {
          ...form,
          publishTime: publishTimeType.value === 'now' ? undefined : form.publishTime,
        }

        if (isEdit.value) {
          await updateNews(route.params.id as string, data)
          ElMessage.success('保存成功')
        } else {
          await createNews(data)
          ElMessage.success('发布成功')
        }

        router.push('/news/list')
      } catch (error) {
        console.error('Submit failed:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 取消
const handleCancel = () => {
  router.back()
}

// 预览
const handlePreview = () => {
  if (!form.title) {
    ElMessage.warning('请先填写标题')
    return
  }
  if (!form.content) {
    ElMessage.warning('请先填写内容')
    return
  }
  previewVisible.value = true
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadNewsDetail(route.params.id as string)
  }
})
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.news-form {
  max-width: 1000px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.text-secondary {
  color: #999;
  font-size: 14px;
}

.preview-container {
  padding: 20px;

  .preview-title {
    font-size: 28px;
    color: #333;
    margin-bottom: 16px;
  }

  .preview-meta {
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
  }

  .preview-cover {
    width: 100%;
    max-height: 400px;
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .preview-summary {
    padding: 16px;
    background: #f5f7fa;
    border-left: 4px solid #409eff;
    margin-bottom: 20px;
    font-size: 16px;
    line-height: 1.6;
    color: #666;
  }

  .preview-content {
    font-size: 16px;
    line-height: 1.8;
    color: #333;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }

    :deep(p) {
      margin-bottom: 12px;
    }

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin: 20px 0 12px;
      font-weight: bold;
    }
  }
}
</style>


