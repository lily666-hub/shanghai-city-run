import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Route, 
  TrendingUp, 
  Star, 
  Users, 
  Heart,
  Share2,
  Play,
  MessageSquare,
  Tag,
  Calendar,
  Thermometer,
  Wind
} from 'lucide-react';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { RouteFeedback } from '../components/RouteFeedback';
import { FeedbackService } from '../services/feedbackService';

interface RouteDetailData {
  id: string;
  name: string;
  description: string;
  distance: number;
  duration: number;
  difficulty: number;
  startPoint: string;
  endPoint: string;
  elevation: number;
  routeType: string;
  features: string[];
  coordinates: [number, number][];
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  completionCount: number;
  tags: string[];
  weatherSuitability: string[];
  bestTimeToRun: string[];
  safetyTips: string[];
  landmarks: string[];
  facilities: string[];
}

interface RouteStats {
  averageRating: number;
  totalFeedbacks: number; // 改为totalFeedbacks以匹配FeedbackStats
  difficultyRating: number;
  safetyRating: number;
  sceneryRating: number;
  recommendationRate: number;
  popularTags: Array<{ tag: string; count: number }>;
  recentComments: Array<{
    comment: string;
    rating: number;
    createdAt: string;
  }>;
}

export const RouteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [route, setRoute] = useState<RouteDetailData | null>(null);
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'map'>('overview');

  useEffect(() => {
    if (id) {
      loadRouteDetail(id);
      loadRouteStats(id);
    }
  }, [id]);

  const loadRouteDetail = async (routeId: string) => {
    try {
      // 模拟数据，实际应该从API获取
      const mockRoute: RouteDetailData = {
        id: routeId,
        name: '外滩滨江跑道',
        description: '沿着黄浦江畔的经典跑步路线，欣赏浦江两岸的壮丽景色，感受上海的都市魅力。路线平坦易跑，适合各个水平的跑者。',
        distance: 5.2,
        duration: 30,
        difficulty: 3,
        startPoint: '外滩源',
        endPoint: '十六铺码头',
        elevation: 15,
        routeType: '城市景观',
        features: ['江景', '夜景', '历史建筑', '平坦路面'],
        coordinates: [[121.4944, 31.2397], [121.4956, 31.2389], [121.4968, 31.2381]],
        imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Shanghai%20Bund%20riverside%20running%20path%20at%20sunset%20with%20Huangpu%20River%20and%20Pudong%20skyline&image_size=landscape_16_9',
        rating: 4.6,
        reviewCount: 128,
        completionCount: 1250,
        tags: ['风景优美', '适合初学者', '夜跑推荐', '拍照圣地'],
        weatherSuitability: ['晴天', '多云', '微风'],
        bestTimeToRun: ['早晨 6:00-8:00', '傍晚 17:00-19:00', '夜晚 19:00-21:00'],
        safetyTips: [
          '注意避让行人和自行车',
          '夜跑时穿着反光装备',
          '注意江边湿滑路段',
          '保持适当距离，避免拥挤'
        ],
        landmarks: ['外滩万国建筑博览群', '黄浦江', '东方明珠', '上海中心大厦'],
        facilities: ['公共厕所', '饮水点', '休息座椅', '急救站']
      };
      
      setRoute(mockRoute);
    } catch (error) {
      console.error('加载路线详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRouteStats = async (routeId: string) => {
    try {
      const routeStats = await FeedbackService.getRouteFeedbackStats(routeId);
      setStats(routeStats);
    } catch (error) {
      console.error('加载路线统计失败:', error);
      // 使用模拟数据
      setStats({
        averageRating: 4.6,
        totalFeedbacks: 128,
        difficultyRating: 3.2,
        safetyRating: 4.8,
        sceneryRating: 4.9,
        recommendationRate: 0.89,
        popularTags: [
          { tag: '风景优美', count: 45 },
          { tag: '适合初学者', count: 32 },
          { tag: '夜跑推荐', count: 28 }
        ],
        recentComments: [
          { comment: '风景真的很棒，特别是夜景！', rating: 5, createdAt: '2024-01-15' },
          { comment: '路线很平坦，适合新手', rating: 4, createdAt: '2024-01-14' }
        ]
      });
    }
  };

  const handleStartRun = () => {
    // 实际应该跳转到跑步记录页面
    alert('开始跑步功能开发中...');
  };

  const handleFeedbackSubmit = async (feedback: any) => {
    try {
      // 这里需要用户ID，实际应该从认证系统获取
      const userId = 'current-user-id';
      await FeedbackService.submitFeedback(feedback, userId);
      
      // 重新加载统计数据
      if (id) {
        await loadRouteStats(id);
      }
      
      alert('反馈提交成功！');
      setShowFeedback(false);
    } catch (error) {
      console.error('提交反馈失败:', error);
      alert('提交失败，请重试');
    }
  };

  const handleShare = () => {
    if (navigator.share && route) {
      navigator.share({
        title: route.name,
        text: route.description,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // 实际应该调用API保存收藏状态
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">路线不存在</p>
          <button
            onClick={() => navigate('/recommendations')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回推荐页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部图片和基本信息 */}
      <div className="relative">
        <div className="h-56 sm:h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
          {route.imageUrl && (
            <img
              src={route.imageUrl}
              alt={route.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* 导航栏 */}
          <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <Share2 className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isFavorited
                    ? 'bg-red-500 text-white'
                    : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                }`}
              >
                <Heart className={`w-4 sm:w-5 h-4 sm:h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* 路线基本信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{route.name}</h1>
              <DifficultyBadge level={route.difficulty} />
            </div>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <Route className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>{route.distance} km</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>{route.duration} 分钟</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>{route.elevation}m 爬升</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
                <span>{route.rating}</span>
                <span className="text-gray-300">({route.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-xs sm:max-w-none px-4 sm:px-0">
          <button
            onClick={handleStartRun}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Play className="w-4 sm:w-5 h-4 sm:h-5" />
            开始跑步
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
            评价路线
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* 标签页导航 */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            {[
              { key: 'overview', label: '概览', icon: MapPin },
              { key: 'reviews', label: '评价', icon: MessageSquare },
              { key: 'map', label: '地图', icon: Route }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm sm:text-base">{label}</span>
              </button>
            ))}
          </div>
          
          {/* 标签页内容 */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* 路线描述 */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">路线介绍</h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{route.description}</p>
              </div>
              
              {/* 路线特色 */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">路线特色</h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {route.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 最佳跑步时间 */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Calendar className="w-4 sm:w-5 h-4 sm:h-5" />
                  最佳跑步时间
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {route.bestTimeToRun.map((time, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-medium text-sm sm:text-base">{time}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 天气适宜性 */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Thermometer className="w-4 sm:w-5 h-4 sm:h-5" />
                  适宜天气
                </h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {route.weatherSuitability.map((weather, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm flex items-center gap-1"
                    >
                      <Wind className="w-3 h-3" />
                      {weather}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 安全提示 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4">安全提示</h2>
                <ul className="space-y-2">
                  {route.safetyTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* 周边设施 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4">周边设施</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {route.facilities.map((facility, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-700 text-sm">{facility}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && stats && (
            <div className="space-y-6">
              {/* 评分统计 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6">用户评价</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 总体评分 */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(stats.averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{stats.totalFeedbacks} 条评价</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(stats.recommendationRate * 100)}% 推荐率
                    </p>
                  </div>
                  
                  {/* 详细评分 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">难度</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(stats.difficultyRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {stats.difficultyRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">安全性</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(stats.safetyRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {stats.safetyRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">风景</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(stats.sceneryRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {stats.sceneryRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 热门标签 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">热门标签</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.popularTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.tag} ({tag.count})
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 最新评论 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">最新评论</h3>
                <div className="space-y-4">
                  {stats.recentComments.map((comment, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= comment.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'map' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">路线地图</h2>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>地图功能开发中...</p>
                  <p className="text-sm mt-1">将集成高德地图显示详细路线</p>
                </div>
              </div>
              
              {/* 路线信息 */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">起点</h4>
                  <p className="text-gray-600">{route.startPoint}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">终点</h4>
                  <p className="text-gray-600">{route.endPoint}</p>
                </div>
              </div>
              
              {/* 地标建筑 */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">沿途地标</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {route.landmarks.map((landmark, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{landmark}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 反馈模态框 */}
      {showFeedback && (
        <RouteFeedback
          routeId={route.id}
          routeName={route.name}
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default RouteDetail;