
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Squad } from './pages/Squad';
import { Market } from './pages/Market';
import { Match } from './pages/Match';
import { Admin } from './pages/Admin';

const App: React.FC = () => {
  return (
    <GameProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/squad" element={<Squad />} />
            <Route path="/market" element={<Market />} />
            <Route path="/match" element={<Match />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </GameProvider>
  );
};

export default App;
