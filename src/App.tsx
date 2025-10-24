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
          <Route path="challenges" element={<Challenges />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
