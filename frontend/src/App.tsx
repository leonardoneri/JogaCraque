
import React from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { GameProvider } from './context/GameContext';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { Market } from './pages/Market';
import { Match } from './pages/Match';
import { Squad } from './pages/Squad';

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
