import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Run from './pages/Run';
import Stats from './pages/Stats';
import { default as RoutesPage } from './pages/Routes';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import SimpleTest from './pages/SimpleTest';
// import GPSTest from './pages/GPSTest';
import SimpleGPSTest from './pages/SimpleGPSTest';
import DirectGPSTest from './pages/DirectGPSTest';
import FixedGPSTest from './pages/FixedGPSTest';
import MinimalTest from './pages/MinimalTest';
import SimpleRunTest from './pages/SimpleRunTest';
import GPSDebug from './pages/GPSDebug';
import ReactTest from './pages/ReactTest';
import NotFoundPage from './pages/NotFoundPage';
// import { useAuth } from './hooks/useAuth';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">加载中...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="App">
      <Routes>
        {/* 测试路由 - 不使用Layout */}
        <Route path="/test" element={<SimpleTest />} />
        {/* <Route path="/gps-test" element={<GPSTest />} /> */}
        <Route path="/simple-gps-test" element={<SimpleGPSTest />} />
        <Route path="/direct-gps-test" element={<DirectGPSTest />} />
        <Route path="/run-test" element={<Run />} />
          <Route path="/fixed-gps-test" element={<FixedGPSTest />} />
          <Route path="/minimal-test" element={<MinimalTest />} />
          <Route path="/simple-run-test" element={<SimpleRunTest />} />
          <Route path="/gps-debug" element={<GPSDebug />} />
          <Route path="/react-test" element={<ReactTest />} />
        
        {/* 认证路由 - 不使用Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 主应用路由 - 使用Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="run" element={<Run />} />
          <Route path="stats" element={<Stats />} />
          <Route path="routes" element={<RoutesPage />} />
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
