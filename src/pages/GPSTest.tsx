import React, { useEffect, useState } from 'react';

const GPSTest: React.FC = () => {
  const [status, setStatus] = useState<string>('初始化中...');
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('GPS测试页面加载');
    
    // 检查GPS支持
    if (!('geolocation' in navigator)) {
      setStatus('设备不支持GPS定位');
      setError('您的设备不支持GPS定位功能');
      return;
    }

    setStatus('GPS支持检测通过，正在请求权限...');
    console.log('GPS支持检测通过');

    // 请求GPS权限和位置
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('GPS定位成功:', pos);
        setPosition(pos);
        setStatus('GPS定位成功！');
        setError(null);
      },
      (err) => {
        console.error('GPS定位失败:', err);
        let errorMessage = '';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'GPS权限被拒绝';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'GPS位置信息不可用';
            break;
          case err.TIMEOUT:
            errorMessage = 'GPS定位超时';
            break;
          default:
            errorMessage = '未知GPS错误';
            break;
        }
        
        setError(`${errorMessage}: ${err.message}`);
        setStatus('GPS定位失败');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>GPS连接测试</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>状态: {status}</h3>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>错误:</strong> {error}
        </div>
      )}

      {position && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          color: '#2e7d32', 
          padding: '10px', 
          borderRadius: '4px'
        }}>
          <h3>GPS位置信息:</h3>
          <p><strong>纬度:</strong> {position.coords.latitude}</p>
          <p><strong>经度:</strong> {position.coords.longitude}</p>
          <p><strong>精度:</strong> {position.coords.accuracy} 米</p>
          <p><strong>时间戳:</strong> {new Date(position.timestamp).toLocaleString()}</p>
          {position.coords.speed && <p><strong>速度:</strong> {position.coords.speed} m/s</p>}
          {position.coords.heading && <p><strong>方向:</strong> {position.coords.heading}°</p>}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>注意:</strong></p>
        <ul>
          <li>现代浏览器要求HTTPS才能使用GPS定位API</li>
          <li>如果在HTTP环境下，GPS功能可能被阻止</li>
          <li>请确保允许浏览器访问您的位置信息</li>
        </ul>
      </div>
    </div>
  );
};

export default GPSTest;