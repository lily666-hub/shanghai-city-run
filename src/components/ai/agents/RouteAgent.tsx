// 路线推荐智能体组件
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Route, Compass, Star, Clock, TrendingUp, Shield } from 'lucide-react';
import { ChatInterface } from '../ChatInterface';
import { useAuthStore } from '../../../store/authStore';
import type { AIConversation, AIMessage, AIResponse } from '../../../types/ai';

interface RouteAgentProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  userPreferences?: {
    preferredDistance: number;
    preferredTerrain: 'flat' | 'hilly' | 'mixed';
    safetyPriority: 'high' | 'medium' | 'low';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    avoidAreas: string[];
  };
  weatherData?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    airQuality: number;
  };
  onRouteRecommendation?: (route: any) => void;
  onLocationUpdate?: (location: any) => void;
  className?: string;
}

export const RouteAgent: React.FC<RouteAgentProps> = ({
  userLocation,
  userPreferences,
  weatherData,
  onRouteRecommendation,
  onLocationUpdate,
  className = '',
}) => {
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickRoutes, setQuickRoutes] = useState<string[]>([]);

  // 根据用户偏好和位置生成快速路线建议
  useEffect(() => {
    if (userLocation && userPreferences) {
      const routes = generateQuickRoutes(userLocation, userPreferences);
      setQuickRoutes(routes);
    }
  }, [userLocation, userPreferences]);

  const generateQuickRoutes = (location: typeof userLocation, preferences: typeof userPreferences) => {
    if (!location || !preferences) return [];

    const routes = [];
    
    // 基于距离偏好
    if (preferences.preferredDistance <= 3) {
      routes.push('推荐附近3公里安全路线');
      routes.push('寻找平坦的短距离路线');
    } else if (preferences.preferredDistance <= 10) {
      routes.push('推荐5-10公里风景路线');
      routes.push('寻找有挑战性的中距离路线');
    } else {
      routes.push('推荐长距离马拉松路线');
      routes.push('寻找专业训练路线');
    }

    // 基于时间偏好
    if (preferences.timeOfDay === 'night') {
      routes.push('推荐夜跑安全路线');
    } else if (preferences.timeOfDay === 'morning') {
      routes.push('推荐晨跑清新路线');
    }

    // 基于安全优先级
    if (preferences.safetyPriority === 'high') {
      routes.push('寻找最安全的跑步路线');
    }

    return routes.slice(0, 4);
  };

  const handleQuickRoute = (route: string) => {
    const messageInput = document.querySelector('input[placeholder*="路线"]') as HTMLInputElement;
    if (messageInput) {
      messageInput.value = route;
      messageInput.focus();
    }
  };

  const handleConversationCreated = (conv: AIConversation) => {
    setConversation(conv);
  };

  const handleMessageSent = (message: AIMessage, response: AIResponse) => {
    // 检查是否包含路线推荐
    if (response.metadata?.routeRecommendation) {
      onRouteRecommendation?.(response.metadata.routeRecommendation);
    }

    // 检查是否需要位置更新
    if (response.metadata?.locationUpdate) {
      onLocationUpdate?.(response.metadata.locationUpdate);
    }
  };

  const buildRouteContext = () => {
    return {
      userLocation: userLocation,
      weatherData: weatherData,
      userPreferences: userPreferences,
      safetyLevel: userPreferences?.safetyPriority || 'medium',
      agentType: 'route_recommendation',
      capabilities: [
        'route_planning',
        'safety_analysis',
        'weather_consideration',
        'terrain_analysis',
        'real_time_navigation',
        'personalized_recommendations'
      ],
    };
  };

  const getSafetyLevel = () => {
    if (!userPreferences) return 'medium';
    return userPreferences.safetyPriority;
  };

  const getSafetyColor = () => {
    const level = getSafetyLevel();
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 text-center">
        <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">路线推荐智能体</h3>
        <p className="text-gray-600 mb-4">登录后获得个性化路线推荐和导航服务</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* 智能体头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">路线推荐智能体</h3>
              <p className="text-blue-100 text-sm">智能路线规划和导航助手</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 位置和偏好信息 */}
      <div className="p-4 bg-blue-50 border-b">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 当前位置 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              当前位置
            </h4>
            {userLocation ? (
              <p className="text-sm text-gray-700">{userLocation.address}</p>
            ) : (
              <p className="text-sm text-gray-500">未获取位置信息</p>
            )}
          </div>

          {/* 偏好设置 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              偏好设置
            </h4>
            {userPreferences ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">距离:</span>
                  <span className="text-gray-900">{userPreferences.preferredDistance}km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">安全级别:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getSafetyColor()}`}>
                    {userPreferences.safetyPriority}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">未设置偏好</p>
            )}
          </div>
        </div>
      </div>

      {/* 天气信息 */}
      {weatherData && (
        <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-cyan-500" />
            实时天气
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-cyan-600">{weatherData.temperature}°C</div>
              <div className="text-xs text-gray-600">温度</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-600">{weatherData.humidity}%</div>
              <div className="text-xs text-gray-600">湿度</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-600">{weatherData.windSpeed}km/h</div>
              <div className="text-xs text-gray-600">风速</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-600">{weatherData.airQuality}</div>
              <div className="text-xs text-gray-600">空气质量</div>
            </div>
          </div>
        </div>
      )}

      {/* 快速路线推荐 */}
      {quickRoutes.length > 0 && (
        <div className="p-4 border-b">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Route className="w-4 h-4 mr-2 text-green-500" />
            智能推荐
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {quickRoutes.map((route, index) => (
              <button
                key={index}
                onClick={() => handleQuickRoute(route)}
                className="text-left p-3 bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 rounded-lg transition-colors text-sm"
              >
                <div className="flex items-center">
                  <Navigation className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{route}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 聊天界面 */}
      <div className={`transition-all duration-300 ${isExpanded ? 'h-96' : 'h-64'}`}>
        <ChatInterface
          conversationType="route_recommendation"
          provider="deepseek"
          context={buildRouteContext()}
          onConversationCreated={handleConversationCreated}
          onMessageSent={handleMessageSent}
          className="h-full border-0 rounded-none"
          placeholder="询问路线推荐、导航建议或安全评估..."
        />
      </div>

      {/* 智能体特色功能提示 */}
      <div className="p-3 bg-gray-50 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            路线规划
          </div>
          <div className="flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            安全评估
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            实时导航
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteAgent;