// KIMI API测试页面
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const KimiTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testKimiAPI = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const apiKey = import.meta.env.VITE_KIMI_API_KEY;
      
      if (!apiKey) {
        throw new Error('KIMI API密钥未配置');
      }

      console.log('开始测试KIMI API...');
      console.log('API密钥:', apiKey.substring(0, 10) + '...');

      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'user',
              content: '你好，这是一个测试消息，请简单回复。'
            }
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      console.log('API响应状态:', response.status);
      console.log('API响应头:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误响应:', errorText);
        throw new Error(`KIMI API请求失败: ${response.status} ${response.statusText}\n详细信息: ${errorText}`);
      }

      const data = await response.json();
      console.log('API响应数据:', data);

      const aiMessage = data.choices[0]?.message?.content || '无响应内容';
      setResult(`测试成功！AI回复: ${aiMessage}`);
      
    } catch (error) {
      console.error('KIMI API测试失败:', error);
      setError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const apiKey = import.meta.env.VITE_KIMI_API_KEY;
      
      if (!apiKey) {
        throw new Error('KIMI API密钥未配置');
      }

      console.log('测试KIMI API连接...');

      const response = await fetch('https://api.moonshot.cn/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      console.log('连接测试响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('连接测试错误:', errorText);
        throw new Error(`连接测试失败: ${response.status} ${response.statusText}\n详细信息: ${errorText}`);
      }

      const data = await response.json();
      console.log('可用模型:', data);
      setResult(`连接成功！可用模型数量: ${data.data?.length || 0}`);
      
    } catch (error) {
      console.error('连接测试失败:', error);
      setError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">KIMI API 测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API配置信息</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API密钥:</strong> {import.meta.env.VITE_KIMI_API_KEY ? `${import.meta.env.VITE_KIMI_API_KEY.substring(0, 10)}...` : '未配置'}</p>
            <p><strong>API端点:</strong> https://api.moonshot.cn/v1</p>
            <p><strong>模型:</strong> moonshot-v1-8k</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            测试API连接
          </button>
          
          <button
            onClick={testKimiAPI}
            disabled={isLoading}
            className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            测试消息发送
          </button>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">测试成功</span>
            </div>
            <p className="mt-2 text-green-600">{result}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">测试失败</span>
            </div>
            <pre className="mt-2 text-red-600 text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        <div className="text-center">
          <a
            href="/ai/chat"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 transition-colors"
          >
            返回AI聊天页面
          </a>
        </div>
      </div>
    </div>
  );
};

export default KimiTest;