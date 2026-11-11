import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getSession, verifySession } from './auth';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Settings from './pages/Settings';
import Saved from './pages/Saved';
import Statistics from './pages/Statistics';

function PrivateRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const cached = getSession();
    if (cached) {
      setStatus('ok');
      verifySession().then((user) => {
        if (!user) setStatus('fail');
      });
      return;
    }
    verifySession().then((user) => {
      setStatus(user ? 'ok' : 'fail');
    });
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (status === 'fail') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnly({ children }) {
  return getSession() ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="history" element={<History />} />
          <Route path="saved" element={<Saved />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
