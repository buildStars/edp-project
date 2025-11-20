<template>
  <div class="image-upload">
    <el-upload
      action="#"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="customUpload"
      :disabled="disabled"
      accept="image/*"
      :auto-upload="true"
    >
      <div v-if="imageUrl" class="image-preview">
        <el-image :src="imageUrl" fit="cover" class="preview-img" />
        <div class="image-mask">
          <el-icon class="mask-icon" @click.stop="handlePreview">
            <ZoomIn />
          </el-icon>
          <el-icon class="mask-icon" @click.stop="handleRemove">
            <Delete />
          </el-icon>
        </div>
      </div>
      <div v-else class="upload-placeholder">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <div class="upload-text">{{ placeholder }}</div>
      </div>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <img :src="imageUrl" style="width: 100%" alt="preview" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  modelValue?: string
  uploadUrl?: string
  maxSize?: number // MB
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  uploadUrl: '/api/upload/image',
  maxSize: 5,
  placeholder: '点击上传图片',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const authStore = useAuthStore()

// 图片URL
const imageUrl = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 上传请求头
const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}))

// 预览对话框
const previewVisible = ref(false)

// 自定义上传方法
const customUpload = async (options: any) => {
  const { file, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    // 使用 fetch 直接请求，避免 axios 拦截器的影响
    const response = await fetch(props.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': headers.value.Authorization
      },
      body: formData
    })
    
    const result = await response.json()
    console.log('上传响应:', result)
    
    // 处理响应格式: { code: 200, msg: "success", data: { url: '...' } }
    let url = ''
    
    if (result && result.code === 200 && result.data && result.data.url) {
      url = result.data.url
    } else if (result && result.url) {
      // 备用格式: { url: '...' }
      url = result.url
    }
    
    if (url) {
      imageUrl.value = url
      ElMessage.success('上传成功')
      onSuccess(result)
    } else {
      console.error('无法从响应中提取 URL:', result)
      throw new Error('响应格式错误')
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
    onError(error)
  }
}

// 上传前检查
const beforeUpload = (file: File) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  // 检查文件大小
  const isLtSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }

  return true
}

// 注意：上传的成功/失败处理已在 customUpload 方法中完成

// 预览图片
const handlePreview = () => {
  previewVisible.value = true
}

// 删除图片
const handleRemove = () => {
  imageUrl.value = ''
}
</script>

<style lang="scss" scoped>
.image-upload {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }

  .image-preview {
    width: 178px;
    height: 178px;
    position: relative;

    .preview-img {
      width: 100%;
      height: 100%;
    }

    .image-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      opacity: 0;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }

      .mask-icon {
        font-size: 24px;
        color: #fff;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.2);
        }
      }
    }
  }

  .upload-placeholder {
    width: 178px;
    height: 178px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8c939d;

    .upload-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
    }
  }
}
</style>


