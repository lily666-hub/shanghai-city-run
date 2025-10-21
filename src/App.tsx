import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Run from './pages/Run';
import Stats from './pages/Stats';
import RoutesPage from './pages/Routes';
import Challenges from './pages/Challenges';
import Test from './pages/Test';
import { useAuth } from './hooks/useAuth';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 主要路由 - 暂时允许未认证用户访问 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="run" element={<Run />} />
          <Route path="stats" element={<Stats />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="test" element={<Test />} />
        </Route>
        
        {/* 重定向未匹配的路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
