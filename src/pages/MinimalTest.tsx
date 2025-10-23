import React, { useState } from 'react';

const MinimalTest: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>最简单的 React 测试</h1>
      <p>计数器: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  );
};

export default MinimalTest;