
import React from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AuthGuard } from './components/auth/AuthGuard';
import { Layout } from './components/common/Layout';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Market } from './pages/Market';
import { Match } from './pages/Match';
import { Squad } from './pages/Squad';

const App: React.FC = () => {
  const authMode = import.meta.env.VITE_AUTH_MODE || 'guest';

  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          {authMode === 'full' ? (
            // Modo Full: Rota de login separada
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <AuthGuard>
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
                  </AuthGuard>
                }
              />
            </Routes>
          ) : (
            // Modo Guest: AuthGuard envolve tudo (auto-login)
            <AuthGuard>
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
            </AuthGuard>
          )}
        </Router>
      </GameProvider>
    </AuthProvider>
  );
};

export default App;
