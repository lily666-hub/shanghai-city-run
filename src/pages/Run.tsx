import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, MapPin, Clock, Activity, Zap, Navigation, Heart, AlertCircle, CheckCircle } from 'lucide-react';
// import Map from '../components/Map';
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
    isGPSReady,
    error,
    accuracy,
    permissionStatus,
    connectionAttempts,
    startTracking,
    stopTracking,
    clearPositions,
    getDistance,
    getAverageSpeed,
    getDuration,
    initializeGPS,
    requestPermission,
    retryConnection
  } = useGPS({ autoInitialize: true });

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
    if (!isGPSReady) return;
    
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    setIsPaused(false);
    setEndTime(null);
    setElapsedTime(0);
    setPausedTime(0);
    
    startTracking();
    
    setCurrentRun({
      id: Date.now().toString(),
      user_id: 'default-user', // 添加必需的字段
      startTime: now,
      distance: 0,
      duration: 0,
      calories: 0,
      route: [],
      route_data: { coordinates: [] }, // 修复类型
      average_pace: 0, // 添加必需的字段
      created_at: new Date().toISOString(), // 添加必需的字段
      status: 'idle' // 修复状态值
    });
  };

  // 暂停/继续跑步
  const handlePause = () => {
    if (isPaused) {
      // 继续跑步
      const now = Date.now();
      setPausedTime(prev => prev + (now - (startTime || 0) - elapsedTime));
      setIsPaused(false);
      startTracking();
    } else {
      // 暂停跑步
      setIsPaused(true);
      stopTracking();
    }
  };

  // 停止跑步
  const handleStop = () => {
    if (!startTime) return;
    
    const now = new Date();
    setEndTime(now);
    setIsRunning(false);
    setIsPaused(false);
    stopTracking();
    
    // 保存跑步记录
    const finalDistance = getDistance() / 1000; // 转换为公里
    const finalDuration = elapsedTime / 1000; // 转换为秒
    const finalPace = finalDistance > 0 ? finalDuration / finalDistance / 60 : 0; // 分钟/公里
    const finalCalories = calculateCalories(finalDistance, finalDuration, 70); // 假设体重70kg
    
    const runData = {
      id: Date.now().toString(),
      user_id: 'temp-user', // 临时用户ID
      route_data: {
        coordinates: positions.map(pos => [pos.lng, pos.lat] as [number, number])
      },
      distance: finalDistance,
      duration: finalDuration,
      average_pace: finalPace,
      calories: finalCalories,
      startTime: startTime,
      endTime: now.getTime(),
      status: 'completed' as const,
      created_at: new Date().toISOString()
    };
    
    addRun(runData);
    setCurrentRun(null);
  };

  // 重置
  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setPausedTime(0);
    setEndTime(null);
    clearPositions();
    setCurrentRun(null);
  };

  // 计算实时数据
  const distance = getDistance() / 1000; // 公里
  const duration = elapsedTime / 1000; // 秒
  const pace = distance > 0 ? duration / distance / 60 : 0; // 分钟/公里
  const calories = calculateCalories(distance, duration, 70); // 假设体重70kg

  // 统计数据
  const stats = [
    { 
      label: '时间', 
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

  // GPS状态显示组件
  const renderGPSStatus = () => {
    if (error) {
      return (
        <div className="gps-status error bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="status-icon">⚠️</div>
            <div className="flex-1">
              <div className="status-title font-medium text-red-800">GPS连接失败</div>
              <div className="status-detail text-sm text-red-600 mt-1">{error}</div>
              {connectionAttempts > 0 && (
                <div className="status-attempts text-xs text-red-500 mt-1">尝试次数: {connectionAttempts}/5</div>
              )}
              <div className="status-actions mt-3 space-x-2">
                {permissionStatus === 'denied' ? (
                  <button 
                    className="retry-btn permission-btn px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    onClick={() => {
                      alert('请在浏览器地址栏左侧点击位置图标，选择"允许"，然后刷新页面。');
                    }}
                  >
                    设置权限
                  </button>
                ) : (
                  <button 
                    className="retry-btn px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" 
                    onClick={retryConnection}
                  >
                    重试连接
                  </button>
                )}
                <button 
                  className="retry-btn px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" 
                  onClick={requestPermission}
                >
                  请求权限
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!isGPSReady) {
      return (
        <div className="gps-status connecting bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="status-icon">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
            </div>
            <div className="flex-1">
              <div className="status-title font-medium text-yellow-800">正在连接GPS...</div>
              <div className="status-detail text-sm text-yellow-600 mt-1">
                {permissionStatus === 'prompt' && '等待位置权限确认'}
                {permissionStatus === 'granted' && '正在获取位置信息'}
                {!permissionStatus && '初始化GPS定位'}
              </div>
              {connectionAttempts > 0 && (
                <div className="status-attempts text-xs text-yellow-500 mt-1">重试次数: {connectionAttempts}</div>
              )}
              <div className="status-actions mt-3">
                <button 
                  className="retry-btn px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700" 
                  onClick={initializeGPS}
                >
                  重新初始化
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="gps-status ready bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="status-icon">✅</div>
          <div className="flex-1">
            <div className="status-title font-medium text-green-800">GPS已连接</div>
            <div className="status-detail text-sm text-green-600 mt-1">
              精度: {accuracy ? `${Math.round(accuracy)}米` : '未知'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="header mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">上海跑市</h1>
        </div>

        {/* GPS状态显示 */}
        {renderGPSStatus()}

        {/* 地图区域 */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm mb-4 lg:mb-6 overflow-hidden">
          <div className="h-48 sm:h-64 lg:h-96 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-600">
              <div className="text-lg font-medium mb-2">地图功能</div>
              <div className="text-sm">地图组件暂时禁用以确保路由正常工作</div>
              {currentPosition && (
                <div className="text-xs mt-2 text-gray-500">
                  当前位置: {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
                </div>
              )}
            </div>
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

        {/* 控制按钮 */}
        <div className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={!isGPSReady}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Play className="h-5 w-5 mr-2" />
                {isGPSReady ? '开始跑步' : '等待GPS连接...'}
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