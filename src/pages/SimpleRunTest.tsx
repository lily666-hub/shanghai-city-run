import React from 'react';

function SimpleRunTest() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple Run Test</h1>
        <p className="text-gray-600 mb-8">
          这是一个简单的跑步测试页面。
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

export default SimpleRunTest;