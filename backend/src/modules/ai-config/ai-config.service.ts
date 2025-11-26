import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateAiConfigDto } from './dto/update-ai-config.dto';

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有 AI 配置列表
   */
  async getAllConfigs() {
    const configs = await this.prisma.aiConfig.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return configs.map(config => ({
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}***${config.apiKey.substring(config.apiKey.length - 5)}` : '',
      apiKeyMasked: true,
    }));
  }

  /**
   * 根据模型名称获取配置
   */
  async getConfigByModel(model: string) {
    const config = await this.prisma.aiConfig.findUnique({
      where: { model },
    });

    if (!config) {
      return null;
    }

    return {
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}***${config.apiKey.substring(config.apiKey.length - 5)}` : '',
      apiKeyMasked: true,
    };
  }

  /**
   * 获取当前激活的 AI 配置
   */
  async getConfig() {
    const config = await this.prisma.aiConfig.findFirst({
      where: { isActive: true },
    });
    
    if (!config) {
      return null;
    }

    // 隐藏部分 API Key
    return {
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}***${config.apiKey.substring(config.apiKey.length - 5)}` : '',
      apiKeyMasked: true,
    };
  }

  /**
   * 获取完整 AI 配置（包含完整 API Key，用于内部调用）
   */
  async getFullConfig() {
    const config = await this.prisma.aiConfig.findFirst({
      where: { isActive: true },
    });
    
    if (config) {
      this.logger.debug(`📋 AI 配置详情:`);
      this.logger.debug(`   - ID: ${config.id}`);
      this.logger.debug(`   - 名称: ${config.name}`);
      this.logger.debug(`   - 模型: ${config.model}`);
      this.logger.debug(`   - 是否激活: ${config.isActive}`);
      this.logger.debug(`   - API Key 长度: ${config.apiKey?.length || 0}`);
      if (config.apiKey) {
        this.logger.debug(`   - API Key 前缀: ${config.apiKey.substring(0, 10)}...`);
        this.logger.debug(`   - API Key 后缀: ...${config.apiKey.substring(config.apiKey.length - 5)}`);
      }
      this.logger.debug(`   - API URL: ${config.apiUrl || '(未设置)'}`);
    } else {
      this.logger.warn('⚠️  数据库中没有找到激活的 AI 配置');
    }
    
    return config;
  }

  /**
   * 更新或创建 AI 配置（按模型）
   */
  async updateConfig(dto: UpdateAiConfigDto) {
    // 查找该模型是否已有配置
    const existingConfig = await this.prisma.aiConfig.findUnique({
      where: { model: dto.model },
    });

    if (existingConfig) {
      // 更新现有配置
      const updateData: any = { ...dto };
      if (!dto.apiKey) {
        delete updateData.apiKey;
        this.logger.log(`模型 ${dto.model}: API Key 未提供，保留原有值`);
      }
      
      // 如果设置为激活，先取消其他模型的激活状态
      if (dto.isActive) {
        await this.prisma.aiConfig.updateMany({
          where: { isActive: true, id: { not: existingConfig.id } },
          data: { isActive: false },
        });
        this.logger.log(`已将其他模型设置为非激活状态，激活模型: ${dto.model}`);
      }
      
      return await this.prisma.aiConfig.update({
        where: { id: existingConfig.id },
        data: updateData,
      });
    } else {
      // 创建新配置
      if (!dto.apiKey) {
        throw new Error('创建新配置时，API Key 是必填项');
      }
      
      // 如果设置为激活，先取消其他模型的激活状态
      if (dto.isActive) {
        await this.prisma.aiConfig.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
        this.logger.log(`已将其他模型设置为非激活状态，激活模型: ${dto.model}`);
      }
      
      return await this.prisma.aiConfig.create({
        data: dto as any,
      });
    }
  }

  /**
   * 测试 AI 配置是否有效（实际调用 AI API）
   */
  async testConfig(): Promise<{ success: boolean; message: string; details?: any }> {
    const config = await this.getFullConfig();

    if (!config) {
      return { success: false, message: 'AI 配置不存在，请先保存配置' };
    }

    if (!config.apiKey) {
      return { success: false, message: 'API Key 未配置' };
    }

    if (!config.apiUrl) {
      return { success: false, message: 'API URL 未配置' };
    }

    this.logger.log(`🧪 开始测试 AI 配置: ${config.model}`);

    try {
      const axios = require('axios');
      const modelLower = config.model.toLowerCase();

      // 根据不同的模型调用不同的测试方法
      if (modelLower.includes('gemini')) {
        return await this.testGeminiConnection(config, axios);
      } else if (modelLower.includes('moonshot') || modelLower.includes('kimi')) {
        return await this.testKimiConnection(config, axios);
      } else if (modelLower.includes('ernie')) {
        return await this.testErnieConnection(config, axios);
      } else if (modelLower.includes('gpt')) {
        return await this.testOpenAIConnection(config, axios);
      } else if (modelLower.includes('qwen')) {
        return await this.testQwenConnection(config, axios);
      } else {
        return { success: false, message: '未识别的模型类型' };
      }
    } catch (error) {
      this.logger.error('❌ 测试 AI 连接失败:', error);
      return {
        success: false,
        message: `连接测试失败: ${error.message || '未知错误'}`,
        details: error.response?.data || error.message
      };
    }
  }
  /**
   * 测试指定的 AI 配置数据（临时测试，不保存到数据库）
   */
  async testConfigWithData(dto: UpdateAiConfigDto): Promise<{ success: boolean; message: string; details?: any }> {
    const config = {
      model: dto.model,
      apiKey: dto.apiKey,
      apiUrl: dto.apiUrl,
      name: dto.name || dto.model,
    };

    // 如果没有提供 API Key，尝试从数据库获取
    if (!config.apiKey) {
      this.logger.log(`未提供 API Key，尝试从数据库查询模型: ${dto.model}`);
      
      // 先尝试查找当前模型的配置
      let dbConfig = await this.prisma.aiConfig.findUnique({
        where: { model: dto.model },
      });
      
      // 如果当前模型没有配置，尝试查找同一 provider 的其他配置
      if (!dbConfig) {
        this.logger.log(`当前模型未配置，尝试查找相同 provider (${dto.provider}) 的其他配置`);
        dbConfig = await this.prisma.aiConfig.findFirst({
          where: { provider: dto.provider },
          orderBy: { updatedAt: 'desc' }, // 使用最新的配置
        });
        
        if (dbConfig) {
          this.logger.log(`✅ 找到同 provider 的配置: ${dbConfig.model}, 将复用其 API Key`);
        }
      }
      
      if (dbConfig) {
        this.logger.log(`找到数据库配置: ${dbConfig.name} (${dbConfig.model}), API Key 长度: ${dbConfig.apiKey?.length || 0}`);
        if (dbConfig.apiKey) {
          config.apiKey = dbConfig.apiKey;
          this.logger.log(`✅ 使用数据库中保存的 API Key 进行测试`);
        } else {
          this.logger.warn(`⚠️ 数据库配置存在但 API Key 为空`);
          return { success: false, message: 'API Key 未配置，请先输入 API Key' };
        }
      } else {
        this.logger.warn(`⚠️ 数据库中未找到模型 ${dto.model} 或 provider ${dto.provider} 的任何配置`);
        return { success: false, message: 'API Key 未配置，请先输入完整的 API Key 或先为该提供商配置并保存一个模型' };
      }
    } else {
      this.logger.log(`✅ 使用用户提供的 API Key 进行测试，长度: ${config.apiKey.length}`);
    }

    if (!config.apiUrl) {
      return { success: false, message: 'API URL 未配置' };
    }

    this.logger.log(`🧪 开始测试临时 AI 配置: ${config.model}`);

    try {
      const axios = require('axios');
      const modelLower = config.model.toLowerCase();

      // 根据不同的模型调用不同的测试方法
      if (modelLower.includes('gemini')) {
        return await this.testGeminiConnection(config, axios);
      } else if (modelLower.includes('moonshot') || modelLower.includes('kimi')) {
        return await this.testKimiConnection(config, axios);
      } else if (modelLower.includes('ernie')) {
        return await this.testErnieConnection(config, axios);
      } else if (modelLower.includes('gpt')) {
        return await this.testOpenAIConnection(config, axios);
      } else if (modelLower.includes('qwen')) {
        return await this.testQwenConnection(config, axios);
      } else {
        return { success: false, message: '未识别的模型类型' };
      }
    } catch (error) {
      this.logger.error('❌ 测试 AI 连接失败:', error);
      
      // 根据错误状态码提供更友好的错误信息
      let friendlyMessage = error.message || '未知错误';
      
      if (error.response?.status === 429) {
        friendlyMessage = 'API 配额已用完，请稍后重试或升级您的配额';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        friendlyMessage = 'API Key 无效或权限不足，请检查您的 API Key';
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.error?.message) {
          friendlyMessage = `请求参数错误: ${errorData.error.message}`;
        } else {
          friendlyMessage = '请求参数错误，请检查 API 配置';
        }
      }
      
      return {
        success: false,
        message: `连接测试失败: ${friendlyMessage}`,
        details: error.response?.data || error.message
      };
    }
  }
  /**
   * 测试 Gemini 连接
   */
  private async testGeminiConnection(config: any, axios: any) {
    try {
      this.logger.log('🌟 测试 Gemini API 连接...');
      
      const response = await axios.post(
        `${config.apiUrl}?key=${config.apiKey}`,
        {
          contents: [{
            parts: [{
              text: 'Hello, please respond with a simple greeting to test the connection.'
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          proxy: false
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const reply = response.data.candidates[0].content.parts[0].text;
        this.logger.log('✅ Gemini 连接成功');
        return {
          success: true,
          message: 'Gemini API 连接成功！',
          details: {
            model: config.model,
            responsePreview: reply.substring(0, 100)
          }
        };
      }

      return { success: false, message: 'Gemini API 响应格式异常' };
    } catch (error) {
      this.logger.error('❌ Gemini 连接失败:', error.message);
      if (error.response?.data) {
        this.logger.error('详细错误信息:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * 测试 Kimi 连接
   */
  private async testKimiConnection(config: any, axios: any) {
    try {
      this.logger.log('🌙 测试 Kimi API 连接...');
      
      const response = await axios.post(
        config.apiUrl,
        {
          model: config.model,
          messages: [{
            role: 'user',
            content: 'Hello, please respond with a simple greeting.'
          }],
          max_tokens: 50
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          timeout: 10000,
          proxy: false
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        const reply = response.data.choices[0].message.content;
        this.logger.log('✅ Kimi 连接成功');
        return {
          success: true,
          message: 'Kimi API 连接成功！',
          details: {
            model: config.model,
            responsePreview: reply.substring(0, 100)
          }
        };
      }

      return { success: false, message: 'Kimi API 响应格式异常' };
    } catch (error) {
      this.logger.error('❌ Kimi 连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 测试文心一言连接
   */
  private async testErnieConnection(config: any, axios: any) {
    try {
      this.logger.log('💙 测试文心一言 API 连接...');
      
      // 解析 API Key 和 Secret Key
      const [ak, sk] = config.apiKey.includes(':') ? config.apiKey.split(':') : [config.apiKey, ''];
      
      if (!sk) {
        return {
          success: false,
          message: '文心一言配置错误：API Key 格式应为 "API_KEY:SECRET_KEY"'
        };
      }

      // 获取 access_token
      const tokenResponse = await axios.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: ak,
            client_secret: sk
          },
          timeout: 10000,
          proxy: false
        }
      );

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        return { success: false, message: '获取文心一言 access_token 失败，请检查 API Key 和 Secret Key' };
      }

      // 测试调用
      const response = await axios.post(
        `${config.apiUrl}?access_token=${accessToken}`,
        {
          messages: [{
            role: 'user',
            content: 'Hello, please respond with a simple greeting.'
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          proxy: false
        }
      );

      if (response.data?.result) {
        const reply = response.data.result;
        this.logger.log('✅ 文心一言连接成功');
        return {
          success: true,
          message: '文心一言 API 连接成功！',
          details: {
            model: config.model,
            responsePreview: reply.substring(0, 100)
          }
        };
      }

      return { success: false, message: '文心一言 API 响应格式异常' };
    } catch (error) {
      this.logger.error('❌ 文心一言连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 测试 OpenAI 连接
   */
  private async testOpenAIConnection(config: any, axios: any) {
    try {
      this.logger.log('🤖 测试 OpenAI API 连接...');
      
      const response = await axios.post(
        config.apiUrl,
        {
          model: config.model,
          messages: [{
            role: 'user',
            content: 'Hello, please respond with a simple greeting.'
          }],
          max_tokens: 50
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          timeout: 10000,
          proxy: false
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        const reply = response.data.choices[0].message.content;
        this.logger.log('✅ OpenAI 连接成功');
        return {
          success: true,
          message: 'OpenAI API 连接成功！',
          details: {
            model: config.model,
            responsePreview: reply.substring(0, 100)
          }
        };
      }

      return { success: false, message: 'OpenAI API 响应格式异常' };
    } catch (error) {
      this.logger.error('❌ OpenAI 连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 测试通义千问连接
   */
  private async testQwenConnection(config: any, axios: any) {
    try {
      this.logger.log('🔮 测试通义千问 API 连接...');
      
      const response = await axios.post(
        config.apiUrl,
        {
          model: config.model,
          input: {
            messages: [{
              role: 'user',
              content: 'Hello, please respond with a simple greeting.'
            }]
          },
          parameters: {
            result_format: 'message'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          timeout: 10000,
          proxy: false
        }
      );

      if (response.data?.output?.choices?.[0]?.message?.content) {
        const reply = response.data.output.choices[0].message.content;
        this.logger.log('✅ 通义千问连接成功');
        return {
          success: true,
          message: '通义千问 API 连接成功！',
          details: {
            model: config.model,
            responsePreview: reply.substring(0, 100)
          }
        };
      }

      return { success: false, message: '通义千问 API 响应格式异常' };
    } catch (error) {
      this.logger.error('❌ 通义千问连接失败:', error.message);
      throw error;
    }
  }
}






