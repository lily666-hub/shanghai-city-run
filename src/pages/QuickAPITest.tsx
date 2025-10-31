// 快速API测试页面
import React, { useEffect, useState } from 'react';

const QuickAPITest: React.FC = () => {
  const [envStatus, setEnvStatus] = useState({
    kimi: '',
    deepseek: '',
    loaded: false
  });

  useEffect(() => {
    // 检查环境变量
    const kimiKey = import.meta.env.VITE_KIMI_API_KEY;
    const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    console.log('KIMI API Key:', kimiKey ? `${kimiKey.substring(0, 10)}...` : '未配置');
    console.log('DeepSeek API Key:', deepseekKey ? `${deepseekKey.substring(0, 10)}...` : '未配置');
    
    setEnvStatus({
      kimi: kimiKey || '未配置',
      deepseek: deepseekKey || '未配置',
      loaded: true
    });
  }, []);

  const testKimiAPI = async () => {
    try {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_KIMI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'user',
              content: '你好，这是一个测试消息'
            }
          ],
          max_tokens: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`KIMI API测试成功！响应: ${data.choices[0].message.content}`);
      } else {
        const errorData = await response.text();
        alert(`KIMI API测试失败: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      alert(`KIMI API测试错误: ${error}`);
    }
  };

  const testDeepSeekAPI = async () => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: '你好，这是一个测试消息'
            }
          ],
          max_tokens: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`DeepSeek API测试成功！响应: ${data.choices[0].message.content}`);
      } else {
        const errorData = await response.text();
        alert(`DeepSeek API测试失败: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      alert(`DeepSeek API测试错误: ${error}`);
    }
  };

  if (!envStatus.loaded) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">快速API测试</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">环境变量状态</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">KIMI API Key:</span>
              <span className="ml-2 font-mono text-sm">
                {envStatus.kimi !== '未配置' ? `${envStatus.kimi.substring(0, 10)}...` : '未配置'}
              </span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                envStatus.kimi !== '未配置' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {envStatus.kimi !== '未配置' ? '已配置' : '未配置'}
              </span>
            </div>
            <div>
              <span className="font-medium">DeepSeek API Key:</span>
              <span className="ml-2 font-mono text-sm">
                {envStatus.deepseek !== '未配置' ? `${envStatus.deepseek.substring(0, 10)}...` : '未配置'}
              </span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                envStatus.deepseek !== '未配置' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {envStatus.deepseek !== '未配置' ? '已配置' : '未配置'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testKimiAPI}
            disabled={envStatus.kimi === '未配置'}
            className={`p-4 rounded-lg font-medium ${
              envStatus.kimi !== '未配置'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            测试 KIMI API
          </button>
          
          <button
            onClick={testDeepSeekAPI}
            disabled={envStatus.deepseek === '未配置'}
            className={`p-4 rounded-lg font-medium ${
              envStatus.deepseek !== '未配置'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            测试 DeepSeek API
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/ai/chat"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            前往AI聊天页面
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickAPITest;