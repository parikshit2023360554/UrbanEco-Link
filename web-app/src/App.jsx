import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LeaderboardPage from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import OrgPortal from './pages/OrgPortal';
import AdminConsole from './pages/AdminConsole';

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
            <Route path="/org-portal" element={<OrgPortal />} />
            <Route path="/admin" element={<AdminConsole />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
