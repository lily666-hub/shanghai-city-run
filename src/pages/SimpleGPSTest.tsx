import React, { useState, useEffect } from 'react';

const SimpleGPSTest: React.FC = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testGPS = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('浏览器不支持GPS定位');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setLoading(false);
      },
      (err) => {
        setError(`GPS错误: ${err.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">简单GPS测试</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">GPS状态测试</h2>
          
          <button
            onClick={testGPS}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '获取GPS位置中...' : '测试GPS定位'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {position && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-semibold mb-2">GPS定位成功！</h3>
              <p>纬度: {position.coords.latitude}</p>
              <p>经度: {position.coords.longitude}</p>
              <p>精度: {position.coords.accuracy} 米</p>
              <p>时间: {new Date(position.timestamp).toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">浏览器支持检查</h2>
          <div className="space-y-2">
            <p>GPS支持: {navigator.geolocation ? '✅ 支持' : '❌ 不支持'}</p>
            <p>HTTPS: {location.protocol === 'https:' ? '✅ 安全连接' : '⚠️ 非安全连接'}</p>
            <p>用户代理: {navigator.userAgent}</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            返回主页
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimpleGPSTest;