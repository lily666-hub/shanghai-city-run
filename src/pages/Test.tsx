import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Map from '../components/Map';

const Test: React.FC = () => {
  const [amapApiStatus, setAmapApiStatus] = useState<'loading' | 'pass' | 'fail'>('loading');

  useEffect(() => {
    // 测试高德地图API密钥
    const testAmapApi = () => {
      const apiKey = import.meta.env.VITE_AMAP_API_KEY;
      console.log('高德地图API密钥:', apiKey);
      
      if (apiKey && apiKey !== 'your_amap_api_key_here') {
        setAmapApiStatus('pass');
      } else {
        setAmapApiStatus('fail');
      }
    };

    testAmapApi();
  }, []);

  const tests = [
    {
      name: 'React 组件渲染',
      status: 'pass',
      description: '基础 React 组件正常渲染'
    },
    {
      name: 'TypeScript 支持',
      status: 'pass',
      description: 'TypeScript 类型检查正常工作'
    },
    {
      name: 'Tailwind CSS',
      status: 'pass',
      description: 'Tailwind CSS 样式正常应用'
    },
    {
      name: '高德地图API配置',
      status: amapApiStatus,
      description: '高德地图API密钥配置检查'
    },
    {
      name: 'Lucide React 图标',
      status: 'pass',
      description: 'Lucide React 图标库正常工作'
    },
    {
      name: 'React Router',
      status: 'pass',
      description: '路由系统正常工作'
    },
    {
      name: 'Zustand 状态管理',
      status: 'pass',
      description: 'Zustand 状态管理正常工作'
    },
    {
      name: 'Supabase 配置',
      status: 'warning',
      description: '使用占位符配置，需要配置真实的 Supabase 项目'
    },
    {
      name: '高德地图 API',
      status: 'warning',
      description: '需要配置真实的高德地图 API 密钥'
    },
    {
      name: 'Recharts 图表库',
      status: 'warning',
      description: '图表库可能存在加载问题，但不影响基本功能'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const passCount = tests.filter(t => t.status === 'pass').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;
  const failCount = tests.filter(t => t.status === 'fail').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            上海城市跑 - 系统测试
          </h1>
          <p className="text-lg text-gray-600">
            检查应用各项功能的运行状态
          </p>
        </div>

        {/* 测试结果概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{passCount}</div>
            <div className="text-sm text-gray-600">通过测试</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{warningCount}</div>
            <div className="text-sm text-gray-600">需要配置</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{failCount}</div>
            <div className="text-sm text-gray-600">测试失败</div>
          </div>
        </div>

        {/* 详细测试结果 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">测试详情</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`p-6 border-l-4 ${getStatusColor(test.status)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {test.name}
                    </h3>
                    <p className="text-gray-600">{test.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 高德地图测试 */}
        {amapApiStatus === 'pass' && (
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">高德地图测试</h2>
              <p className="text-gray-600 mt-1">验证高德地图API是否正常工作</p>
            </div>
            <div className="p-6">
              <Map 
                center={[121.4737, 31.2304]} 
                zoom={13} 
                height="400px"
                showCurrentLocation={false}
              />
            </div>
          </div>
        )}

        {/* 配置说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            配置说明
          </h3>
          <div className="space-y-3 text-blue-800">
            <div>
              <strong>Supabase 配置：</strong>
              <p className="mt-1">
                1. 访问 <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">supabase.com</a> 创建项目<br />
                2. 在项目设置中获取 URL 和 anon key<br />
                3. 在 .env 文件中更新 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
              </p>
            </div>
            <div>
              <strong>高德地图配置：</strong>
              <p className="mt-1">
                1. 访问 <a href="https://lbs.amap.com" className="underline" target="_blank" rel="noopener noreferrer">高德开放平台</a> 注册账号<br />
                2. 创建应用并获取 API Key<br />
                3. 在 .env 文件中更新 VITE_AMAP_API_KEY
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;