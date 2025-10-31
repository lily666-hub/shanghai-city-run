import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, Star, Sparkles, Brain, Loader2, Settings, History, ThumbsUp, ThumbsDown, Heart, Navigation, Eye, Users, TrendingUp, Award } from 'lucide-react';
import { routeRecommendationService } from '../services/routeRecommendationService';
import { useAuth } from '../hooks/useAuth';
import { RouteRecommendation, RecommendationResponse } from '../types/routeRecommendation';
import RouteAgent from '../components/ai/agents/RouteAgent';

interface Route {
  id: string;
  name: string;
  distance: number;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  reviews: number;
  description: string;
  highlights: string[];
  image: string;
  location: string;
  elevation: number;
  popularity: number;
  tags: string[];
}

const Routes: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  
  // AI推荐相关状态
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<RouteRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiRecommendationResponse, setAiRecommendationResponse] = useState<RecommendationResponse | null>(null);

  // 处理开始导航
  const handleStartNavigation = (route: Route) => {
    // 这里可以集成地图导航功能
    console.log('开始导航到:', route.name);
  };

  // 处理查看详情
  const handleViewDetails = (route: Route) => {
    // 这里可以实现路线详情页面或模态框
    console.log('查看路线详情:', route);
  };

  // 获取AI智能推荐
  const handleGetAIRecommendations = async () => {
    if (!user) {
      alert('请先登录以使用AI智能推荐功能');
      return;
    }

    setIsLoadingAI(true);
    try {
      console.log('🤖 开始获取AI推荐...');
      const response = await routeRecommendationService.getRecommendations({
        userId: user.id,
        recommendationType: 'daily',
        limit: 5
      });

      setAiRecommendationResponse(response);
      setAiRecommendations(response.recommendations);
      setShowAIRecommendations(true);
      console.log('✅ AI推荐获取成功:', response);
    } catch (error) {
      console.error('❌ AI推荐获取失败:', error);
      alert('获取AI推荐失败，请稍后重试');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 处理推荐反馈
  const handleRecommendationFeedback = async (recommendationId: string, isPositive: boolean) => {
    if (!user) return;

    try {
      await routeRecommendationService.submitFeedback({
        recommendationId,
        userId: user.id,
        rating: isPositive ? 5 : 2,
        isUsed: false,
        usageData: {}
      });
      console.log('✅ 反馈提交成功');
    } catch (error) {
      console.error('❌ 反馈提交失败:', error);
    }
  };

  // 关闭AI推荐
  const handleCloseAIRecommendations = () => {
    setShowAIRecommendations(false);
    setAiRecommendations([]);
    setAiRecommendationResponse(null);
  };

  const routes: Route[] = [
    {
      id: '1',
      name: '外滩滨江步道',
      distance: 5.2,
      duration: '30-40分钟',
      difficulty: 'easy',
      rating: 4.8,
      reviews: 1234,
      description: '沿着黄浦江畔的经典跑步路线，可以欣赏到外滩万国建筑群和陆家嘴天际线的绝美景色。',
      highlights: ['江景', '夜景', '历史建筑', '平坦路面'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Shanghai%20Bund%20waterfront%20running%20path%20with%20skyline%20view&image_size=landscape_4_3',
      location: '黄浦区外滩',
      elevation: 5,
      popularity: 95,
      tags: ['江景', '夜跑', '观光']
    },
    {
      id: '2',
      name: '世纪公园环湖路线',
      distance: 3.8,
      duration: '25-35分钟',
      difficulty: 'easy',
      rating: 4.6,
      reviews: 856,
      description: '世纪公园内的环湖跑步路线，绿树成荫，空气清新，是晨跑的绝佳选择。',
      highlights: ['湖景', '绿化', '空气清新', '安全'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Century%20Park%20Shanghai%20lake%20running%20trail%20with%20trees&image_size=landscape_4_3',
      location: '浦东新区世纪公园',
      elevation: 15,
      popularity: 88,
      tags: ['公园', '晨跑', '湖景']
    },
    {
      id: '3',
      name: '陆家嘴金融区',
      distance: 6.5,
      duration: '40-50分钟',
      difficulty: 'medium',
      rating: 4.5,
      reviews: 642,
      description: '穿越上海金融中心的都市跑步路线，感受现代化都市的脉搏。',
      highlights: ['摩天大楼', '都市风光', '现代化', '挑战性'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Lujiazui%20financial%20district%20Shanghai%20urban%20running%20route&image_size=landscape_4_3',
      location: '浦东新区陆家嘴',
      elevation: 25,
      popularity: 82,
      tags: ['都市', '挑战', '金融区']
    },
    {
      id: '4',
      name: '徐家汇公园慢跑道',
      distance: 2.5,
      duration: '15-25分钟',
      difficulty: 'easy',
      rating: 4.4,
      reviews: 423,
      description: '市中心的绿色氧吧，适合短距离轻松跑步和恢复训练。',
      highlights: ['市中心', '绿化好', '短距离', '便利'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Xujiahui%20Park%20Shanghai%20jogging%20path%20green%20space&image_size=landscape_4_3',
      location: '徐汇区徐家汇',
      elevation: 8,
      popularity: 75,
      tags: ['公园', '短距离', '市中心']
    },
    {
      id: '5',
      name: '佘山森林公园',
      distance: 8.2,
      duration: '60-80分钟',
      difficulty: 'hard',
      rating: 4.7,
      reviews: 318,
      description: '上海郊区的山地跑步路线，挑战性强，适合有经验的跑者。',
      highlights: ['山地', '森林', '挑战性', '自然风光'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Sheshan%20Forest%20Park%20Shanghai%20mountain%20trail%20running&image_size=landscape_4_3',
      location: '松江区佘山',
      elevation: 120,
      popularity: 68,
      tags: ['山地', '森林', '挑战']
    }
  ];

  const filters = [
    { id: 'all', label: '全部', icon: MapPin },
    { id: 'easy', label: '简单', icon: Heart },
    { id: 'medium', label: '中等', icon: TrendingUp },
    { id: 'hard', label: '困难', icon: Award },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesFilter = selectedFilter === 'all' || route.difficulty === selectedFilter;
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return a.distance - b.distance;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* 头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">路线推荐</h1>
              <p className="text-gray-600">发现上海最佳跑步路线</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGetAIRecommendations}
                disabled={isLoadingAI}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAI ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                AI智能推荐
              </button>
              <button
                onClick={() => navigate('/route-recommendation-settings')}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5 mr-2" />
                推荐设置
              </button>
              <button
                onClick={() => navigate('/route-recommendation-history')}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <History className="w-5 h-5 mr-2" />
                推荐历史
              </button>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索路线、地点或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* 排序 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              找到 {sortedRoutes.length} 条路线
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popularity">按热度排序</option>
              <option value="rating">按评分排序</option>
              <option value="distance">按距离排序</option>
              <option value="difficulty">按难度排序</option>
            </select>
          </div>
        </div>

        {/* AI推荐卡片 */}
        {showAIRecommendations && aiRecommendationResponse && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg lg:rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Brain className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI智能推荐</h2>
                  <p className="text-sm text-gray-600">
                    置信度: {(aiRecommendationResponse.confidence * 100).toFixed(0)}% | 
                    处理时间: {aiRecommendationResponse.metadata.processingTime}ms
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseAIRecommendations}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-white rounded-lg border border-purple-100">
              <p className="text-sm text-gray-700">{aiRecommendationResponse.reasoning}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{recommendation.routeId}</h3>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleRecommendationFeedback(recommendation.id, true)}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRecommendationFeedback(recommendation.id, false)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">置信度</span>
                      <span className="font-medium text-purple-600">{Math.round(recommendation.confidenceScore * 100)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${recommendation.confidenceScore * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {recommendation.reasoning}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>路线ID: {recommendation.routeId}</span>
                    <span>{recommendation.recommendationType}</span>
                  </div>

                  <button
                    onClick={() => console.log('导航到路线:', recommendation.routeId)}
                    className="w-full mt-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all text-sm"
                  >
                    开始导航
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 路线列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {sortedRoutes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg lg:rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* 路线图片 */}
              <div className="relative h-48 lg:h-56">
                <img
                  src={route.image}
                  alt={route.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(route.difficulty)}`}>
                    {getDifficultyText(route.difficulty)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
                    <h3 className="font-semibold text-lg mb-1">{route.name}</h3>
                    <div className="flex items-center text-sm opacity-90">
                      <MapPin className="w-4 h-4 mr-1" />
                      {route.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* 路线信息 */}
              <div className="p-4 lg:p-6">
                {/* 基本数据 */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">{route.distance} km</div>
                    <div className="text-xs lg:text-sm text-gray-600">距离</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">{route.duration}</div>
                    <div className="text-xs lg:text-sm text-gray-600">时长</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">{route.elevation}m</div>
                    <div className="text-xs lg:text-sm text-gray-600">爬升</div>
                  </div>
                </div>

                {/* 评分和评论 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium text-gray-900">{route.rating}</span>
                    <span className="text-sm text-gray-600 ml-1">({route.reviews})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="w-4 h-4 mr-1" />
                    {route.popularity}% 热度
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{route.description}</p>

                {/* 亮点标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {route.highlights.slice(0, 3).map((highlight, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {highlight}
                    </span>
                  ))}
                  {route.highlights.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{route.highlights.length - 3}
                    </span>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleStartNavigation(route)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    开始导航
                  </button>
                  <button 
                    onClick={() => handleViewDetails(route)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    详情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {sortedRoutes.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的路线</h3>
            <p className="text-gray-600">尝试调整搜索条件或筛选器</p>
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-8 bg-blue-50 rounded-lg lg:rounded-xl p-4 lg:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">社区贡献</h3>
              <p className="text-sm text-blue-700 mt-1">
                这些路线由跑步社区成员推荐和评价。加入我们，分享你的跑步路线！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 路线智能体 */}
      <RouteAgent />
    </div>
  );
};

export default Routes;