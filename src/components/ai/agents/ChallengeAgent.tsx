// 挑战竞赛智能体组件
import React, { useState, useEffect } from 'react';
import { Trophy, Target, Zap, TrendingUp, Clock, MapPin, Star, Flame } from 'lucide-react';
import { ChatInterface } from '../ChatInterface';
import { useAuthStore } from '../../../store/authStore';
import type { AIConversation, AIMessage, AIResponse } from '../../../types/ai';

interface ChallengeAgentProps {
  userRunningData?: {
    totalDistance: number;
    totalTime: number;
    averagePace: number;
    weeklyRuns: number;
    personalBest5K: number;
    personalBest10K: number;
    currentStreak: number;
    preferredDistance: string;
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  currentChallenge?: {
    id: string;
    title: string;
    type: string;
    progress: number;
    target: number;
    unit: string;
  };
  onChallengeRecommendation?: (challenge: any) => void;
  onMotivationNeeded?: (message: string) => void;
  className?: string;
}

export const ChallengeAgent: React.FC<ChallengeAgentProps> = ({
  userRunningData,
  currentChallenge,
  onChallengeRecommendation,
  onMotivationNeeded,
  className = '',
}) => {
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickActions, setQuickActions] = useState<string[]>([]);

  // 根据用户数据生成快速操作建议
  useEffect(() => {
    if (userRunningData) {
      const actions = generateQuickActions(userRunningData);
      setQuickActions(actions);
    }
  }, [userRunningData]);

  const generateQuickActions = (data: typeof userRunningData) => {
    if (!data) return [];

    const actions = [];
    
    // 基于健身水平推荐
    if (data.fitnessLevel === 'beginner') {
      actions.push('推荐适合新手的挑战');
      actions.push('制定循序渐进的训练计划');
    } else if (data.fitnessLevel === 'intermediate') {
      actions.push('推荐中级挑战项目');
      actions.push('分析我的跑步数据');
    } else {
      actions.push('推荐高难度挑战');
      actions.push('制定突破性训练计划');
    }

    // 基于连续天数
    if (data.currentStreak > 7) {
      actions.push('保持连续跑步的动力');
    } else {
      actions.push('如何建立跑步习惯');
    }

    // 基于个人最佳成绩
    if (data.personalBest5K > 0) {
      actions.push('如何突破5K个人最佳');
    }

    return actions.slice(0, 4); // 最多显示4个快速操作
  };

  const handleQuickAction = (action: string) => {
    // 这里可以直接发送预设消息到聊天界面
    const messageInput = document.querySelector('input[placeholder*="挑战"]') as HTMLInputElement;
    if (messageInput) {
      messageInput.value = action;
      messageInput.focus();
    }
  };

  const handleConversationCreated = (conv: AIConversation) => {
    setConversation(conv);
  };

  const handleMessageSent = (message: AIMessage, response: AIResponse) => {
    // 检查是否包含挑战推荐
    if (response.metadata?.challengeRecommendation) {
      onChallengeRecommendation?.(response.metadata.challengeRecommendation);
    }

    // 检查是否需要激励
    if (response.metadata?.motivationLevel === 'high') {
      onMotivationNeeded?.(response.message);
    }
  };

  const buildChallengeContext = () => {
    return {
      conversationId: conversation?.id || 'challenge-conversation',
      locationData: {
        latitude: 31.2304,
        longitude: 121.4737,
        address: '上海市',
        safetyLevel: 85
      },
      userContext: {
        userType: 'runner',
        preferences: {
          challengeTypes: ['distance', 'time', 'frequency'],
          motivationStyle: 'encouraging',
          fitnessLevel: userRunningData?.fitnessLevel || 'intermediate'
        }
      },
      safetyContext: {
        currentLevel: 'normal',
        alerts: []
      },
      currentChallenge: currentChallenge,
      agentContext: {
        agentType: 'challenge_competition',
        capabilities: [
          'challenge_recommendation',
          'progress_analysis',
          'motivation_coaching',
          'training_planning',
          'performance_tracking',
          'goal_setting',
          'real_time_encouragement'
        ]
      },
      createdAt: new Date()
    };
  };

  const getFitnessLevelColor = () => {
    if (!userRunningData) return 'text-gray-600 bg-gray-100';
    
    switch (userRunningData.fitnessLevel) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 text-center">
        <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">挑战竞赛智能体</h3>
        <p className="text-gray-600 mb-4">登录后获得个性化挑战推荐和专业指导</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* 智能体头部 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">挑战竞赛智能体</h3>
              <p className="text-orange-100 text-sm">专业的挑战推荐和训练指导</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 用户数据概览 */}
      {userRunningData && (
        <div className="p-4 bg-orange-50 border-b">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">运动数据</h4>
            <span className={`px-2 py-1 rounded text-xs ${getFitnessLevelColor()}`}>
              {userRunningData.fitnessLevel}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{userRunningData.totalDistance}km</div>
              <div className="text-xs text-gray-600">总距离</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{userRunningData.currentStreak}</div>
              <div className="text-xs text-gray-600">连续天数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{userRunningData.weeklyRuns}</div>
              <div className="text-xs text-gray-600">周跑步次数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{userRunningData.personalBest5K}min</div>
              <div className="text-xs text-gray-600">5K最佳</div>
            </div>
          </div>
        </div>
      )}

      {/* 当前挑战状态 */}
      {currentChallenge && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-500" />
              当前挑战
            </h4>
            <span className="text-sm text-blue-600 font-bold">{currentChallenge.progress}%</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{currentChallenge.title}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentChallenge.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>目标: {currentChallenge.target} {currentChallenge.unit}</span>
            <span>类型: {currentChallenge.type}</span>
          </div>
        </div>
      )}

      {/* 快速操作 */}
      {quickActions.length > 0 && (
        <div className="p-4 border-b">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            智能推荐
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="text-left p-3 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-colors text-sm"
              >
                <div className="flex items-center">
                  <Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{action}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 聊天界面 */}
      <div className={`transition-all duration-300 ${isExpanded ? 'h-96' : 'h-64'}`}>
        <ChatInterface
          conversationType="general"
          provider="deepseek"
          context={buildChallengeContext()}
          onConversationCreated={handleConversationCreated}
          onMessageSent={handleMessageSent}
          className="h-full border-0 rounded-none"
          placeholder="询问挑战推荐、训练计划或需要激励..."
        />
      </div>

      {/* 智能体特色功能提示 */}
      <div className="p-3 bg-gray-50 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            数据分析
          </div>
          <div className="flex items-center">
            <Flame className="w-3 h-3 mr-1" />
            实时激励
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            训练计划
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeAgent;