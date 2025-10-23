import React from 'react';
import { useGPS } from '../hooks/useGPS';
import { Navigation, AlertCircle, CheckCircle } from 'lucide-react';

const FixedGPSTest: React.FC = () => {
  const {
    currentPosition,
    isGPSReady,
    error,
    accuracy,
    initializeGPS
  } = useGPS({
    enableHighAccuracy: true,
    autoInitialize: true
  });

  const getGPSStatus = () => {
    if (error) {
      return {
        status: 'error',
        message: error,
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    
    if (isGPSReady && currentPosition) {
      return {
        status: 'ready',
        message: `GPS已连接 (精度: ${accuracy ? Math.round(accuracy) : '--'}m)`,
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    
    return {
      status: 'loading',
      message: '正在获取GPS位置...',
      icon: Navigation,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    };
  };

  const gpsStatus = getGPSStatus();
  const StatusIcon = gpsStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">修复后的 GPS 测试</h1>
        
        {/* GPS状态指示器 */}
        <div className={`flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border ${gpsStatus.borderColor} mb-4`}>
          <div className="flex items-center space-x-3">
            <div className={`${gpsStatus.status === 'loading' ? 'animate-pulse' : ''}`}>
              <StatusIcon className={`w-5 h-5 ${gpsStatus.color}`} />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {gpsStatus.message}
            </span>
          </div>
        </div>

        {/* GPS 详细信息 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">GPS 详细信息</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">GPS 就绪状态:</span> {isGPSReady ? '是' : '否'}
            </div>
            <div>
              <span className="font-medium">当前位置:</span> {currentPosition ? '已获取' : '未获取'}
            </div>
            {currentPosition && (
              <>
                <div>
                  <span className="font-medium">纬度:</span> {currentPosition.lat.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">经度:</span> {currentPosition.lng.toFixed(6)}
                </div>
              </>
            )}
            <div>
              <span className="font-medium">精度:</span> {accuracy ? `${Math.round(accuracy)}m` : '--'}
            </div>
            {error && (
              <div>
                <span className="font-medium text-red-500">错误:</span> {error}
              </div>
            )}
          </div>
        </div>

        {/* 手动初始化按钮 */}
        <button
          onClick={initializeGPS}
          className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          手动初始化 GPS
        </button>
      </div>
    </div>
  );
};

export default FixedGPSTest;