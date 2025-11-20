<template>
  <div class="association-edit">
    <el-page-header :title="isEdit ? '编辑协会' : '新增协会'" @back="handleBack">
      <template #content>
        <span class="page-title">{{ isEdit ? '编辑协会' : '新增协会' }}</span>
      </template>
    </el-page-header>

    <el-card shadow="never" style="margin-top: 16px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="协会名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入协会名称" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="协会类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="ALUMNI">同学会</el-radio>
            <el-radio label="CLUB">俱乐部</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="协会LOGO" prop="logo">
          <ImageUpload v-model="formData.logo" :limit="1" />
          <div class="form-tip">建议尺寸：200x200像素，支持jpg、png格式</div>
        </el-form-item>

        <el-form-item label="简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入协会简介"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="详细介绍" prop="introduction">
          <RichEditor v-model="(formData.introduction as string)" placeholder="请输入协会详细介绍" />
        </el-form-item>

        <el-divider content-position="left">联系方式</el-divider>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="formData.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>

        <el-form-item label="微信号" prop="wechat">
          <el-input v-model="formData.wechat" placeholder="请输入微信号" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  getAssociationDetail,
  createAssociation,
  updateAssociation,
  type AssociationFormData,
} from '@/api/association'
import RichEditor from '@/components/RichEditor/index.vue'
import ImageUpload from '@/components/Upload/ImageUpload.vue'
import { validatePhone, validateEmail } from '@/utils/validate'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<AssociationFormData>({
  name: '',
  type: 'ALUMNI',
  logo: '',
  description: '',
  introduction: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  wechat: '',
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入协会名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择协会类型', trigger: 'change' }],
  contactPhone: [{ validator: validatePhone, trigger: 'blur' }],
  contactEmail: [{ validator: validateEmail, trigger: 'blur' }],
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    type: 'ALUMNI',
    logo: '',
    description: '',
    introduction: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    wechat: '',
  })
  formRef.value?.clearValidate()
}

// 加载详情
const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) return

  try {
    console.log('加载协会详情，ID:', id)
    const data = await getAssociationDetail(id)
    console.log('加载的协会数据:', data)
    
    Object.assign(formData, {
      ...data,
      logo: data.logo || '',
      description: data.description || '',
      introduction: data.introduction || '',
      contactPerson: data.contactPerson || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      wechat: data.wechat || '',
    })
    
    console.log('表单数据已更新:', formData)
    isEdit.value = true
  } catch (error: any) {
    console.error('加载协会详情失败:', error)
    ElMessage.error(error.message || '加载数据失败')
    handleBack()
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

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      const id = route.params.id as string  // ✅ 修复：使用params而不是query
      if (!id) {
        ElMessage.error('ID不存在')
        return
      }
      await updateAssociation(id, formData)
      ElMessage.success('保存成功')
    } else {
      await createAssociation(formData)
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
  router.back()
}

// 监听路由变化
watch(() => route.path, () => {
  initPage()
}, { immediate: true })

onMounted(() => {
  initPage()
})
</script>

<style scoped lang="scss">
.association-edit {
  .page-title {
    font-size: 16px;
    font-weight: 500;
  }

  .form-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
    margin-top: 4px;
  }

  :deep(.el-divider) {
    margin: 32px 0;
  }
}
</style>
