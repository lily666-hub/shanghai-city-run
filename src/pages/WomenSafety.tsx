import React, { useState, useEffect } from 'react';
import { Shield, Users, Phone, MapPin, Clock, Heart, Star, AlertTriangle, MessageCircle, Bot } from 'lucide-react';
import { WomenSafetyAdvisor } from '../components/ai';

interface SafetyFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
}

interface SafeZone {
  id: string;
  name: string;
  address: string;
  distance: number;
  safetyRating: number;
  features: string[];
  openHours: string;
}

interface RunningBuddy {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  distance: number;
  preferredTime: string;
  isOnline: boolean;
  verificationStatus: 'verified' | 'pending' | 'none';
}

interface SafetyTip {
  id: string;
  category: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

const WomenSafety: React.FC = () => {
  const [activeFeatures, setActiveFeatures] = useState<string[]>(['buddy-system', 'safe-zones']);
  const [selectedTab, setSelectedTab] = useState<'features' | 'zones' | 'buddies' | 'tips' | 'ai-advisor'>('features');

  const safetyFeatures: SafetyFeature[] = [
    {
      id: 'buddy-system',
      title: '跑步伙伴系统',
      description: '与附近的女性跑者结伴，确保跑步安全',
      icon: <Users className="w-6 h-6" />,
      isActive: activeFeatures.includes('buddy-system')
    },
    {
      id: 'safe-zones',
      title: '安全区域推荐',
      description: '为女性跑者推荐安全的跑步区域和路线',
      icon: <Shield className="w-6 h-6" />,
      isActive: activeFeatures.includes('safe-zones')
    },
    {
      id: 'emergency-contacts',
      title: '紧急联系人',
      description: '一键联系紧急联系人和安全服务',
      icon: <Phone className="w-6 h-6" />,
      isActive: activeFeatures.includes('emergency-contacts')
    },
    {
      id: 'real-time-tracking',
      title: '实时位置共享',
      description: '与信任的联系人实时共享跑步位置',
      icon: <MapPin className="w-6 h-6" />,
      isActive: activeFeatures.includes('real-time-tracking')
    }
  ];

  const safeZones: SafeZone[] = [
    {
      id: '1',
      name: '世纪公园女性专用跑道',
      address: '浦东新区锦绣路1001号',
      distance: 0.8,
      safetyRating: 95,
      features: ['24小时监控', '专用照明', '紧急呼叫点', '女性更衣室'],
      openHours: '05:00-22:00'
    },
    {
      id: '2',
      name: '静安雕塑公园安全区',
      address: '静安区石门二路128号',
      distance: 1.2,
      safetyRating: 92,
      features: ['安保巡逻', '充足照明', '人流密集', '医疗点'],
      openHours: '06:00-21:00'
    },
    {
      id: '3',
      name: '外滩滨江女性友好步道',
      address: '黄浦区中山东一路',
      distance: 2.1,
      safetyRating: 88,
      features: ['景观优美', '人流适中', '紧急设施', '休息区'],
      openHours: '全天开放'
    }
  ];

  const runningBuddies: RunningBuddy[] = [
    {
      id: '1',
      name: '小雨',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=young_asian_woman_runner_profile_photo_friendly_smile&image_size=square',
      rating: 4.9,
      distance: 0.5,
      preferredTime: '07:00-08:00',
      isOnline: true,
      verificationStatus: 'verified'
    },
    {
      id: '2',
      name: '晓梅',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=asian_woman_runner_profile_athletic_confident&image_size=square',
      rating: 4.8,
      distance: 0.8,
      preferredTime: '18:30-19:30',
      isOnline: true,
      verificationStatus: 'verified'
    },
    {
      id: '3',
      name: '丽丽',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=young_woman_runner_profile_sporty_cheerful&image_size=square',
      rating: 4.7,
      distance: 1.2,
      preferredTime: '06:30-07:30',
      isOnline: false,
      verificationStatus: 'verified'
    }
  ];

  const safetyTips: SafetyTip[] = [
    {
      id: '1',
      category: '跑步装备',
      title: '选择合适的跑步装备',
      content: '穿着反光材料的运动服，携带哨子和手机，确保在紧急情况下能够求助。',
      priority: 'high'
    },
    {
      id: '2',
      category: '路线规划',
      title: '选择安全的跑步路线',
      content: '避免偏僻路段，选择人流适中、照明良好的区域，提前了解路线上的安全设施。',
      priority: 'high'
    },
    {
      id: '3',
      category: '时间安排',
      title: '合理安排跑步时间',
      content: '尽量在白天或傍晚人流较多的时段跑步，避免深夜独自外出。',
      priority: 'medium'
    },
    {
      id: '4',
      category: '社交安全',
      title: '与跑步伙伴保持联系',
      content: '定期与跑步伙伴或家人报告位置，建立定时联系机制。',
      priority: 'medium'
    }
  ];

  const toggleFeature = (featureId: string) => {
    setActiveFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>;
      case 'pending':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Heart className="w-8 h-8 mr-3 text-pink-600" />
            女性专属安全保障
          </h1>
          <p className="text-gray-600">专为女性跑者设计的全方位安全保护系统</p>
        </div>

        {/* 导航标签 */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'features', label: '安全功能', icon: Shield },
              { key: 'zones', label: '安全区域', icon: MapPin },
              { key: 'buddies', label: '跑步伙伴', icon: Users },
              { key: 'tips', label: '安全贴士', icon: MessageCircle },
              { key: 'ai-advisor', label: 'AI安全顾问', icon: Bot }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`flex-1 flex items-center justify-center py-4 px-6 font-medium transition-colors ${
                  selectedTab === key
                    ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 安全功能标签页 */}
        {selectedTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safetyFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                  feature.isActive 
                    ? 'border-pink-300 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-200'
                }`}
                onClick={() => toggleFeature(feature.id)}
              >
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg mr-4 ${
                    feature.isActive ? 'bg-pink-200 text-pink-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-3">{feature.description}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      feature.isActive 
                        ? 'bg-pink-200 text-pink-800' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {feature.isActive ? '已启用' : '点击启用'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 安全区域标签页 */}
        {selectedTab === 'zones' && (
          <div className="space-y-6">
            {safeZones.map((zone) => (
              <div key={zone.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{zone.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="mr-4">{zone.address}</span>
                      <span className="text-sm">距离 {zone.distance} km</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-600">{zone.openHours}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">{zone.safetyRating}</div>
                    <div className="text-sm text-gray-600">安全评分</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {zone.features.map((feature, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 跑步伙伴标签页 */}
        {selectedTab === 'buddies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {runningBuddies.map((buddy) => (
              <div key={buddy.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={buddy.avatar}
                    alt={buddy.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-gray-800 mr-2">{buddy.name}</h3>
                      {getVerificationBadge(buddy.verificationStatus)}
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">{buddy.rating}</span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${buddy.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>距离 {buddy.distance} km</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>偏好时间: {buddy.preferredTime}</span>
                  </div>
                </div>
                
                <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  发送邀请
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 安全贴士标签页 */}
        {selectedTab === 'tips' && (
          <div className="space-y-6">
            {safetyTips.map((tip) => (
              <div key={tip.id} className={`border-l-4 p-6 rounded-r-xl ${getPriorityColor(tip.priority)}`}>
                <div className="flex items-start">
                  <div className="mr-4">
                    {tip.priority === 'high' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                    {tip.priority === 'medium' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                    {tip.priority === 'low' && <AlertTriangle className="w-6 h-6 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700 mr-3">
                        {tip.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tip.priority === 'high' ? 'bg-red-200 text-red-800' :
                        tip.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {tip.priority === 'high' ? '重要' : tip.priority === 'medium' ? '一般' : '提示'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{tip.title}</h3>
                    <p className="text-gray-700">{tip.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI安全顾问标签页 */}
        {selectedTab === 'ai-advisor' && (
          <div className="bg-white rounded-xl shadow-lg">
            <WomenSafetyAdvisor />
          </div>
        )}
      </div>
    </div>
  );
};

export default WomenSafety;