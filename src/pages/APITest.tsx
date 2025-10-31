// API密钥测试页面
import React, { useEffect, useState } from 'react';

interface APIStatus {
  kimi: {
    configured: boolean;
    key: string;
  };
  deepseek: {
    configured: boolean;
    key: string;
  };
}

const APITest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    kimi: { configured: false, key: '' },
    deepseek: { configured: false, key: '' }
  });

  useEffect(() => {
    // 检查环境变量
    const kimiKey = import.meta.env.VITE_KIMI_API_KEY || '';
    const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

    setApiStatus({
      kimi: {
        configured: !!kimiKey,
        key: kimiKey ? `${kimiKey.substring(0, 10)}...` : '未配置'
      },
      deepseek: {
        configured: !!deepseekKey,
        key: deepseekKey ? `${deepseekKey.substring(0, 10)}...` : '未配置'
      }
    });
  }, []);

  const testKimiConnection = async () => {
    try {
      const response = await fetch('https://api.moonshot.cn/v1/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_KIMI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('KIMI API连接成功！');
      } else {
        alert(`KIMI API连接失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`KIMI API连接错误: ${error}`);
    }
  };

  const testDeepSeekConnection = async () => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('DeepSeek API连接成功！');
      } else {
        alert(`DeepSeek API连接失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`DeepSeek API连接错误: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API密钥测试</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KIMI API状态 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${apiStatus.kimi.configured ? 'bg-green-500' : 'bg-red-500'}`}></span>
              KIMI API
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">状态:</span>
                <span className={`ml-2 font-medium ${apiStatus.kimi.configured ? 'text-green-600' : 'text-red-600'}`}>
                  {apiStatus.kimi.configured ? '已配置' : '未配置'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">密钥:</span>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {apiStatus.kimi.key}
                </div>
              </div>
              <button
                onClick={testKimiConnection}
                disabled={!apiStatus.kimi.configured}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  apiStatus.kimi.configured
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                测试连接
              </button>
            </div>
          </div>

          {/* DeepSeek API状态 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${apiStatus.deepseek.configured ? 'bg-green-500' : 'bg-red-500'}`}></span>
              DeepSeek API
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">状态:</span>
                <span className={`ml-2 font-medium ${apiStatus.deepseek.configured ? 'text-green-600' : 'text-red-600'}`}>
                  {apiStatus.deepseek.configured ? '已配置' : '未配置'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">密钥:</span>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {apiStatus.deepseek.key}
                </div>
              </div>
              <button
                onClick={testDeepSeekConnection}
                disabled={!apiStatus.deepseek.configured}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  apiStatus.deepseek.configured
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                测试连接
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">环境变量信息</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">VITE_KIMI_API_KEY:</span>
              <span className="ml-2 font-mono">
                {import.meta.env.VITE_KIMI_API_KEY ? '已设置' : '未设置'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">VITE_DEEPSEEK_API_KEY:</span>
              <span className="ml-2 font-mono">
                {import.meta.env.VITE_DEEPSEEK_API_KEY ? '已设置' : '未设置'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/ai/chat"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            前往AI聊天页面测试
          </a>
        </div>
      </div>
    </div>
  );
};

export default APITest;