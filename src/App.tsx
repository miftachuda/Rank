import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import WeightConfiguration from './pages/WeightConfiguration';
import Settings from './pages/Settings';
import ManpowerDetail from './pages/ManpowerDetail';
import AttendanceScore from './pages/AttendanceScore';
import BocPage from './pages/Boc';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="attendance" element={<AttendanceScore />} />
          <Route path="boc" element={<BocPage />} />
          <Route path="manpower/:id" element={<ManpowerDetail />} />
          <Route path="weights" element={<WeightConfiguration />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;