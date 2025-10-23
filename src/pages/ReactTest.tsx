import React, { useState } from 'react';

function ReactTest() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">React 测试页面</h1>
        <p className="text-gray-600 mb-8">测试React hooks是否正常工作</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-semibold text-blue-600">
            计数: {count}
          </div>
          
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            增加计数
          </button>
          
          <button
            onClick={() => setCount(0)}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors ml-4"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReactTest;