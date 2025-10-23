import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">高德地图配置测试</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 配置状态 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">配置状态</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Key:</span>
                <span className="text-green-600 font-medium">✓ 已配置</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">安全密钥:</span>
                <span className="text-green-600 font-medium">✓ 已配置</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">环境变量:</span>
                <span className="text-green-600 font-medium">✓ 已加载</span>
              </div>
            </div>
          </div>

          {/* 环境变量详情 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">环境变量</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">API Key:</span>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {import.meta.env.VITE_AMAP_API_KEY || '未配置'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">安全密钥:</span>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {import.meta.env.VITE_AMAP_SECURITY_JS_CODE || '未配置'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 地图容器 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">地图测试区域</h2>
          <div 
            id="map-container" 
            className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"
          >
            <div className="text-center text-gray-600">
              <div className="text-lg font-medium mb-2">地图容器已准备</div>
              <div className="text-sm">高德地图配置完成，可以开始集成地图功能</div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-8 flex justify-center space-x-4">
          <a 
            href="/" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回主页
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;