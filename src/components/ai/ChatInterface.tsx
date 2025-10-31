// AI对话界面组件
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { aiService } from '../../services/ai';
import { useAuthStore } from '../../store/authStore';
import type { AIMessage, AIConversation, AIResponse } from '../../types/ai';

interface ChatInterfaceProps {
  conversationId?: string;
  conversation?: AIConversation;
  conversationType?: 'safety' | 'emergency' | 'general' | 'women_safety';
  provider?: 'kimi' | 'deepseek';
  context?: any;
  onConversationCreated?: (conversation: AIConversation) => void;
  onConversationUpdate?: (conversation: AIConversation) => void;
  onMessageSent?: (message: AIMessage, response: AIResponse) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  conversation: propConversation,
  conversationType = 'general',
  provider,
  context,
  onConversationCreated,
  onConversationUpdate,
  onMessageSent,
  className = '',
}) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理传入的对话对象
  useEffect(() => {
    if (propConversation) {
      setConversation(propConversation);
      setMessages(propConversation.messages || []);
    }
  }, [propConversation]);

  // 加载现有对话
  useEffect(() => {
    if (conversationId && !propConversation) {
      loadConversation();
    }
  }, [conversationId, propConversation]);

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      const conv = await aiService.getConversation(conversationId);
      if (conv) {
        setConversation(conv);
        setMessages(conv.messages || []);
      }
    } catch (error) {
      console.error('加载对话失败:', error);
      setError('加载对话失败');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.sendMessage(
        user.id,
        userMessage,
        conversationId || propConversation?.id,
        context,
        provider,
        conversationType
      );

      // 更新对话状态
      if (!conversation) {
        setConversation(result.conversation);
        onConversationCreated?.(result.conversation);
      } else {
        setConversation(result.conversation);
        onConversationUpdate?.(result.conversation);
      }

      // 更新消息列表
      setMessages(prev => [...prev, result.userMessage, result.aiMessage]);

      // 通知父组件
      onMessageSent?.(result.userMessage, result.response);

      // 如果是紧急情况，显示特殊提示
      if (result.response.emergencyLevel === 'critical' || result.response.emergencyLevel === 'high') {
        // 这里可以触发紧急通知
        console.log('检测到紧急情况:', result.response);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setError(error instanceof Error ? error.message : '发送消息失败');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (role: 'user' | 'assistant') => {
    if (role === 'user') {
      return <User className="w-5 h-5 text-blue-600" />;
    }
    
    // 根据提供商显示不同图标
    const providerName = conversation?.aiProvider || provider || 'kimi';
    return (
      <div className="flex items-center space-x-1">
        <Bot className="w-5 h-5 text-purple-600" />
        <Sparkles className="w-3 h-3 text-yellow-500" />
        <span className="text-xs text-gray-500 uppercase">{providerName}</span>
      </div>
    );
  };

  const getConversationTypeColor = () => {
    switch (conversationType) {
      case 'emergency':
        return 'border-red-500 bg-red-50';
      case 'women_safety':
        return 'border-pink-500 bg-pink-50';
      case 'safety':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getConversationTypeLabel = () => {
    switch (conversationType) {
      case 'emergency':
        return '紧急求助';
      case 'women_safety':
        return '女性安全';
      case 'safety':
        return '安全分析';
      default:
        return 'AI顾问';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        请先登录以使用AI智能安全顾问
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${getConversationTypeColor()} rounded-lg border-2 ${className}`}>
      {/* 对话头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">{getConversationTypeLabel()}</h3>
            {conversation && (
              <p className="text-sm text-gray-500">{conversation.title}</p>
            )}
          </div>
        </div>
        
        {conversationType === 'emergency' && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">紧急模式</span>
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">AI智能安全顾问</p>
            <p className="text-sm">
              {conversationType === 'emergency' && '我是您的紧急安全助手，请告诉我您遇到的情况。'}
              {conversationType === 'women_safety' && '我是您的女性专属安全顾问，为您提供个性化的安全建议。'}
              {conversationType === 'safety' && '我将为您分析当前环境的安全状况，提供专业建议。'}
              {conversationType === 'general' && '我是您的AI安全顾问，有什么可以帮助您的吗？'}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.role)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'assistant' && message.confidenceScore && (
                    <div className="mt-2 text-xs text-gray-500">
                      置信度: {Math.round(message.confidenceScore * 100)}%
                    </div>
                  )}
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.role)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-gray-500">AI正在思考...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              conversationType === 'emergency' 
                ? '请描述您遇到的紧急情况...'
                : '输入您的问题...'
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              conversationType === 'emergency'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* 快捷建议 */}
        {messages.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {conversationType === 'emergency' && (
              <>
                <button
                  onClick={() => setInputMessage('我遇到了危险，需要帮助')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                >
                  遇到危险
                </button>
                <button
                  onClick={() => setInputMessage('我迷路了，不知道怎么回家')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                >
                  迷路求助
                </button>
              </>
            )}
            {conversationType === 'women_safety' && (
              <>
                <button
                  onClick={() => setInputMessage('夜间跑步有什么安全建议？')}
                  className="px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200"
                >
                  夜间跑步
                </button>
                <button
                  onClick={() => setInputMessage('如何选择安全的跑步路线？')}
                  className="px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200"
                >
                  路线选择
                </button>
              </>
            )}
            {conversationType === 'general' && (
              <>
                <button
                  onClick={() => setInputMessage('分析一下我当前位置的安全状况')}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  安全分析
                </button>
                <button
                  onClick={() => setInputMessage('给我一些跑步安全建议')}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  安全建议
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};