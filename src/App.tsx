import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Run from './pages/Run';
import Stats from './pages/Stats';
import { default as RoutesPage } from './pages/Routes';
import Recommendations from './pages/Recommendations';
import RouteDetail from './pages/RouteDetail';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFoundPage from './pages/NotFoundPage';
import APITest from './pages/APITest';
import DebugTest from './pages/DebugTest';
import APIKeyError from './pages/APIKeyError';
import KimiTest from './pages/KimiTest';
import { ConversationDebug } from './pages/ConversationDebug';

// 安全评估系统页面
import SafetyDashboard from './pages/SafetyDashboard';
import SafetyMonitor from './pages/SafetyMonitor';
import SafetyAssessment from './pages/SafetyAssessment';
import WomenSafety from './pages/WomenSafety';
import EmergencyResponse from './pages/EmergencyResponse';
import SafetySystemTest from './pages/SafetySystemTest';

// AI智能安全顾问页面
import { 
  AIHome, 
  AIChat, 
  WomenSafetyPage, 
  EmergencyPage, 
  AnalysisPage 
} from './pages/ai';

// AI智能路线推荐页面
import RouteRecommendationSettings from './pages/RouteRecommendationSettings';
import RouteRecommendationHistory from './pages/RouteRecommendationHistory';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  return (
    <div className="App">
      <Routes>
        {/* 认证路由 - 不使用Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 主应用路由 - 使用Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="run" element={<Run />} />
          <Route path="stats" element={<Stats />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="route/:id" element={<RouteDetail />} />
          
          {/* AI智能路线推荐路由 */}
          <Route path="route-recommendation-settings" element={<RouteRecommendationSettings />} />
          <Route path="route-recommendation-history" element={<RouteRecommendationHistory />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="profile" element={<Profile />} />
          
          {/* 安全评估系统路由 */}
          <Route path="safety" element={<SafetyDashboard />} />
          <Route path="safety/monitor" element={<SafetyMonitor />} />
          <Route path="safety/assessment" element={<SafetyAssessment />} />
          <Route path="safety/women" element={<WomenSafety />} />
          <Route path="safety/emergency" element={<EmergencyResponse />} />
          <Route path="safety/test" element={<SafetySystemTest />} />
          
          {/* AI智能安全顾问路由 */}
          <Route path="ai" element={<AIHome />} />
          <Route path="ai/chat" element={<AIChat />} />
          <Route path="ai/women-safety" element={<WomenSafetyPage />} />
          <Route path="ai/emergency" element={<EmergencyPage />} />
          <Route path="ai/analysis" element={<AnalysisPage />} />
          
          {/* API测试页面 */}
          <Route path="/api-test" element={<APITest />} />
            <Route path="/debug-test" element={<DebugTest />} />
            <Route path="/api-key-error" element={<APIKeyError />} />
            <Route path="/kimi-test" element={<KimiTest />} />
            <Route path="/conversation-debug" element={<ConversationDebug />} />
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
