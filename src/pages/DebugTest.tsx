import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { aiService } from '../services/ai';
import { useAuthStore } from '../store/authStore';

const DebugTest: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('未测试');
  const [aiStatus, setAiStatus] = useState<string>('未测试');
  const [conversationStatus, setConversationStatus] = useState<string>('未测试');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const testSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        setSupabaseStatus(`❌ 失败: ${error.message}`);
      } else {
        setSupabaseStatus('✅ 连接成功');
      }
    } catch (error) {
      setSupabaseStatus(`❌ 错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAI = async () => {
    try {
      setLoading(true);
      const connections = await aiService.testConnections();
      const kimiStatus = connections.kimi ? '✅' : '❌';
      const deepseekStatus = connections.deepseek ? '✅' : '❌';
      setAiStatus(`KIMI: ${kimiStatus} | DeepSeek: ${deepseekStatus}`);
    } catch (error) {
      setAiStatus(`❌ 错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateConversation = async () => {
    if (!user) {
      setConversationStatus('❌ 用户未登录');
      return;
    }

    try {
      setLoading(true);
      const conversation = await aiService.createConversation(user.id, {
        title: '测试对话',
        provider: 'kimi',
        conversationType: 'general'
      });
      setConversationStatus(`✅ 创建成功: ${conversation.id}`);
    } catch (error) {
      setConversationStatus(`❌ 创建失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">系统调试测试</h1>
        
        <div className="space-y-6">
          {/* 用户状态 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">用户状态</h2>
            <p className="text-gray-600">
              {user ? `✅ 已登录: ${user.name} (${user.id})` : '❌ 未登录'}
            </p>
          </div>

          {/* Supabase测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Supabase 数据库连接</h2>
            <p className="text-gray-600 mb-4">状态: {supabaseStatus}</p>
            <button
              onClick={testSupabase}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试 Supabase 连接'}
            </button>
          </div>

          {/* AI API测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">AI API 连接</h2>
            <p className="text-gray-600 mb-4">状态: {aiStatus}</p>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-500">
                KIMI API Key: {import.meta.env.VITE_KIMI_API_KEY ? 
                  `${import.meta.env.VITE_KIMI_API_KEY.substring(0, 10)}...` : '未配置'}
              </p>
              <p className="text-sm text-gray-500">
                DeepSeek API Key: {import.meta.env.VITE_DEEPSEEK_API_KEY ? 
                  `${import.meta.env.VITE_DEEPSEEK_API_KEY.substring(0, 10)}...` : '未配置'}
              </p>
            </div>
            <button
              onClick={testAI}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试 AI 连接'}
            </button>
          </div>

          {/* 对话创建测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">对话创建测试</h2>
            <p className="text-gray-600 mb-4">状态: {conversationStatus}</p>
            <button
              onClick={testCreateConversation}
              disabled={loading || !user}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试创建对话'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugTest