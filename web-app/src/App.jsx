import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LeaderboardPage from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import OrgPortal from './pages/OrgPortal';
import AdminConsole from './pages/AdminConsole';
import DeliveryPartnerDashboard from './pages/DeliveryPartnerDashboard';
import FactoryDashboard from './pages/FactoryDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/society" element={<Dashboard />} />
            <Route path="/dashboard/ngo" element={<OrgPortal />} />
            <Route path="/dashboard/factory" element={<FactoryDashboard />} />
            <Route path="/dashboard/delivery" element={<DeliveryPartnerDashboard />} />
            <Route path="/org-portal" element={<OrgPortal />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/delivery-partner" element={<DeliveryPartnerDashboard />} />
            <Route path="/factory" element={<FactoryDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
