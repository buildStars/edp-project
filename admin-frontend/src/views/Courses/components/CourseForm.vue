<template>
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
              <span class="form-tip">教师信息已自动填充，不可修改</span>
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
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="$emit('submit')">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CourseFormData } from '@/api/course'
import ImageUpload from '@/components/Upload/ImageUpload.vue'
import RichEditor from '@/components/RichEditor/index.vue'

defineProps({
  formData: {
    type: Object as PropType<CourseFormData>,
    required: true,
  },
  rules: {
    type: Object as PropType<FormRules>,
    required: true,
  },
  isTeacher: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
})

defineEmits<{
  submit: []
  cancel: []
}>()

// 创建内部 formRef 并暴露给父组件
const formRef = ref<FormInstance>()

// 暴露 validate 和 clearValidate 方法，以便父组件可以调用
defineExpose({
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate(),
})
</script>

<style scoped lang="scss">
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
</style>

