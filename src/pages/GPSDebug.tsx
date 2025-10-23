import React, { useState, useEffect } from 'react';
import { useGPS } from '../hooks/useGPS';
import { MapPin, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

const GPSDebug: React.FC = () => {
  const {
    currentPosition,
    isGPSReady,
    error,
    accuracy,
    permissionStatus,
    connectionAttempts,
    initializeGPS,
    requestPermission,
    retryConnection
  } = useGPS({ autoInitialize: true });

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // 收集调试信息
    const info = {
      userAgent: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      geolocationSupported: 'geolocation' in navigator,
      permissionsSupported: 'permissions' in navigator,
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
  }, []);

  const runGPSTest = async () => {
    const testResult = {
      timestamp: new Date().toISOString(),
      test: 'GPS连接测试',
      status: 'running',
      details: {}
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
          }
        );
      });

      testResult.status = 'success';
      testResult.details = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (err: any) {
      testResult.status = 'error';
      testResult.details = {
        error: err.message,
        code: err.code
      };
    }

    setTestResults(prev => [testResult, ...prev.slice(0, 4)]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'text-green-600 bg-green-50';
      case 'denied': return 'text-red-600 bg-red-50';
      case 'prompt': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getErrorMessage = (error: any) => {
    if (!error) return null;
    
    const errorMessages: { [key: number]: string } = {
      1: '用户拒绝了位置权限请求',
      2: '位置信息不可用',
      3: '获取位置信息超时'
    };

    return errorMessages[error.code] || error.message || '未知错误';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-500" />
              GPS调试工具
            </h1>
            <p className="text-gray-600 mt-1">诊断和测试GPS连接问题</p>
          </div>

          {/* 当前状态 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">当前GPS状态</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">连接状态</span>
                  {isGPSReady ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="font-semibold mt-1">
                  {isGPSReady ? '已连接' : '未连接'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">权限状态</span>
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <p className={`font-semibold mt-1 px-2 py-1 rounded text-xs ${getStatusColor(permissionStatus)}`}>
                  {permissionStatus || '未知'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">精度</span>
                  <Wifi className="w-5 h-5 text-blue-500" />
                </div>
                <p className="font-semibold mt-1">
                  {accuracy ? `${Math.round(accuracy)}米` : '未知'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">尝试次数</span>
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                </div>
                <p className="font-semibold mt-1">{connectionAttempts}</p>
              </div>
            </div>

            {/* 位置信息 */}
            {currentPosition && (
              <div className="mt-4 bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">当前位置</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600">纬度:</span>
                    <span className="ml-2 font-mono">{currentPosition.lat.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-green-600">经度:</span>
                    <span className="ml-2 font-mono">{currentPosition.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="mt-4 bg-red-50 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-semibold text-red-800">错误信息</h3>
                    <p className="text-red-700 mt-1">{getErrorMessage(error)}</p>
                    {error && typeof error === 'object' && 'code' in (error as object) && (
                      <p className="text-red-600 text-sm mt-1">错误代码: {(error as any).code}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 系统信息 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">系统信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">HTTPS支持</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    debugInfo.isSecureContext ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {debugInfo.isSecureContext ? '是' : '否'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">协议</span>
                  <span className="font-mono text-sm">{debugInfo.protocol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">地理定位API</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    debugInfo.geolocationSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {debugInfo.geolocationSupported ? '支持' : '不支持'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">权限API</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    debugInfo.permissionsSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {debugInfo.permissionsSupported ? '支持' : '不支持'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-2">用户代理</div>
                <div className="bg-gray-50 rounded p-3 text-xs font-mono break-all">
                  {debugInfo.userAgent}
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">操作</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={initializeGPS}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新初始化GPS
              </button>
              
              <button
                onClick={requestPermission}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Shield className="w-4 h-4 mr-2" />
                请求权限
              </button>
              
              <button
                onClick={retryConnection}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Wifi className="w-4 h-4 mr-2" />
                重试连接
              </button>
              
              <button
                onClick={runGPSTest}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Clock className="w-4 h-4 mr-2" />
                运行测试
              </button>
            </div>
          </div>

          {/* 测试结果 */}
          {testResults.length > 0 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">测试结果</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{result.test}</span>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.status === 'success' ? 'bg-green-100 text-green-800' :
                          result.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.status === 'success' ? '成功' : 
                           result.status === 'error' ? '失败' : '运行中'}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-sm font-mono">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 故障排除指南 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">故障排除指南</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-800">GPS无法连接</h3>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• 确保网站使用HTTPS协议</li>
                  <li>• 检查浏览器是否允许位置权限</li>
                  <li>• 确认设备GPS功能已开启</li>
                  <li>• 尝试在室外或窗边使用</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-yellow-800">精度较低</h3>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• 移动到开阔区域</li>
                  <li>• 等待更长时间让GPS稳定</li>
                  <li>• 检查设备GPS设置</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-800">权限被拒绝</h3>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• 点击地址栏的位置图标重新授权</li>
                  <li>• 清除浏览器缓存和Cookie</li>
                  <li>• 检查浏览器隐私设置</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSDebug;