import React, { useState, useEffect } from 'react';

const ReactHookTest: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('React Hooks 测试页面');

  useEffect(() => {
    console.log('✅ useEffect 正常工作');
    setMessage('React Hooks 工作正常！');
  }, []);

  const handleClick = () => {
    setCount(prev => prev + 1);
    console.log('✅ useState 正常工作，count:', count + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          React Hooks 测试
        </h1>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-2">{message}</p>
            <p className="text-sm text-gray-500">
              如果你能看到这个页面，说明React基本功能正常
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-600 mb-4">
              计数器: {count}
            </p>
            <button
              onClick={handleClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              点击增加
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">测试项目:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ React 组件渲染</li>
              <li>✅ useState Hook</li>
              <li>✅ useEffect Hook</li>
              <li>✅ 事件处理</li>
              <li>✅ CSS 样式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactHookTest;