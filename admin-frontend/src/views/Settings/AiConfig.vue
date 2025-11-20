<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>AI 配置管理</span>
          <el-button type="primary" @click="handleTest" :loading="testing">
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
        </div>
      </template>

      <el-alert
        title="配置说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>配置 AI 服务后，系统可以自动生成学员年度学习报告，提供个性化的学习分析和建议。</p>
        <p>支持的 AI 服务：OpenAI GPT、文心一言、通义千问等。</p>
      </el-alert>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="服务名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="例如：OpenAI GPT-4"
            clearable
          />
        </el-form-item>

        <el-form-item label="提供商" prop="provider">
          <el-select v-model="formData.provider" placeholder="请选择提供商" style="width: 100%">
            <el-option label="OpenAI" value="openai" />
            <el-option label="百度文心一言" value="baidu" />
            <el-option label="阿里通义千问" value="alibaba" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="API Key" prop="apiKey">
          <el-input
            v-model="formData.apiKey"
            type="password"
            placeholder="请输入 API Key"
            show-password
            clearable
          >
            <template #append>
              <el-button @click="handleClearApiKey">清除</el-button>
            </template>
          </el-input>
          <div class="form-tip">API Key 将加密存储，不会明文显示</div>
        </el-form-item>

        <el-form-item label="API 地址" prop="apiUrl">
          <el-input
            v-model="formData.apiUrl"
            placeholder="可选，留空使用官方地址"
            clearable
          />
          <div class="form-tip">例如：https://api.openai.com/v1</div>
        </el-form-item>

        <el-form-item label="模型版本" prop="model">
          <el-input
            v-model="formData.model"
            placeholder="例如：gpt-4 或 gpt-3.5-turbo"
            clearable
          />
        </el-form-item>

        <el-form-item label="启用状态" prop="isActive">
          <el-switch
            v-model="formData.isActive"
            active-text="已启用"
            inactive-text="已禁用"
          />
        </el-form-item>

        <el-form-item label="最大 Token 数" prop="maxTokens">
          <el-input-number
            v-model="formData.maxTokens"
            :min="100"
            :max="10000"
            :step="100"
            style="width: 200px"
          />
          <div class="form-tip">建议设置为 2000-4000</div>
        </el-form-item>

        <el-form-item label="温度参数" prop="temperature">
          <el-slider
            v-model="formData.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            :marks="{ 0: '精确', 1: '平衡', 2: '创造' }"
            style="width: 300px"
          />
          <div class="form-tip">控制生成内容的随机性，0 最精确，2 最创造</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            <el-icon><Check /></el-icon>
            保存配置
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 使用说明 -->
    <el-card shadow="never" style="margin-top: 16px">
      <template #header>
        <span>使用说明</span>
      </template>

      <el-steps direction="vertical" :active="3">
        <el-step title="步骤 1：获取 API Key">
          <template #description>
            <p>访问对应 AI 服务商官网，注册账号并获取 API Key：</p>
            <ul>
              <li>OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank">https://platform.openai.com/api-keys</a></li>
              <li>百度文心一言: <a href="https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application" target="_blank">百度智能云</a></li>
            </ul>
          </template>
        </el-step>

        <el-step title="步骤 2：配置参数">
          <template #description>
            <p>填写上述表单中的各项参数，特别注意：</p>
            <ul>
              <li>API Key 是必填项，请确保正确无误</li>
              <li>模型版本需要与您的 API Key 权限匹配</li>
              <li>温度参数建议设置为 0.7，平衡精确性和创造性</li>
            </ul>
          </template>
        </el-step>

        <el-step title="步骤 3：测试连接">
          <template #description>
            <p>保存配置后，点击"测试连接"按钮验证配置是否正确。</p>
          </template>
        </el-step>

        <el-step title="步骤 4：启用服务">
          <template #description>
            <p>测试成功后，开启"启用状态"开关，小程序端即可使用 AI 报告功能。</p>
          </template>
        </el-step>
      </el-steps>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Connection, Check, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

const formRef = ref<FormInstance>()
const submitting = ref(false)
const testing = ref(false)
const configLoaded = ref(false)

const formData = reactive({
  name: '',
  provider: 'openai',
  apiKey: '',
  apiUrl: '',
  model: 'gpt-3.5-turbo',
  isActive: false,
  maxTokens: 2000,
  temperature: 0.7,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择提供商', trigger: 'change' }],
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
  model: [{ required: true, message: '请输入模型版本', trigger: 'blur' }],
}

// 加载配置
const loadConfig = async () => {
  try {
    const data = await request.get('/ai-config') as any
    
    if (data) {
      Object.assign(formData, {
        name: data.name,
        provider: data.provider,
        apiKey: data.apiKeyMasked ? '' : data.apiKey, // 如果是掩码，清空让用户重新输入
        apiUrl: data.apiUrl || '',
        model: data.model,
        isActive: data.isActive,
        maxTokens: data.maxTokens,
        temperature: data.temperature,
      })
      configLoaded.value = true
      
      if (data.apiKeyMasked) {
        ElMessage.info('API Key 已隐藏，如需更新请重新输入')
      }
    }
  } catch (error: any) {
    if (error.response?.status !== 404) {
      ElMessage.error(error.message || '加载配置失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (!formData.apiKey && configLoaded.value) {
      ElMessage.warning('请输入 API Key')
      return
    }

    submitting.value = true

    await request.put('/ai-config', formData)

    ElMessage.success('保存成功')
    loadConfig()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    submitting.value = false
  }
}

// 测试连接
const handleTest = async () => {
  if (!formData.apiKey && !configLoaded.value) {
    ElMessage.warning('请先保存配置')
    return
  }

  testing.value = true
  try {
    const result = await request.get('/ai-config/test') as any
    
    if (result.success) {
      ElMessage.success('连接测试成功！')
    } else {
      ElMessage.error(`连接测试失败：${result.message}`)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '测试失败')
  } finally {
    testing.value = false
  }
}

// 清除 API Key
const handleClearApiKey = () => {
  formData.apiKey = ''
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  if (configLoaded.value) {
    loadConfig()
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-steps) {
  .el-step__description {
    padding-right: 20px;
    font-size: 13px;
    line-height: 1.8;

    p {
      margin: 8px 0;
    }

    ul {
      margin: 8px 0;
      padding-left: 20px;

      li {
        margin: 4px 0;
      }
    }

    a {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>


