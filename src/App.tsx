import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ApiScores from './pages/ApiScores';
import Leaderboard from './pages/Leaderboard';
import WeightConfiguration from './pages/WeightConfiguration';
import ApiStatus from './pages/ApiStatus';
import Settings from './pages/Settings';
import ApiDetail from './pages/ApiDetail';
import ManpowerDetail from './pages/ManpowerDetail';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="api-scores" element={<ApiScores />} />
          <Route path="api-scores/:apiId" element={<ApiDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="manpower/:id" element={<ManpowerDetail />} />
          <Route path="weights" element={<WeightConfiguration />} />
          <Route path="api-status" element={<ApiStatus />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;