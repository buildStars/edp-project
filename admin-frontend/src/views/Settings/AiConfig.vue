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
        <p>支持的 AI 服务：<strong>Google Gemini（推荐，免费）</strong>、OpenAI GPT、文心一言、通义千问等。</p>
        <p style="color: #67C23A; margin-top: 8px;">
          💡 <strong>推荐使用 Gemini：</strong>免费、稳定、中文支持好，每分钟 15 次请求，完全够用！
        </p>
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

        <el-form-item label="API Key" prop="apiKey">
          <el-input
            v-model="formData.apiKey"
            type="password"
            :placeholder="hasApiKey ? '已配置（如需修改请输入新的 Key）' : '请输入 API Key'"
            show-password
            clearable
          >
            <template #prepend v-if="hasApiKey">
              <el-icon color="#67C23A"><SuccessFilled /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleClearApiKey" v-if="formData.apiKey">清除</el-button>
            </template>
          </el-input>
          <div class="form-tip">
            <span v-if="hasApiKey" style="color: #67C23A;">
              ✓ 已配置，显示为掩码保护隐私。如需更新请输入新的 Key。
            </span>
            <span v-else>
              API Key 将加密存储，不会明文显示
            </span>
          </div>
        </el-form-item>

        <el-form-item label="自定义 API 地址" prop="apiUrl">
          <el-input
            v-model="formData.apiUrl"
            placeholder="可选，仅在使用自定义地址（如中转服务）时填写"
            clearable
            @input="handleApiUrlChange"
          >
            <template #prepend>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">
            <div v-if="!formData.apiUrl && autoApiUrl" style="color: #67C23A; margin-bottom: 4px;">
              <el-icon><SuccessFilled /></el-icon>
              <span> 自动配置：{{ autoApiUrl }}</span>
            </div>
            <div style="color: #909399; font-size: 12px;">
              💡 仅在需要使用中转服务或特殊 API 地址时填写，留空则使用模型对应的官方地址
            </div>
          </div>
        </el-form-item>

        <el-form-item label="模型选择" prop="model">
          <el-select 
            v-model="formData.model" 
            placeholder="请选择模型" 
            style="width: 100%"
            @change="handleModelChange"
            filterable
          >
            <!-- Gemini 模型 -->
            <el-option-group label="🌟 Google Gemini（推荐，免费）">
              <el-option 
                label="gemini-2.5-flash - 快速智能（推荐）" 
                value="gemini-2.5-flash"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>gemini-2.5-flash</span>
                  <el-tag size="small" type="success">⚡ 推荐 · 免费 · 15 RPM</el-tag>
                </div>
              </el-option>
              <el-option 
                label="gemini-2.5-pro - 高级推理" 
                value="gemini-2.5-pro"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>gemini-2.5-pro</span>
                  <el-tag size="small" type="info">强大 · 2 RPM</el-tag>
                </div>
              </el-option>
              <el-option 
                label="gemini-2.0-flash - 第二代" 
                value="gemini-2.0-flash"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>gemini-2.0-flash</span>
                  <el-tag size="small" type="info">稳定 · 10 RPM</el-tag>
                </div>
              </el-option>
              <el-option 
                label="gemini-3-pro-preview - 最新预览" 
                value="gemini-3-pro-preview"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>gemini-3-pro-preview</span>
                  <el-tag size="small" type="warning">实验性</el-tag>
                </div>
              </el-option>
            </el-option-group>
            
            <!-- Kimi 模型 -->
            <el-option-group label="🌙 Kimi（月之暗面，免费）">
              <el-option 
                label="moonshot-v1-8k - 标准版（8K 上下文）" 
                value="moonshot-v1-8k"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>moonshot-v1-8k</span>
                  <el-tag size="small" type="success">免费 · 3 RPM</el-tag>
                </div>
              </el-option>
              <el-option 
                label="moonshot-v1-32k - 长文本（32K 上下文）" 
                value="moonshot-v1-32k"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>moonshot-v1-32k</span>
                  <el-tag size="small" type="success">免费 · 3 RPM</el-tag>
                </div>
              </el-option>
              <el-option 
                label="moonshot-v1-128k - 超长文本（128K 上下文）" 
                value="moonshot-v1-128k"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>moonshot-v1-128k</span>
                  <el-tag size="small" type="success">免费 · 3 RPM</el-tag>
                </div>
              </el-option>
            </el-option-group>
            
            <!-- 百度文心一言 -->
            <el-option-group label="💙 百度文心一言">
              <el-option 
                label="ernie-bot-4 - ERNIE Bot 4.0（最强）" 
                value="ernie-bot-4"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>ernie-bot-4</span>
                  <el-tag size="small" type="primary">4.0 · 付费</el-tag>
                </div>
              </el-option>
              <el-option 
                label="ernie-bot-turbo - Turbo 版（快速）" 
                value="ernie-bot-turbo"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>ernie-bot-turbo</span>
                  <el-tag size="small" type="info">快速</el-tag>
                </div>
              </el-option>
              <el-option 
                label="ernie-bot-8k - 8K 版本" 
                value="ernie-bot-8k"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>ernie-bot-8k</span>
                  <el-tag size="small" type="info">8K</el-tag>
                </div>
              </el-option>
            </el-option-group>
            
            <!-- OpenAI 模型 -->
            <el-option-group label="OpenAI（需付费）">
              <el-option 
                label="gpt-4-turbo - 最新 GPT-4" 
                value="gpt-4-turbo"
              />
              <el-option 
                label="gpt-4 - 标准版" 
                value="gpt-4"
              />
              <el-option 
                label="gpt-3.5-turbo - 快速版" 
                value="gpt-3.5-turbo"
              />
            </el-option-group>
            
            <!-- 阿里通义千问 -->
            <el-option-group label="阿里通义千问">
              <el-option 
                label="qwen-turbo - Turbo 版" 
                value="qwen-turbo"
              />
              <el-option 
                label="qwen-plus - Plus 版（增强）" 
                value="qwen-plus"
              />
            </el-option-group>
          </el-select>
          <div class="form-tip">
            <span v-if="currentModelInfo">
              <span style="color: #67C23A;">✓</span> {{ currentModelInfo }}
            </span>
            <span v-else>
              选择模型后将自动配置对应的 API 地址
            </span>
          </div>
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
            <ul style="line-height: 2.2;">
              <li style="color: #67C23A; font-weight: bold; margin-bottom: 12px;">
                🌟 Google Gemini（推荐）: 
                <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #67C23A;">
                  https://aistudio.google.com/app/apikey
                </a>
                <br>
                <span style="color: #909399; font-size: 12px; font-weight: normal;">
                  · 完全免费，每分钟 15 次请求<br>
                  · 无需绑卡，注册即用<br>
                  · 中文支持好，响应速度快
                </span>
              </li>
              
              <li style="color: #409EFF; font-weight: bold; margin-bottom: 12px;">
                🌙 Kimi（月之暗面，免费）: 
                <a href="https://platform.moonshot.cn/console/account" target="_blank" style="color: #409EFF;">
                  https://platform.moonshot.cn/console/account
                </a>
                <br>
                <span style="color: #909399; font-size: 12px; font-weight: normal;">
                  · 注册即送 15 元额度<br>
                  · 支持超长上下文（128K）<br>
                  · 兼容 OpenAI SDK，易于集成
                </span>
              </li>
              
              <li style="font-weight: bold; margin-bottom: 12px;">
                💙 百度文心一言: 
                <a href="https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application" target="_blank" style="color: #409EFF;">
                  百度智能云千帆平台
                </a>
                <br>
                <span style="color: #909399; font-size: 12px; font-weight: normal;">
                  · 注册并创建应用，获取 API Key 和 Secret Key<br>
                  · 新用户有免费额度<br>
                  · 中文能力强，响应稳定
                </span>
              </li>
              
              <li style="margin-top: 8px;">
                OpenAI: 
                <a href="https://platform.openai.com/api-keys" target="_blank">https://platform.openai.com/api-keys</a>
                <span style="color: #909399; font-size: 12px;">（需付费，需科学上网）</span>
              </li>
              
              <li style="margin-top: 8px;">
                阿里通义千问: 
                <a href="https://dashscope.console.aliyun.com/apiKey" target="_blank">阿里云灵积平台</a>
                <span style="color: #909399; font-size: 12px;">（新用户有免费额度）</span>
              </li>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Connection, Check, Refresh, SuccessFilled, Link } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 模型配置映射
const MODEL_CONFIG = {
  // Gemini 模型
  'gemini-2.5-flash': {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    info: '官方 API：generativelanguage.googleapis.com',
    provider: 'gemini',
    rateLimit: '15 RPM'
  },
  'gemini-2.5-pro': {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
    info: '官方 API：generativelanguage.googleapis.com',
    provider: 'gemini',
    rateLimit: '2 RPM'
  },
  'gemini-2.0-flash': {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    info: '官方 API：generativelanguage.googleapis.com',
    provider: 'gemini',
    rateLimit: '10 RPM'
  },
  'gemini-3-pro-preview': {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent',
    info: '官方 API：generativelanguage.googleapis.com（实验性）',
    provider: 'gemini',
    rateLimit: '实验阶段'
  },
  // Kimi（Moonshot）模型
  'moonshot-v1-8k': {
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    info: '官方 API：api.moonshot.cn（兼容 OpenAI 格式）',
    provider: 'kimi',
    rateLimit: '3 RPM（免费）'
  },
  'moonshot-v1-32k': {
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    info: '官方 API：api.moonshot.cn（32K 上下文）',
    provider: 'kimi',
    rateLimit: '3 RPM（免费）'
  },
  'moonshot-v1-128k': {
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    info: '官方 API：api.moonshot.cn（128K 上下文）',
    provider: 'kimi',
    rateLimit: '3 RPM（免费）'
  },
  // 百度文心一言模型
  'ernie-bot-4': {
    apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro',
    info: '百度文心 API（ERNIE Bot 4.0）',
    provider: 'baidu',
    rateLimit: '根据配额'
  },
  'ernie-bot-turbo': {
    apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant',
    info: '百度文心 API（Turbo 版）',
    provider: 'baidu',
    rateLimit: '根据配额'
  },
  'ernie-bot-8k': {
    apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_bot_8k',
    info: '百度文心 API（8K 版本）',
    provider: 'baidu',
    rateLimit: '根据配额'
  },
  // OpenAI 模型
  'gpt-4-turbo': {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    info: '官方 API：api.openai.com',
    provider: 'openai',
    rateLimit: '根据配额'
  },
  'gpt-4': {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    info: '官方 API：api.openai.com',
    provider: 'openai',
    rateLimit: '根据配额'
  },
  'gpt-3.5-turbo': {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    info: '官方 API：api.openai.com',
    provider: 'openai',
    rateLimit: '根据配额'
  },
  // 阿里通义千问
  'qwen-turbo': {
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    info: '阿里通义 API',
    provider: 'alibaba',
    rateLimit: '根据配额'
  },
  'qwen-plus': {
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    info: '阿里通义 API（Plus 版）',
    provider: 'alibaba',
    rateLimit: '根据配额'
  }
}

const formRef = ref<FormInstance>()
const submitting = ref(false)
const testing = ref(false)
const configLoaded = ref(false)
const hasApiKey = ref(false) // 是否已有 API Key
const hasApiUrl = ref(false) // 是否已有 API URL
const isCustomApiUrl = ref(false) // 用户是否自定义了 API URL

const formData = reactive({
  name: '',
  provider: 'gemini',
  apiKey: '',
  apiUrl: '',
  model: 'gemini-2.5-flash',
  isActive: false,
  maxTokens: 2000,
  temperature: 0.7,
})

// 自动配置的 API URL（根据模型）
const autoApiUrl = computed(() => {
  const config = MODEL_CONFIG[formData.model as keyof typeof MODEL_CONFIG]
  return config?.apiUrl || ''
})

// 当前模型信息提示
const currentModelInfo = computed(() => {
  const config = MODEL_CONFIG[formData.model as keyof typeof MODEL_CONFIG]
  return config?.info || ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择提供商', trigger: 'change' }],
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
  model: [{ required: true, message: '请输入模型版本', trigger: 'blur' }],
}

// 模型变化处理：自动配置对应的 API URL 和 Provider，并智能加载配置
const handleModelChange = async (model: string) => {
  const newConfig = MODEL_CONFIG[model as keyof typeof MODEL_CONFIG]
  
  if (!newConfig) return
  
  const oldProvider = formData.provider
  const newProvider = newConfig.provider
  
  // 自动设置 provider
  formData.provider = newProvider
  
  // 如果没有自定义 API URL，则清空（使用自动配置）
  if (!isCustomApiUrl.value) {
    formData.apiUrl = ''
  }
  
  // 检查该模型是否已有配置
  try {
    const existingConfig = await request.get(`/ai-config/by-model?model=${encodeURIComponent(model)}`) as any
    
    if (existingConfig) {
      // ✅ 找到该模型的配置，直接加载
      ElMessage.success({
        message: `检测到该模型已有配置，已自动加载`,
        duration: 3000
      })
      
      Object.assign(formData, {
        name: existingConfig.name,
        provider: existingConfig.provider,
        apiKey: existingConfig.apiKey, // 掩码形式
        apiUrl: existingConfig.apiUrl || '',
        model: existingConfig.model,
        isActive: existingConfig.isActive,
        maxTokens: existingConfig.maxTokens,
        temperature: existingConfig.temperature,
      })
      
      hasApiKey.value = !!existingConfig.apiKey
      isCustomApiUrl.value = !!existingConfig.apiUrl
      configLoaded.value = true
      
    } else {
      // 该模型没有配置
      // 如果切换到同一个提供商的其他模型，保留 API Key
      if (oldProvider === newProvider && hasApiKey.value) {
        ElMessage.info({
          message: `${model} 尚未配置，但已保留 ${getProviderName(newProvider)} 的 API Key`,
          duration: 3000
        })
        // 保留当前的 API Key，只更新模型名称
        formData.model = model
        // 不清空 apiKey 和其他配置
      } else {
        // 切换到不同的提供商，清空配置
        ElMessage.info({
          message: `${model} 尚未配置，请填写 API Key`,
          duration: 2000
        })
        
        formData.apiKey = ''
        formData.apiUrl = ''
        hasApiKey.value = false
        configLoaded.value = false
      }
    }
  } catch (error: any) {
    // 404 表示没有配置
    if (error.response?.status === 404) {
      // 同一个提供商，保留 API Key
      if (oldProvider === newProvider && hasApiKey.value) {
        ElMessage.info({
          message: `${model} 尚未配置，但已保留 ${getProviderName(newProvider)} 的 API Key`,
          duration: 3000
        })
        formData.model = model
      } else {
        ElMessage.info({
          message: `${model} 尚未配置，请填写 API Key`,
          duration: 2000
        })
        
        formData.apiKey = ''
        formData.apiUrl = ''
        hasApiKey.value = false
        configLoaded.value = false
      }
    } else {
      console.error('查询模型配置失败:', error)
    }
  }
}

// 获取提供商名称
const getProviderName = (provider: string) => {
  const names: Record<string, string> = {
    'gemini': 'Google Gemini',
    'kimi': 'Kimi',
    'baidu': '百度文心',
    'openai': 'OpenAI',
    'alibaba': '阿里通义'
  }
  return names[provider] || provider
}

// 加载配置
const loadConfig = async () => {
  try {
    const data = await request.get('/ai-config') as any
    
    if (data) {
      // 检查是否已有 API Key
      hasApiKey.value = !!data.apiKey
      
      // 显示掩码后的 API Key
      const maskedApiKey = hasApiKey.value 
        ? data.apiKey.substring(0, 10) + '***' + data.apiKey.substring(data.apiKey.length - 5)
        : ''
      
      // 检查是否自定义了 API URL（与模型默认 URL 不同）
      const modelConfig = MODEL_CONFIG[data.model as keyof typeof MODEL_CONFIG]
      isCustomApiUrl.value = !!data.apiUrl && data.apiUrl !== modelConfig?.apiUrl
      hasApiUrl.value = isCustomApiUrl.value
      
      Object.assign(formData, {
        name: data.name,
        provider: data.provider,
        apiKey: maskedApiKey, // 显示掩码
        apiUrl: isCustomApiUrl.value ? data.apiUrl : '', // 只显示自定义的 URL
        model: data.model,
        isActive: data.isActive,
        maxTokens: data.maxTokens,
        temperature: data.temperature,
      })
      configLoaded.value = true
      
      ElMessage.success({
        message: hasApiKey.value 
          ? 'AI 配置已加载（敏感信息已隐藏）' 
          : '配置加载成功',
        duration: 2000
      })
    }
  } catch (error: any) {
    if (error.response?.status !== 404) {
      ElMessage.error(error.message || '加载配置失败')
    }
  }
}

// API URL 变化时的处理
const handleApiUrlChange = () => {
  // 用户手动输入了 API URL，标记为自定义
  if (formData.apiUrl && formData.apiUrl.trim() !== '') {
    isCustomApiUrl.value = true
  } else {
    isCustomApiUrl.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true
    
    // 准备提交数据
    const submitData: any = { ...formData }
    
    // 处理 API Key（如果是掩码则不发送，保留原值）
    if (formData.apiKey.includes('***') && hasApiKey.value) {
      delete submitData.apiKey
    } else if (!formData.apiKey && configLoaded.value) {
      delete submitData.apiKey
    } else if (!formData.apiKey && !configLoaded.value) {
      ElMessage.warning('请输入 API Key')
      submitting.value = false
      return
    }
    
    // 处理 API URL（如果为空则使用模型对应的默认 URL）
    if (!submitData.apiUrl || submitData.apiUrl.trim() === '') {
      const modelConfig = MODEL_CONFIG[formData.model as keyof typeof MODEL_CONFIG]
      if (modelConfig) {
        submitData.apiUrl = modelConfig.apiUrl
        isCustomApiUrl.value = false
      }
    } else {
      isCustomApiUrl.value = true
    }
    
    await request.put('/ai-config', submitData)
    
    const keyChanged = !formData.apiKey.includes('***')
    ElMessage.success(keyChanged ? '保存成功' : '保存成功（API Key 未变更）')

    await loadConfig()
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
    ElMessage.warning('请先填写 API Key')
    return
  }

  if (!formData.model) {
    ElMessage.warning('请先选择模型')
    return
  }

  testing.value = true
  const loadingMessage = ElMessage({
    message: `正在测试 ${formData.model} 连接，请稍候...`,
    type: 'info',
    duration: 0,
    icon: 'el-icon-loading'
  })

  try {
    // 准备测试数据
    const testData: any = { ...formData }
    
    // 处理 API Key（如果是掩码则不发送，后端会使用数据库中的值）
    if (testData.apiKey && testData.apiKey.includes('***')) {
      if (configLoaded.value && hasApiKey.value) {
        // 如果配置已加载且有保存的 Key，则删除掩码的 Key（后端会从数据库获取）
        delete testData.apiKey
      } else {
        ElMessage.warning('请先输入完整的 API Key')
        loadingMessage.close()
        testing.value = false
        return
      }
    }
    
    // 处理 API URL（如果为空则使用模型对应的默认 URL）
    if (!testData.apiUrl || testData.apiUrl.trim() === '') {
      const modelConfig = MODEL_CONFIG[formData.model as keyof typeof MODEL_CONFIG]
      if (modelConfig) {
        testData.apiUrl = modelConfig.apiUrl
      }
    }
    
    // 使用 PUT 方法，发送当前表单数据进行测试
    const result = await request.put('/ai-config/test', testData) as any
    loadingMessage.close()
    
    if (result.success) {
      // 显示成功详情
      const detailsText = result.details?.responsePreview 
        ? `\n\nAI 响应预览：\n${result.details.responsePreview}` 
        : ''
      
      ElMessage({
        message: `${result.message}${detailsText ? '\n\n已收到 AI 响应' : ''}`,
        type: 'success',
        duration: 5000,
        showClose: true,
        dangerouslyUseHTMLString: false
      })
      
      // 可选：显示更详细的模态框
      if (result.details) {
        console.log('✅ AI 连接测试详情:', result.details)
      }
    } else {
      // 显示失败详情
      let errorMsg = result.message || '连接测试失败'
      if (result.details) {
        console.error('❌ AI 连接失败详情:', result.details)
        errorMsg += '\n\n详细错误信息已输出到控制台'
      }
      
      ElMessage({
        message: errorMsg,
        type: 'error',
        duration: 10000,
        showClose: true
      })
    }
  } catch (error: any) {
    loadingMessage.close()
    
    let errorMsg = '测试失败'
    if (error.response?.data) {
      errorMsg = error.response.data.message || errorMsg
      console.error('❌ 测试失败详情:', error.response.data)
    } else if (error.message) {
      errorMsg = error.message
    }
    
    ElMessage({
      message: `${errorMsg}\n\n详细错误信息已输出到控制台`,
      type: 'error',
      duration: 10000,
      showClose: true
    })
  } finally {
    testing.value = false
  }
}

// 清除 API Key
const handleClearApiKey = () => {
  formData.apiKey = ''
  hasApiKey.value = false
}

// 重置表单
const handleReset = () => {
  if (configLoaded.value) {
    // 如果已加载配置，重新加载
    loadConfig()
  } else {
    // 否则重置为默认值
    formRef.value?.resetFields()
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






