import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, MapPin, Clock, Activity, Zap, Navigation, Heart } from 'lucide-react';
import Map from '../components/Map';
import { useGPS } from '../hooks/useGPS';
import { useRunStore } from '../store';
import { formatDistance, formatDuration, formatPace, calculateCalories } from '../utils/format';

const Run: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const { 
    currentPosition, 
    positions, 
    isTracking, 
    error, 
    accuracy,
    startTracking, 
    stopTracking, 
    clearPositions,
    getDistance,
    getAverageSpeed,
    getDuration 
  } = useGPS({
    enableHighAccuracy: true,
    trackingInterval: 1000
  });

  const { setCurrentRun, addRun } = useRunStore();

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime - pausedTime);
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused, startTime, pausedTime]);

  // 开始跑步
  const handleStart = () => {
    if (!isRunning) {
      // 全新开始
      setStartTime(Date.now());
      setElapsedTime(0);
      setPausedTime(0);
      clearPositions();
      startTracking();
    } else if (isPaused) {
      // 从暂停恢复
      setPausedTime(prev => prev + (Date.now() - (startTime || 0) - elapsedTime));
    }
    
    setIsRunning(true);
    setIsPaused(false);
  };

  // 暂停跑步
  const handlePause = () => {
    setIsPaused(true);
  };

  // 停止跑步
  const handleStop = () => {
    if (isRunning && positions.length > 0) {
      // 保存跑步记录
      const runData = {
        id: Date.now().toString(),
        user_id: 'current-user', // 实际应用中从认证状态获取
        userId: 'current-user', // 兼容字段
        distance: getDistance(),
        duration: elapsedTime,
        average_pace: elapsedTime / (getDistance() / 1000), // 计算平均配速
        averageSpeed: getAverageSpeed(),
        route_data: {
          coordinates: positions.map(pos => [pos.lng, pos.lat] as [number, number]),
          start_location: positions.length > 0 ? [positions[0].lng, positions[0].lat] as [number, number] : undefined,
          end_location: positions.length > 0 ? [positions[positions.length - 1].lng, positions[positions.length - 1].lat] as [number, number] : undefined,
        },
        route: positions.map(pos => [pos.lng, pos.lat]),
        startTime: startTime || Date.now(),
        endTime: Date.now(),
        calories: calculateCalories(getDistance() / 1000, elapsedTime / 1000 / 60, 70), // 假设体重70kg
        status: 'completed' as const,
        created_at: new Date().toISOString()
      };

      addRun(runData);
    }

    // 重置状态
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setPausedTime(0);
    setEndTime(new Date());
    stopTracking();
    clearPositions();
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setPausedTime(0);
    setEndTime(null);
    clearPositions();
  };

  // 获取当前统计数据
  const distance = getDistance() / 1000; // 转换为公里
  const duration = elapsedTime / 1000; // 转换为秒
  const pace = distance > 0 ? duration / distance / 60 : 0; // 分钟/公里
  const calories = calculateCalories(distance, duration / 60, 70); // 假设体重70kg

  // 准备地图路线数据
  const routeData = positions.map(pos => [pos.lng, pos.lat] as [number, number]);

  const stats = [
    { 
      label: '时长', 
      value: formatDuration(duration), 
      icon: Clock, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      label: '距离', 
      value: formatDistance(distance * 1000), 
      icon: MapPin, 
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    { 
      label: '配速', 
      value: formatPace(pace), 
      icon: Activity, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    { 
      label: '卡路里', 
      value: Math.round(calories).toString(), 
      icon: Zap, 
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* 状态指示器 */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium text-gray-900">
                {isTracking ? 'GPS已连接' : 'GPS未连接'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Navigation className="h-4 w-4" />
              <span>{positions.length} 个位置点</span>
            </div>
          </div>
        </div>

        {/* 地图区域 */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm mb-4 lg:mb-6 overflow-hidden">
          <div className="h-48 sm:h-64 lg:h-96">
            <Map 
              height="100%"
              showCurrentLocation={true}
              route={routeData}
              onLocationUpdate={(location) => {
                console.log('位置更新:', location);
              }}
            />
          </div>
        </div>

        {/* 运动数据 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} rounded-lg lg:rounded-xl p-4 lg:p-6 text-center border border-opacity-20`}>
                <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${stat.color} mx-auto mb-2 lg:mb-3`} />
                <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* 额外信息卡片 */}
        {isRunning && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Heart className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">平均心率</p>
                    <p className="text-lg font-bold text-gray-900">-- bpm</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">步频</p>
                    <p className="text-lg font-bold text-gray-900">-- spm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={!currentPosition}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Play className="h-5 w-5 mr-2" />
                开始跑步
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handlePause}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-medium ${
                    isPaused
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      继续
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      暂停
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleStop}
                  className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Square className="h-5 w-5 mr-2" />
                  结束
                </button>
              </div>
            )}
            
            {(endTime || (!isRunning && (distance > 0 || duration > 0))) && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                重置
              </button>
            )}
          </div>
        </div>

        {/* 状态提示 */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
              <p className="ml-3 text-sm text-red-800">GPS错误: {error}</p>
            </div>
          </div>
        )}
        
        {!currentPosition && !error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              </div>
              <p className="ml-3 text-sm text-yellow-800">正在获取GPS位置...</p>
            </div>
          </div>
        )}

        {/* 跑步完成后的总结 */}
        {endTime && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">跑步完成！</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{formatDuration(duration)}</p>
                <p className="text-sm text-gray-600">总时长</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{formatDistance(distance * 1000)}</p>
                <p className="text-sm text-gray-600">总距离</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{formatPace(pace)}</p>
                <p className="text-sm text-gray-600">平均配速</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{Math.round(calories)}</p>
                <p className="text-sm text-gray-600">消耗卡路里</p>
              </div>
            </div>
          </div>
        )}

        {/* 实时数据 */}
        {isRunning && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">实时数据</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">平均速度:</span>
                <span className="ml-2 font-medium">{getAverageSpeed().toFixed(1)} km/h</span>
              </div>
              <div>
                <span className="text-gray-500">记录点数:</span>
                <span className="ml-2 font-medium">{positions.length}</span>
              </div>
              {currentPosition && (
                <div>
                  <span className="text-gray-500">当前速度:</span>
                  <span className="ml-2 font-medium">
                    {currentPosition.speed ? (currentPosition.speed * 3.6).toFixed(1) : '0.0'} km/h
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Run;