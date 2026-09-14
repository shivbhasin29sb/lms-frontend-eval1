import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute — Guards routes that require authentication.
 * Uses localStorage flag 'lms_auth' as mock auth mechanism.
 * Redirects unauthenticated users to / with a state message.
 *
 * Props:
 *   isLoggedIn {boolean} — passed down from App state
 *   children   {ReactNode}
 */
function ProtectedRoute({ isLoggedIn, children }) {
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to home, preserving where the user wanted to go
    return (
      <Navigate
        to="/"
        state={{ from: location, authRequired: true }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;