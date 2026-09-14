import { useState, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';

// Pages
import Home       from './pages/Home';
import CoursePage from './pages/CoursePage';
import Dashboard  from './pages/Dashboard';
import NotFound   from './pages/NotFound';

// ── Auth helpers ─────────────────────────────────────────────
const AUTH_KEY = 'lms_auth';

function readAuth() {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeAuth(value) {
  try {
    localStorage.setItem(AUTH_KEY, String(value));
  } catch (err) {
    console.error('Could not write auth state:', err);
  }
}

/**
 * App — Root component.
 * Owns the global `isLoggedIn` state and passes it down via props (no Context).
 * Manages all routes using React Router v6.
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(readAuth);
  const location = useLocation();

  // Toggle mock auth: flip the flag and persist to localStorage
  const handleLoginToggle = useCallback(() => {
    setIsLoggedIn(prev => {
      const next = !prev;
      writeAuth(next);
      return next;
    });
  }, []);

  return (
    <>
      {/* Global navigation — hidden on the 404 page */}
      <Navbar isLoggedIn={isLoggedIn} onLoginToggle={handleLoginToggle} />

      <Routes location={location}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Home onLoginClick={handleLoginToggle} />
          }
        />

        <Route
          path="/course/:id"
          element={<CoursePage />}
        />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
