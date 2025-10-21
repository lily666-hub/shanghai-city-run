import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, Route, Trophy, Users, Clock, Target, Calendar, MapPin } from 'lucide-react';

const Home: React.FC = () => {
  const stats = [
    { label: '总跑步距离', value: '128.5', unit: 'km', icon: BarChart3, color: 'text-blue-500' },
    { label: '本月跑步', value: '15', unit: '次', icon: Clock, color: 'text-green-500' },
    { label: '完成挑战', value: '3', unit: '个', icon: Trophy, color: 'text-orange-500' },
    { label: '跑友数量', value: '42', unit: '人', icon: Users, color: 'text-purple-500' },
  ];

  const quickActions = [
    { name: '开始跑步', href: '/run', icon: Activity, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { name: '数据统计', href: '/stats', icon: BarChart3, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { name: '路线推荐', href: '/routes', icon: Route, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { name: '挑战竞赛', href: '/challenges', icon: Trophy, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  ];

  const recentRuns = [
    { date: '2024-01-15', distance: 5.2, duration: '28:30', pace: '5:28', location: '外滩' },
    { date: '2024-01-13', distance: 3.8, duration: '21:45', pace: '5:43', location: '世纪公园' },
    { date: '2024-01-11', distance: 7.1, duration: '39:20', pace: '5:32', location: '黄浦江滨江' },
  ];

  const todayGoal = {
    target: 5,
    completed: 0,
    percentage: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* 欢迎区域 */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 lg:p-8 text-white mb-6 lg:mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-xl lg:text-2xl font-bold mb-2">欢迎回来！</h1>
              <p className="text-blue-100 text-sm lg:text-base">准备好开始今天的跑步了吗？</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 lg:p-6 min-w-0 lg:min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-100">今日目标</span>
                <Target className="h-4 w-4 text-blue-200" />
              </div>
              <div className="text-lg lg:text-xl font-bold">{todayGoal.completed}/{todayGoal.target} km</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${todayGoal.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs lg:text-sm text-gray-600 mb-1 truncate">{stat.label}</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">
                      {stat.value}
                      <span className="text-xs lg:text-sm text-gray-500 ml-1">{stat.unit}</span>
                    </p>
                  </div>
                  <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${stat.color} flex-shrink-0 ml-2`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 快捷操作 */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">快捷操作</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className={`${action.color} rounded-lg lg:rounded-xl p-4 lg:p-6 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  <Icon className="h-6 w-6 lg:h-8 lg:w-8 mb-2 lg:mb-3" />
                  <p className="font-medium text-sm lg:text-base">{action.name}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 最近跑步记录 */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">最近跑步记录</h2>
              <Link to="/stats" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                查看全部
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRuns.map((run, index) => (
              <div key={index} className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm lg:text-base">{run.date}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{run.location}</span>
                        </div>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-500">距离: {run.distance} km</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-medium text-gray-900 text-sm lg:text-base">{run.duration}</p>
                    <p className="text-xs lg:text-sm text-gray-500">配速: {run.pace}/km</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {recentRuns.length === 0 && (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有跑步记录</p>
              <Link 
                to="/run" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Activity className="h-4 w-4 mr-2" />
                开始第一次跑步
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;