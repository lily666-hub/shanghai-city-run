// DeepSeek API客户端服务
import type { AIRequest, AIResponse, AIContext } from '../../types/ai';

export class DeepSeekClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    this.baseUrl = 'https://api.deepseek.com/v1';
    this.model = 'deepseek-chat';
    
    if (!this.apiKey) {
      console.warn('DeepSeek API密钥未配置');
    }
  }

  /**
   * 发送消息到DeepSeek API
   */
  async sendMessage(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    try {
      const systemPrompt = this.buildSystemPrompt(request.conversationType, request.context);
      const userMessage = this.buildUserMessage(request.message, request.context);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || '抱歉，我无法处理您的请求。';

      return this.parseAIResponse(aiMessage, request.conversationType);
    } catch (error) {
      console.error('DeepSeek API调用错误:', error);
      throw new Error('AI服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(conversationType?: string, context?: Partial<AIContext>): string {
    const basePrompt = `你是上海城市跑应用的AI智能助手，专门为跑步者提供个性化的服务和支持。

你的核心能力：
1. 深度分析用户需求和环境条件
2. 提供基于数据的个性化建议
3. 学习用户习惯并优化建议
4. 快速响应并提供专业指导
5. 持续改进服务质量

你的特点：
- 逻辑清晰，分析深入
- 基于科学数据和实际案例
- 能够快速识别需求并提供解决方案
- 持续学习和改进建议质量`;

    let specificPrompt = '';
    
    switch (conversationType) {
      case 'route_recommendation':
        specificPrompt = `
专业领域：智能路线推荐
你是RouteAgent，专注于：
- 基于用户位置、偏好和实时条件推荐最佳跑步路线
- 分析地形、安全性、景观、人流量等多维度因素
- 考虑天气、空气质量、时间等环境因素
- 提供个性化的距离、难度、风景路线选择
- 实时优化路线建议，避开拥堵和危险区域
- 推荐适合不同技能水平的路线变化

回答风格：专业而友好，像一个经验丰富的跑步教练，善于发现最佳路线`;
        break;
      
      case 'challenge_competition':
        specificPrompt = `
专业领域：挑战竞赛指导
你是ChallengeAgent，专注于：
- 根据用户跑步数据和能力水平设计个性化挑战
- 提供循序渐进的训练计划和目标设定
- 实时监控跑步状态，给予鼓励和指导
- 分析跑步表现，提供改进建议
- 设计有趣的竞赛活动和成就系统
- 帮助用户突破个人记录和舒适区

回答风格：充满激情和鼓励，像一个专业的运动教练，善于激发潜能`;
        break;
      
      case 'safety_advisor':
        specificPrompt = `
专业领域：安全顾问服务
你是SafetyAgent，专注于：
- 深度分析跑步环境的安全风险
- 提供基于数据的个性化安全建议
- 为女性跑步者提供专业的安全指导
- 快速响应紧急情况并提供专业指导
- 实时监控安全状况，预警潜在风险
- 建立安全跑步的最佳实践指南

回答风格：专业严谨，高度关注安全，像一个经验丰富的安全专家`;
        break;
      
      case 'women_safety':
        specificPrompt = `
专业领域：女性跑步安全
深度关注：
- 女性跑步者的特殊安全需求和风险点
- 基于性别的安全威胁分析和预防
- 夜间和偏僻区域的安全策略
- 心理安全和自信心建设
- 社会支持网络的建立和利用
- 自我防护技能和应急响应`;
        break;
      
      case 'emergency':
        specificPrompt = `
专业领域：紧急情况处理
深度关注：
- 快速评估紧急情况的严重程度
- 提供即时的应急处理指导
- 协调救援资源和联系方式
- 心理支持和情绪稳定
- 预防措施和风险规避
- 后续跟进和康复建议`;
        break;
      
      default:
        specificPrompt = `
专业领域：综合跑步服务
提供全方位的跑步相关建议和支持。`;
    }

    // 添加上下文信息
    let contextPrompt = '';
    if (context) {
      if (context.userLocation) {
        contextPrompt += `\n当前用户位置：${context.userLocation.address || '上海市'}`;
      }
      if (context.weatherData) {
        contextPrompt += `\n当前天气：${context.weatherData.condition}，温度${context.weatherData.temperature}°C`;
      }
      if (context.userPreferences) {
        contextPrompt += `\n用户偏好：${JSON.stringify(context.userPreferences)}`;
      }
      if (context.safetyLevel) {
        contextPrompt += `\n安全等级：${context.safetyLevel}`;
      }
    }

    return `${basePrompt}\n${specificPrompt}${contextPrompt}

请始终：
1. 提供具体、可操作的建议
2. 考虑用户的安全和健康
3. 保持专业和友好的语调
4. 基于实际数据和科学原理
5. 适应用户的具体情况和需求`;
  }

  /**
   * 构建用户消息
   */
  private buildUserMessage(message: string, context?: Partial<AIContext>): string {
    return message;
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(aiMessage: string, conversationType?: string): AIResponse {
    // 基础响应
    const response: AIResponse = {
      message: aiMessage,
      confidence: 0.85, // DeepSeek通常有较高的置信度
    };

    // 智能检测紧急程度
    const criticalKeywords = ['立即', '马上', '紧急', '危险', '报警'];
    const highKeywords = ['注意', '小心', '避免', '警惕'];
    const emergencyKeywords = ['求救', '帮助', '110', '120', '救命'];

    const hasCritical = criticalKeywords.some(keyword => 
      aiMessage.toLowerCase().includes(keyword.toLowerCase())
    );
    const hasHigh = highKeywords.some(keyword => 
      aiMessage.toLowerCase().includes(keyword.toLowerCase())
    );
    const hasEmergency = emergencyKeywords.some(keyword => 
      aiMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasEmergency || conversationType === 'emergency') {
      response.emergencyLevel = 'critical';
      response.actionRequired = true;
    } else if (hasCritical) {
      response.emergencyLevel = 'high';
      response.actionRequired = true;
    } else if (hasHigh) {
      response.emergencyLevel = 'medium';
    } else {
      response.emergencyLevel = 'low';
    }

    // 智能提取建议
    const suggestions: string[] = [];
    
    // 使用正则表达式提取建议
    const suggestionPatterns = [
      /建议[：:](.+?)(?=[。！\n]|$)/g,
      /推荐[：:](.+?)(?=[。！\n]|$)/g,
      /应该(.+?)(?=[。！\n]|$)/g,
      /可以(.+?)(?=[。！\n]|$)/g,
    ];

    suggestionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(aiMessage)) !== null) {
        const suggestion = match[1]?.trim();
        if (suggestion && suggestion.length > 5 && suggestion.length < 100) {
          suggestions.push(suggestion);
        }
      }
    });

    if (suggestions.length > 0) {
      response.suggestions = [...new Set(suggestions)].slice(0, 5); // 去重并限制数量
    }

    // 添加元数据
    response.metadata = {
      provider: 'deepseek',
      model: this.model,
      conversationType,
      timestamp: new Date().toISOString(),
      analysisDepth: 'deep',
      suggestionCount: suggestions.length,
    };

    return response;
  }

  /**
   * 检查API连接状态
   */
  async checkConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 获取模型信息
   */
  async getModelInfo(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取模型信息失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取DeepSeek模型信息错误:', error);
      throw error;
    }
  }
}