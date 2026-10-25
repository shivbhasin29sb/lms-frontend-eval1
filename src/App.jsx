/**
 * App.jsx — PE2 update
 *
 * • Replaced localStorage mock auth with real Firebase AuthContext.
 * • Auth modal (login/register) is lifted here so it can be triggered
 *   from both the Navbar and the Home page CTA.
 * • Toast system lives in ToastProvider (rendered inside the context tree).
 * • ProtectedRoute now reads `isLoggedIn` from AuthContext, not props.
 */

import { useState, useCallback }  from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Context
import { useAuth } from './context/AuthContext';

// Components
import Navbar        from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal     from './components/AuthModal';

// Pages
import Home       from './pages/Home';
import CoursePage from './pages/CoursePage';
import Dashboard  from './pages/Dashboard';
import NotFound   from './pages/NotFound';

function App() {
  const { isLoggedIn, logout, authLoading } = useAuth();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const openAuthModal  = useCallback(() => setAuthModalOpen(true),  []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  // Block rendering until Firebase resolves the initial session
  // (prevents flash of logged-out state on refresh)
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--clr-bg-primary)',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div className="spinner" aria-hidden="true" />
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
          Initialising…
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLoginToggle={isLoggedIn ? logout : openAuthModal}
      />

      <Routes location={location}>
        {/* Public Routes */}
        <Route
          path="/"
          element={<Home onLoginClick={openAuthModal} />}
        />

        <Route
          path="/course/:id"
          element={<CoursePage />}
        />

        {/* Protected Route — reads from AuthContext inside */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />
    </>
  );
}

export default App;
