<template>
  <div class="image-upload-multiple">
    <el-upload
      action="#"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="customUpload"
      :disabled="disabled || imageList.length >= limit"
      accept="image/*"
      :auto-upload="true"
      multiple
    >
      <div class="upload-trigger">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <div class="upload-text">{{ placeholder }}</div>
        <div v-if="limit" class="upload-count">{{ imageList.length }}/{{ limit }}</div>
      </div>
    </el-upload>

    <!-- 图片列表 -->
    <div class="image-list">
      <div
        v-for="(url, index) in imageList"
        :key="index"
        class="image-item"
      >
        <el-image :src="url" fit="cover" class="preview-img" />
        <div class="image-mask">
          <el-icon class="mask-icon" @click="handlePreview(url)">
            <ZoomIn />
          </el-icon>
          <el-icon class="mask-icon" @click="handleRemove(index)">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 提示文字 -->
    <div v-if="tips" class="upload-tips">{{ tips }}</div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <img :src="previewUrl" style="width: 100%" alt="preview" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  modelValue?: string[]
  uploadUrl?: string
  maxSize?: number // MB
  limit?: number // 最多上传数量
  placeholder?: string
  tips?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  uploadUrl: '/api/upload/image',
  maxSize: 5,
  limit: 9,
  placeholder: '点击上传图片',
  tips: '',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const authStore = useAuthStore()

// 图片列表
const imageList = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val),
})

// 上传请求头
const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}))

// 预览
const previewVisible = ref(false)
const previewUrl = ref('')

// 自定义上传方法
const customUpload = async (options: any) => {
  const { file, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
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
      // 添加到图片列表
      const newList = [...imageList.value, url]
      imageList.value = newList
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
  // 检查数量限制
  if (imageList.value.length >= props.limit) {
    ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
    return false
  }

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

// 预览图片
const handlePreview = (url: string) => {
  previewUrl.value = url
  previewVisible.value = true
}

// 删除图片
const handleRemove = (index: number) => {
  const newList = imageList.value.filter((_, i) => i !== index)
  imageList.value = newList
}
</script>

<style lang="scss" scoped>
.image-upload-multiple {
  .upload-trigger {
    width: 148px;
    height: 148px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8c939d;
    vertical-align: top;
    margin-right: 8px;
    margin-bottom: 8px;

    &:hover {
      border-color: #409eff;
    }

    .upload-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
    }

    .upload-count {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }

  .image-list {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .image-item {
      width: 148px;
      height: 148px;
      position: relative;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #d9d9d9;

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
  }

  .upload-tips {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    line-height: 1.5;
  }
}
</style>






