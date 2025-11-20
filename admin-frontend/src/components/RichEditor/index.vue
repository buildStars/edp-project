<template>
  <div class="rich-editor">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      class="editor-toolbar"
    />
    <Editor
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
      class="editor-content"
      :style="{ height: height }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onBeforeUnmount } from 'vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

interface Props {
  modelValue: string
  height?: string
  mode?: 'default' | 'simple'
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '400px',
  mode: 'default',
  placeholder: '请输入内容...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 编辑器实例
const editorRef = shallowRef<IDomEditor>()

// 内容HTML
const valueHtml = ref(props.modelValue)

// 监听外部值变化
watch(
  () => props.modelValue,
  (val) => {
    if (val !== valueHtml.value) {
      valueHtml.value = val
    }
  }
)

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['group-video'], // 排除视频上传（可根据需要调整）
}

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  MENU_CONF: {
    // 配置上传图片
    uploadImage: {
      // TODO: 配置图片上传接口
      server: '/api/upload/image',
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5M
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      meta: {
        // 可添加额外参数
      },
      headers: {
        // Authorization: 'Bearer xxx'
      },
      timeout: 30 * 1000,
      onBeforeUpload(files: File[]) {
        // 上传前的回调
        return files
      },
      onProgress(progress: number) {
        // 上传进度回调
        console.log('upload progress:', progress)
      },
      onSuccess(file: File, res: any) {
        // 上传成功回调
        console.log('upload success:', file, res)
      },
      onFailed(file: File, res: any) {
        // 上传失败回调
        console.error('upload failed:', file, res)
      },
      onError(file: File, err: any) {
        // 上传错误回调
        console.error('upload error:', file, err)
      },
      customInsert(res: any, insertFn: Function) {
        // 自定义插入图片
        // res 是上传接口返回的数据
        // insertFn 是插入图片的函数
        if (res && res.url) {
          insertFn(res.url, '', '')
        }
      },
    },
  },
}

// 编辑器创建
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

// 内容变化
const handleChange = (editor: IDomEditor) => {
  const html = editor.getHtml()
  emit('update:modelValue', html)
}

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})

// 暴露方法
defineExpose({
  getEditor: () => editorRef.value,
})
</script>

<style lang="scss" scoped>
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  .editor-toolbar {
    border-bottom: 1px solid #dcdfe6;
  }

  .editor-content {
    overflow-y: auto;
  }
}
</style>

