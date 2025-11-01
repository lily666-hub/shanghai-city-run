// 对话管理服务 - 处理AI对话的存储、检索和上下文管理
import { supabase } from '../../lib/supabase';
import type { 
  AIConversation, 
  AIMessage, 
  AIContext, 
  SafetyProfile,
  AIConversationStats 
} from '../../types/ai';

export class ConversationManager {
  /**
   * 创建新对话
   */
  async createConversation(
    userId: string,
    options: {
      title?: string;
      aiProvider?: 'kimi' | 'deepseek';
      conversationType?: 'safety' | 'emergency' | 'general' | 'women_safety' | 'route_recommendation';
      isEmergency?: boolean;
    }
  ): Promise<AIConversation> {
    const startTime = performance.now();
    
    try {
      console.group('🗄️ Supabase API - 创建对话');
      console.log('📊 请求参数:', {
        userId,
        title: options.title,
        aiProvider: options.aiProvider,
        conversationType: options.conversationType,
        isEmergency: options.isEmergency,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          title: options.title || '新对话',
          ai_provider: options.aiProvider || 'kimi',
          conversation_type: options.conversationType || 'general',
          is_emergency: options.isEmergency || false,
        })
        .select()
        .single();

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        console.error('❌ Supabase错误:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          responseTime: `${responseTime}ms`
        });
        console.groupEnd();
        throw error;
      }

      console.log('✅ 创建成功:', {
        conversationId: data.id,
        responseTime: `${responseTime}ms`,
        data: JSON.stringify(data, null, 2)
      });
      console.groupEnd();

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        aiProvider: data.ai_provider,
        conversationType: data.conversation_type,
        isEmergency: data.is_emergency,
        isActive: data.is_active || true,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        messages: [],
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      console.group('❌ Supabase API 错误 - 创建对话');
      console.error('错误详情:', {
        error: error instanceof Error ? error.message : String(error),
        responseTime: `${responseTime}ms`,
        requestParams: { userId, title: options.title, aiProvider: options.aiProvider, conversationType: options.conversationType, isEmergency: options.isEmergency }
      });
      console.groupEnd();
      
      throw new Error('创建对话失败');
    }
  }

  /**
   * 获取用户的对话列表
   */
  async getUserConversations(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<AIConversation[]> {
    const startTime = performance.now();
    
    try {
      console.group('🗄️ Supabase API - 获取对话列表');
      console.log('📊 请求参数:', {
        userId,
        limit,
        offset,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_messages (
            id,
            role,
            content,
            created_at,
            confidence_score,
            metadata
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        console.error('❌ Supabase错误:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          responseTime: `${responseTime}ms`
        });
        console.groupEnd();
        throw error;
      }

      console.log('✅ 查询成功:', {
        conversationCount: data.length,
        responseTime: `${responseTime}ms`,
        totalMessages: data.reduce((sum, conv) => sum + (conv.ai_messages?.length || 0), 0)
      });
      console.log('📋 返回数据:', JSON.stringify(data, null, 2));
      console.groupEnd();

      return data.map(conv => ({
        id: conv.id,
        userId: conv.user_id,
        title: conv.title,
        aiProvider: conv.ai_provider,
        conversationType: conv.conversation_type,
        isEmergency: conv.is_emergency,
        isActive: conv.is_active || true,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        messages: conv.ai_messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          confidenceScore: msg.confidence_score,
          metadata: msg.metadata,
        })),
        lastMessage: conv.ai_messages.length > 0 ? conv.ai_messages[conv.ai_messages.length - 1].content : undefined,
        messageCount: conv.ai_messages.length,
      }));
    } catch (error) {
      console.error('获取对话列表失败:', error);
      throw new Error('获取对话列表失败');
    }
  }

  /**
   * 获取单个对话详情
   */
  async getConversation(conversationId: string): Promise<AIConversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_messages (
            id,
            role,
            content,
            created_at,
            confidence_score,
            metadata
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // 未找到
        throw error;
      }

      const sortedMessages = data.ai_messages
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          confidenceScore: msg.confidence_score,
          metadata: msg.metadata,
        }));

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        aiProvider: data.ai_provider,
        conversationType: data.conversation_type,
        isEmergency: data.is_emergency,
        isActive: data.is_active || true,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        messages: sortedMessages,
        lastMessage: sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].content : undefined,
        messageCount: sortedMessages.length,
      };
    } catch (error) {
      console.error('获取对话详情失败:', error);
      throw new Error('获取对话详情失败');
    }
  }

  /**
   * 添加消息到对话
   */
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any>,
    confidenceScore?: number
  ): Promise<AIMessage> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
          metadata: metadata || {},
          confidence_score: confidenceScore || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // 更新对话的更新时间
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return {
        id: data.id,
        role: data.role,
        content: data.content,
        timestamp: new Date(data.created_at),
        metadata: data.metadata,
        confidenceScore: data.confidence_score,
      };
    } catch (error) {
      console.error('添加消息失败:', error);
      throw new Error('添加消息失败');
    }
  }

  /**
   * 保存对话上下文
   */
  async saveContext(
    conversationId: string,
    locationData?: any,
    userContext?: any,
    safetyContext?: any
  ): Promise<AIContext> {
    try {
      const { data, error } = await supabase
        .from('ai_context')
        .insert({
          conversation_id: conversationId,
          location_data: locationData || {},
          user_context: userContext || {},
          safety_context: safetyContext || {},
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        conversationId: data.conversation_id,
        locationData: data.location_data,
        userContext: data.user_context,
        safetyContext: data.safety_context,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('保存上下文失败:', error);
      throw new Error('保存上下文失败');
    }
  }

  /**
   * 获取对话上下文
   */
  async getContext(conversationId: string): Promise<AIContext | null> {
    try {
      const { data, error } = await supabase
        .from('ai_context')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // 未找到
        throw error;
      }

      return {
        id: data.id,
        conversationId: data.conversation_id,
        locationData: data.location_data,
        userContext: data.user_context,
        safetyContext: data.safety_context,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('获取上下文失败:', error);
      return null;
    }
  }

  /**
   * 更新对话标题
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('更新对话标题失败:', error);
      throw new Error('更新对话标题失败');
    }
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('删除对话失败:', error);
      throw new Error('删除对话失败');
    }
  }

  /**
   * 获取用户安全档案
   */
  async getSafetyProfile(userId: string): Promise<SafetyProfile | null> {
    try {
      const { data, error } = await supabase
        .from('safety_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // 未找到
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        gender: data.gender,
        preferences: data.preferences,
        emergencyContacts: data.emergency_contacts,
        safetySettings: data.safety_settings,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('获取安全档案失败:', error);
      return null;
    }
  }

  /**
   * 创建或更新用户安全档案
   */
  async upsertSafetyProfile(
    userId: string,
    profile: Partial<SafetyProfile>
  ): Promise<SafetyProfile> {
    try {
      const { data, error } = await supabase
        .from('safety_profiles')
        .upsert({
          user_id: userId,
          gender: profile.gender,
          preferences: profile.preferences || {},
          emergency_contacts: profile.emergencyContacts || [],
          safety_settings: profile.safetySettings || {},
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        gender: data.gender,
        preferences: data.preferences,
        emergencyContacts: data.emergency_contacts,
        safetySettings: data.safety_settings,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('保存安全档案失败:', error);
      throw new Error('保存安全档案失败');
    }
  }

  /**
   * 获取用户对话统计
   */
  async getConversationStats(userId: string): Promise<AIConversationStats> {
    try {
      const { data, error } = await supabase
        .from('ai_conversation_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 如果没有统计数据，返回默认值
          return {
            totalConversations: 0,
            totalMessages: 0,
            activeConversations: 0,
            averageResponseTime: 1.2,
            womenSafetyConversations: 0,
            emergencyConversations: 0,
            emergencySessions: 0,
            lastConversationAt: new Date(),
          };
        }
        throw error;
      }

      return {
        totalConversations: data.total_conversations,
        totalMessages: data.total_messages || 0,
        activeConversations: data.active_conversations || 0,
        averageResponseTime: data.average_response_time || 1.2,
        womenSafetyConversations: data.women_safety_conversations,
        emergencyConversations: data.emergency_conversations,
        emergencySessions: data.emergency_sessions,
        lastConversationAt: new Date(data.last_conversation_at),
      };
    } catch (error) {
      console.error('获取对话统计失败:', error);
      throw new Error('获取对话统计失败');
    }
  }

  /**
   * 搜索对话
   */
  async searchConversations(
    userId: string,
    query: string,
    conversationType?: string
  ): Promise<AIConversation[]> {
    try {
      let queryBuilder = supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_messages (
            id,
            role,
            content,
            created_at,
            confidence_score,
            metadata
          )
        `)
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,ai_messages.content.ilike.%${query}%`)
        .order('updated_at', { ascending: false });

      if (conversationType) {
        queryBuilder = queryBuilder.eq('conversation_type', conversationType);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return data.map(conv => ({
        id: conv.id,
        userId: conv.user_id,
        title: conv.title,
        aiProvider: conv.ai_provider,
        conversationType: conv.conversation_type,
        isEmergency: conv.is_emergency,
        isActive: conv.is_active || true,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        messages: conv.ai_messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          confidenceScore: msg.confidence_score,
          metadata: msg.metadata,
        })),
        lastMessage: conv.ai_messages.length > 0 ? conv.ai_messages[conv.ai_messages.length - 1].content : undefined,
        messageCount: conv.ai_messages.length,
      }));
    } catch (error) {
      console.error('搜索对话失败:', error);
      throw new Error('搜索对话失败');
    }
  }
}