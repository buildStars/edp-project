import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AiConfigService } from '../ai-config/ai-config.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class AiReportsService {
  private readonly logger = new Logger(AiReportsService.name);

  constructor(
    private prisma: PrismaService,
    private aiConfigService: AiConfigService,
  ) {}

  /**
   * 生成 AI 学习报告
   */
  async generateReport(userId: string, dto: GenerateReportDto) {
    const { year, force } = dto;

    // 检查是否已存在报告
    if (!force) {
      const existingReport = await this.prisma.aiReport.findFirst({
        where: { userId, year },
      });

      if (existingReport) {
        return existingReport;
      }
    }

    // 获取 AI 配置
    this.logger.log('🔧 开始获取 AI 配置...');
    const aiConfig = await this.aiConfigService.getFullConfig();
    
    if (!aiConfig) {
      this.logger.error('❌ AI 配置不存在');
      throw new BadRequestException('AI 服务未配置');
    }
    
    if (!aiConfig.isActive) {
      this.logger.error('❌ AI 服务未启用');
      throw new BadRequestException('AI 服务未启用');
    }
    
    this.logger.log('✅ AI 配置获取成功');

    // 获取用户学习数据
    const learningData = await this.getUserLearningData(userId, year);

    // 调用 AI 生成报告内容
    const aiContent = await this.callAiApi(aiConfig, learningData);

    // 保存或更新报告
    const report = await this.saveReport(userId, year, learningData, aiContent, aiConfig.model);

    return report;
  }

  /**
   * 获取用户学习报告
   */
  async getReport(userId: string, year: number) {
    const report = await this.prisma.aiReport.findFirst({
      where: { userId, year },
    });

    if (report) {
      // 增加查看次数
      await this.prisma.aiReport.update({
        where: { id: report.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return report;
  }

  /**
   * 获取用户所有报告列表
   */
  async getUserReports(userId: string) {
    return await this.prisma.aiReport.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
      select: {
        id: true,
        year: true,
        totalCredits: true,
        totalCourses: true,
        totalHours: true,
        generatedAt: true,
        viewCount: true,
      },
    });
  }

  /**
   * 获取用户学习数据
   */
  private async getUserLearningData(userId: string, year: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    // 获取报名的课程
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            credit: true,
            introduction: true,
            teacherName: true,
          },
        },
      },
    });

    // 获取学习成果
    const achievements = await this.prisma.learningAchievement.findMany({
      where: {
        userId,
        issuedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: {
          select: {
            title: true,
            category: true,
          },
        },
      },
    });

    // 统计各类型课程数量和学分
    const categoryStats = this.calculateCategoryStats(enrollments, achievements);

    // 计算总学时（假设每学分对应 8 学时）
    const totalHours = achievements.reduce((sum, a) => sum + a.credit, 0) * 8;

    return {
      totalCredits: achievements.reduce((sum, a) => sum + a.credit, 0),
      totalCourses: enrollments.length,
      completedCourses: achievements.length,
      totalHours,
      categoryStats,
      courses: enrollments.map((e) => ({
        title: e.course.title,
        category: e.course.category,
        introduction: e.course.introduction,
        teacherName: e.course.teacherName,
      })),
      achievements: achievements.map((a) => ({
        courseTitle: a.course.title,
        credits: a.credit,
        category: a.course.category,
      })),
    };
  }

  /**
   * 计算各类型课程统计
   * count: 报名课程数（包括未完成的）
   * credits: 完成课程获得的学分
   */
  private calculateCategoryStats(enrollments: any[], achievements: any[]) {
    const stats = {
      ACCELERATE: { count: 0, credits: 0, name: '加速课堂' },
      MASTER: { count: 0, credits: 0, name: '大师课堂' },
      EMPOWER: { count: 0, credits: 0, name: '赋能课堂' },
    };

    // 统计报名课程数
    enrollments.forEach((enrollment) => {
      const category = enrollment.course.category;
      if (stats[category]) {
        stats[category].count++;
      }
    });

    // 统计完成学分
    achievements.forEach((achievement) => {
      const category = achievement.course.category;
      if (stats[category]) {
        stats[category].credits += achievement.credit;
      }
    });

    return stats;
  }

  /**
   * 调用 AI API 生成报告内容
   */
  private async callAiApi(aiConfig: any, learningData: any) {
    try {
      // 构建提示词
      const prompt = this.buildPrompt(learningData);

      this.logger.log(`📊 生成 AI 报告，模型: ${aiConfig.model}`);

      let response = null;
      
      // 根据配置的模型选择 AI 服务
      if (aiConfig.apiKey) {
        const modelLower = aiConfig.model.toLowerCase();
        
        // Gemini 模型
        if (modelLower.includes('gemini')) {
          this.logger.log('🌟 使用 Google Gemini API');
          this.logger.debug(`🔑 API Key 长度: ${aiConfig.apiKey.length}, 前缀: ${aiConfig.apiKey.substring(0, 10)}...`);
          
          let geminiUrl = aiConfig.apiUrl;
          if (!geminiUrl) {
            geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
            this.logger.log('📝 使用默认 Gemini 模型: gemini-2.5-flash');
          }
          
          response = await this.callGeminiApi(aiConfig.apiKey, geminiUrl, prompt);
        } 
        // Kimi（Moonshot）模型
        else if (modelLower.includes('moonshot') || modelLower.includes('kimi')) {
          this.logger.log('🌙 使用 Kimi (Moonshot) API');
          response = await this.callKimiApi(aiConfig.apiKey, aiConfig.apiUrl, prompt, aiConfig.model);
        }
        // 文心一言模型
        else if (modelLower.includes('ernie')) {
          this.logger.log('💙 使用百度文心一言 API');
          response = await this.callErnieApi(aiConfig.apiKey, aiConfig.apiUrl, prompt, aiConfig.model);
        }
        // OpenAI 模型
        else if (modelLower.includes('gpt') || aiConfig.apiUrl?.includes('openai.com')) {
          this.logger.log('🤖 使用 OpenAI API');
          response = await this.callOpenAIApi(aiConfig.apiKey, aiConfig.apiUrl, prompt, aiConfig.model);
        }
        // 通义千问
        else if (modelLower.includes('qwen')) {
          this.logger.log('🔮 使用阿里通义千问 API');
          response = await this.callQwenApi(aiConfig.apiKey, aiConfig.apiUrl, prompt, aiConfig.model);
        }
        else {
          this.logger.warn('⚠️  未识别的 AI 服务，使用智能生成');
          response = null;
        }
      } else {
        this.logger.warn('⚠️  缺少 API Key，使用智能生成');
      }

      // 如果 AI 调用成功，解析响应；否则使用智能默认内容
      if (response) {
        return this.parseAiResponse(response, learningData);
      } else {
        // 使用基于真实数据的智能生成
        return this.generateDefaultContent(learningData);
      }
    } catch (error) {
      this.logger.error('❌ AI API 调用失败:', error);
      // 返回基于真实数据的智能生成内容
      return this.generateDefaultContent(learningData);
    }
  }

  /**
   * 构建 AI 提示词
   */
  private buildPrompt(learningData: any) {
    const { totalCredits, totalCourses, completedCourses, categoryStats, courses } = learningData;

    return `你是一位专业的企业培训学习顾问。请根据以下学员的学习数据，生成一份年度学习报告。

学习统计：
- 总学分：${totalCredits}
- 报名课程数：${totalCourses}
- 完成课程数：${completedCourses}
- 加速课堂（快速提升）：${categoryStats.ACCELERATE.count}门课程，${categoryStats.ACCELERATE.credits}学分
- 大师课堂（高端培训）：${categoryStats.MASTER.count}门课程，${categoryStats.MASTER.credits}学分
- 赋能课堂（实战技能）：${categoryStats.EMPOWER.count}门课程，${categoryStats.EMPOWER.credits}学分

已学课程列表：
${courses.length > 0 ? courses.map((c, i) => `${i + 1}. ${c.title} - 讲师：${c.teacherName}`).join('\n') : '暂无完成课程'}

请生成一份专业的年度学习报告，要求：
1. 语言要专业、正式、鼓励性
2. 分析要基于实际数据，有针对性
3. 建议要切实可行，有指导意义

请严格按照以下 JSON 格式返回（不要添加任何其他文本，所有字段必须是字符串类型，不要使用数组）：

\`\`\`json
{
  "summary": "简短的学习总结（80-100字，总结学员一年的学习表现和成长）",
  "achievements": "主要成就列表（字符串格式，3-5条，每条以 • 开头并用 \\n 分隔，基于实际课程分析）",
  "knowledgePoints": "掌握的关键知识点（字符串格式，5-8条，每条以 • 开头并用 \\n 分隔，结合课程内容）",
  "recommendations": "后续学习建议（字符串格式，3-5条，每条以 • 开头并用 \\n 分隔，具体可行的建议）"
}
\`\`\`

示例输出：
{
  "summary": "本年度，您展现了积极的学习态度...",
  "achievements": "• 完成了5门课程\\n• 获得了30学分\\n• 掌握了核心技能",
  "knowledgePoints": "• 企业战略管理\\n• 团队领导力\\n• 财务分析",
  "recommendations": "• 建议继续深入学习\\n• 可以尝试更多实战项目\\n• 加强理论与实践结合"
}`;
  }

  /**
   * 调用 Kimi (Moonshot) API
   * 官方文档: https://platform.moonshot.cn/docs/api/chat
   * 兼容 OpenAI SDK 格式
   */
  private async callKimiApi(apiKey: string, apiUrl: string, prompt: string, model: string) {
    const axios = require('axios');
    
    try {
      this.logger.log('🌙 调用 Kimi API 生成报告...');
      this.logger.debug(`模型: ${model}, URL: ${apiUrl}`);
      
      const response = await axios.post(
        apiUrl,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 30000,
          proxy: false
        }
      );
      
      if (response.data?.choices?.[0]?.message?.content) {
        const aiText = response.data.choices[0].message.content;
        this.logger.log('✅ Kimi API 调用成功');
        this.logger.debug(`响应长度: ${aiText.length} 字符`);
        return this.parseGeminiResponse(aiText); // 使用相同的解析逻辑
      }
      
      throw new Error('Kimi API 响应格式异常');
    } catch (error) {
      this.logger.error('❌ Kimi API 调用失败:', error.message || error);
      if (error.response) {
        this.logger.error('响应状态:', error.response.status);
        this.logger.error('响应数据:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * 调用文心一言 API
   * 官方文档: https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11
   */
  private async callErnieApi(apiKey: string, apiUrl: string, prompt: string, model: string) {
    const axios = require('axios');
    
    try {
      this.logger.log('💙 调用文心一言 API 生成报告...');
      this.logger.debug(`模型: ${model}, URL: ${apiUrl}`);
      
      // 文心一言需要先用 API Key 和 Secret Key 换取 access_token
      // 这里简化处理，假设 apiKey 格式为 "API_KEY:SECRET_KEY"
      const [ak, sk] = apiKey.includes(':') ? apiKey.split(':') : [apiKey, ''];
      
      if (!sk) {
        throw new Error('文心一言需要 API Key 和 Secret Key，格式: API_KEY:SECRET_KEY');
      }
      
      // 获取 access_token
      const tokenResponse = await axios.post(
        `https://aip.baidubce.com/oauth/2.0/token`,
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
        throw new Error('获取文心一言 access_token 失败');
      }
      
      // 调用文心一言 API
      const response = await axios.post(
        `${apiUrl}?access_token=${accessToken}`,
        {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 0.8
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000,
          proxy: false
        }
      );
      
      if (response.data?.result) {
        const aiText = response.data.result;
        this.logger.log('✅ 文心一言 API 调用成功');
        this.logger.debug(`响应长度: ${aiText.length} 字符`);
        return this.parseGeminiResponse(aiText);
      }
      
      throw new Error('文心一言 API 响应格式异常');
    } catch (error) {
      this.logger.error('❌ 文心一言 API 调用失败:', error.message || error);
      if (error.response) {
        this.logger.error('响应状态:', error.response.status);
        this.logger.error('响应数据:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * 调用 OpenAI API
   */
  private async callOpenAIApi(apiKey: string, apiUrl: string, prompt: string, model: string) {
    const axios = require('axios');
    
    try {
      this.logger.log('🤖 调用 OpenAI API 生成报告...');
      
      const response = await axios.post(
        apiUrl || 'https://api.openai.com/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 30000,
          proxy: false
        }
      );
      
      if (response.data?.choices?.[0]?.message?.content) {
        const aiText = response.data.choices[0].message.content;
        this.logger.log('✅ OpenAI API 调用成功');
        return this.parseGeminiResponse(aiText);
      }
      
      throw new Error('OpenAI API 响应格式异常');
    } catch (error) {
      this.logger.error('❌ OpenAI API 调用失败:', error.message || error);
      throw error;
    }
  }

  /**
   * 调用通义千问 API
   */
  private async callQwenApi(apiKey: string, apiUrl: string, prompt: string, model: string) {
    const axios = require('axios');
    
    try {
      this.logger.log('🔮 调用通义千问 API 生成报告...');
      
      const response = await axios.post(
        apiUrl,
        {
          model: model,
          input: {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            result_format: 'message'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 30000,
          proxy: false
        }
      );
      
      if (response.data?.output?.choices?.[0]?.message?.content) {
        const aiText = response.data.output.choices[0].message.content;
        this.logger.log('✅ 通义千问 API 调用成功');
        return this.parseGeminiResponse(aiText);
      }
      
      throw new Error('通义千问 API 响应格式异常');
    } catch (error) {
      this.logger.error('❌ 通义千问 API 调用失败:', error.message || error);
      throw error;
    }
  }

  /**
   * 调用 Gemini API
   * 官方文档: https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn#javascript
   */
  private async callGeminiApi(apiKey: string, apiUrl: string, prompt: string) {
    const axios = require('axios');
    
    try {
      this.logger.log('🤖 调用 Gemini API 生成报告...');
      
      // 根据官方文档，API Key 应该放在 Header 中的 x-goog-api-key
      // URL 格式: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
      const requestUrl = apiUrl;
      
      this.logger.debug(`请求 URL: ${requestUrl}`);
      
      const response = await axios.post(
        requestUrl,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey  // API Key 放在 Header 中
          },
          timeout: 30000, // 30秒超时
          proxy: false
        }
      );
      
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiText = response.data.candidates[0].content.parts[0].text;
        this.logger.log('✅ Gemini API 调用成功');
        this.logger.debug(`响应长度: ${aiText.length} 字符`);
        
        // 尝试解析 JSON 响应
        return this.parseGeminiResponse(aiText);
      } else {
        this.logger.warn('⚠️  Gemini 返回格式异常');
        this.logger.debug('响应数据:', JSON.stringify(response.data, null, 2));
        return null;
      }
    } catch (error) {
      this.logger.error('❌ Gemini API 调用失败:', error.message);
      if (error.response) {
        this.logger.error('响应状态:', error.response.status);
        this.logger.error('响应数据:', JSON.stringify(error.response.data));
      } else if (error.code) {
        this.logger.error('错误代码:', error.code);
      }
      return null;
    }
  }
  
  /**
   * 解析 Gemini 响应
   */
  private parseGeminiResponse(text: string) {
    try {
      // 尝试提取 JSON（Gemini 可能会在代码块中返回）
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // 处理可能的数组格式（Gemini 有时返回数组）
        const formatField = (field: any): string => {
          if (Array.isArray(field)) {
            return field.join('\n');
          }
          return String(field || '');
        };
        
        return {
          summary: formatField(parsed.summary || parsed.总结),
          achievements: formatField(parsed.achievements || parsed.成就),
          knowledgePoints: formatField(parsed.knowledgePoints || parsed.知识点),
          recommendations: formatField(parsed.recommendations || parsed.建议),
        };
      }
      
      // 如果不是 JSON 格式，尝试解析纯文本
      return this.parseTextResponse(text);
    } catch (error) {
      this.logger.warn('解析 Gemini 响应失败，尝试文本解析');
      return this.parseTextResponse(text);
    }
  }
  
  /**
   * 解析文本响应
   */
  private parseTextResponse(text: string) {
    // 简单的文本解析逻辑
    const lines = text.split('\n').filter(line => line.trim());
    return {
      summary: lines.slice(0, 3).join(' '),
      achievements: lines.filter(l => l.includes('•') || l.includes('-')).join('\n'),
      knowledgePoints: '• 基于 AI 分析的知识点',
      recommendations: '• 继续保持学习热情',
    };
  }

  /**
   * 解析 AI 响应
   */
  private parseAiResponse(response: any, learningData: any) {
    // 生成雷达图数据
    const radarData = this.generateRadarData(learningData.categoryStats);

    return {
      summary: response.summary,
      achievements: response.achievements,
      knowledgePoints: response.knowledgePoints,
      recommendations: response.recommendations,
      radarData: JSON.stringify(radarData),
    };
  }

  /**
   * 生成雷达图数据
   * 确保所有维度都有基础分，避免空白显示
   */
  private generateRadarData(categoryStats: any) {
    // 计算评分规则：
    // - 基础分：50分（保证图形饱满美观）
    // - 报名分：+5分（每报名1门课程）
    // - 学分分：+5分/学分（每完成1学分加5分）
    const calculateScore = (category: any) => {
      const baseScore = 50; // 所有维度都有50分基础分
      const enrollScore = Math.min(10, category.count * 5); // 报名分（最高10分）
      const creditScore = Math.min(40, category.credits * 5); // 学分分（最高40分）
      return Math.min(100, baseScore + enrollScore + creditScore);
    };

    // 计算各类别分数
    const accelerateScore = calculateScore(categoryStats.ACCELERATE);
    const masterScore = calculateScore(categoryStats.MASTER);
    const empowerScore = calculateScore(categoryStats.EMPOWER);

    // 综合能力评分（交叉维度，确保最低50分）
    const strategicScore = Math.max(50, Math.round((accelerateScore + masterScore) / 2));
    const practicalScore = Math.max(50, Math.round((empowerScore + masterScore) / 2));

    return {
      indicators: [
        { name: '战略管理', max: 100 },
        { name: '创新能力', max: 100 },
        { name: '领导力', max: 100 },
        { name: '财务管理', max: 100 },
        { name: '市场营销', max: 100 },
      ],
      values: [
        strategicScore,     // 战略管理 = (加速 + 大师) / 2，最低15
        accelerateScore,    // 创新能力 = 加速课堂，最低15
        masterScore,        // 领导力 = 大师课堂，最低15
        practicalScore,     // 财务管理 = (赋能 + 大师) / 2，最低15
        empowerScore,       // 市场营销 = 赋能课堂，最低15
      ],
    };
  }

  /**
   * 生成默认内容（当 AI 调用失败时）
   */
  private generateDefaultContent(learningData: any) {
    const radarData = this.generateRadarData(learningData.categoryStats);

    return {
      summary: `在过去的一年中，您共完成了${learningData.completedCourses}门课程，获得${learningData.totalCredits}学分，展现出良好的学习态度和专业精神。`,
      achievements: '• 积极参与课程学习\n• 完成了多门专业课程\n• 保持良好的学习记录',
      knowledgePoints: '• 企业管理\n• 战略规划\n• 团队协作\n• 专业技能提升',
      recommendations: '• 建议继续保持学习热情\n• 可以尝试更多不同类型的课程\n• 加强理论与实践的结合',
      radarData: JSON.stringify(radarData),
    };
  }

  /**
   * 保存报告
   */
  private async saveReport(
    userId: string,
    year: number,
    learningData: any,
    aiContent: any,
    aiModel: string,
  ) {
    const existingReport = await this.prisma.aiReport.findFirst({
      where: { userId, year },
    });

    // 创建报告数据
    const createData = {
      userId,
      year,
      totalCredits: learningData.totalCredits,
      totalCourses: learningData.totalCourses,
      totalHours: learningData.totalHours,
      summary: aiContent.summary,
      achievements: aiContent.achievements,
      knowledgePoints: aiContent.knowledgePoints,
      recommendations: aiContent.recommendations,
      radarData: aiContent.radarData,
      aiModel,
    };

    // 更新报告数据（不包含 userId 和 year，因为这些是唯一标识）
    const updateData = {
      totalCredits: learningData.totalCredits,
      totalCourses: learningData.totalCourses,
      totalHours: learningData.totalHours,
      summary: aiContent.summary,
      achievements: aiContent.achievements,
      knowledgePoints: aiContent.knowledgePoints,
      recommendations: aiContent.recommendations,
      radarData: aiContent.radarData,
      aiModel,
    };

    if (existingReport) {
      this.logger.log(`📝 更新已有报告: ${existingReport.id}`);
      return await this.prisma.aiReport.update({
        where: { id: existingReport.id },
        data: updateData,
      });
    } else {
      this.logger.log(`✨ 创建新报告`);
      return await this.prisma.aiReport.create({
        data: createData,
      });
    }
  }
}

