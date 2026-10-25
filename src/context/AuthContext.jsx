/**
 * AuthContext.jsx — Bhavnoor's Task (PE2 Feature 1)
 *
 * Provides a global AuthContext that wraps the entire app.
 * • Listens to Firebase onAuthStateChanged for real-time session tracking.
 * • Exposes login (Google popup), loginWithEmail, register, and logout helpers.
 * • `authLoading` blocks rendering until Firebase resolves the initial session,
 *   preventing a flash of the logged-out state on page refresh.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebaseConfig';

// ── Context creation ──────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true until Firebase resolves

  // Subscribe to Firebase auth state once on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe; // clean up listener on unmount
  }, []);

  /** Sign in with Google popup */
  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }, []);

  /** Sign in with email + password */
  const loginWithEmail = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }, []);

  /** Register a new account with display name */
  const register = useCallback(async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  }, []);

  /** Sign out the current user */
  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = {
    user,
    authLoading,
    isLoggedIn: !!user,
    loginWithGoogle,
    loginWithEmail,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────
/**
 * useAuth — convenience hook.
 * Must be used inside <AuthProvider />.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
