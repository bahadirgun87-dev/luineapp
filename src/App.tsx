import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { Session } from '@supabase/supabase-js';

// A simple component to handle protected routes
const ProtectedRoute = ({ session, children }: { session: Session | null, children: JSX.Element }) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-900" />; // Or a spinner component
  }

  return (
    <Routes>
      <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute session={session}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
