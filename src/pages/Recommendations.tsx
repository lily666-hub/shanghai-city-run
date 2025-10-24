import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Thermometer, Navigation } from 'lucide-react';

// 简化的类型定义
interface SimpleRoute {
  id: string;
  name: string;
  distance: number;
  difficulty_level: number;
  terrain_type: string;
  estimated_duration: number;
  description: string;
  avg_rating: number;
  total_ratings: number;
  features: string[];
}

interface SimpleRecommendation {
  route: SimpleRoute;
  score: number;
  reason: string;
}

const Recommendations: React.FC = () => {
  useEffect(() => {
    // 由于React hooks系统存在问题，重定向到独立的HTML页面
    window.location.href = '/recommendations-fallback.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>正在跳转到智能推荐页面...</h2>
        <p>如果页面没有自动跳转，请点击 <a href="/recommendations-fallback.html" style={{ color: 'white' }}>这里</a></p>
      </div>
    </div>
  );
};

export default Recommendations;