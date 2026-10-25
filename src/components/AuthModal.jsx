/**
 * AuthModal.jsx — Bhavnoor's Task (PE2 Feature 1)
 *
 * Login / Register dialog that sits inside <Modal />.
 * • Uses useAuthForm for validation before any Firebase call.
 * • Supports Google sign-in (popup) and email/password flows.
 * • Displays server-side Firebase error messages via the Toast system.
 * • Switches between 'login' and 'register' tabs without closing the modal.
 */

import { useState, useCallback } from 'react';
import Modal      from './Modal';
import InputField from './InputField';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useAuthForm  from '../hooks/useAuthForm';
import './AuthModal.css';

// ── Map Firebase error codes to friendly messages ─────────────────────────────
function friendlyError(code) {
  const map = {
    'auth/user-not-found':          'No account found with that email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password is too weak.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
    'auth/popup-closed-by-user':    'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed':  'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

function AuthModal({ isOpen, onClose }) {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);

  const { loginWithGoogle, loginWithEmail, register } = useAuth();
  const { addToast } = useToast();
  const { fields, errors, handleChange, handleBlur, validate, reset } = useAuthForm(mode);

  // Switch tabs and reset form state
  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    reset();
  }, [reset]);

  // Google sign-in
  const handleGoogle = useCallback(async () => {
    setSubmitting(true);
    try {
      const user = await loginWithGoogle();
      addToast(`Welcome, ${user.displayName || 'Learner'}! 🎉`, 'success');
      onClose();
    } catch (err) {
      addToast(friendlyError(err.code), 'error');
    } finally {
      setSubmitting(false);
    }
  }, [loginWithGoogle, addToast, onClose]);

  // Email/password submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return; // block if client-side validation fails

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const user = await loginWithEmail(fields.email, fields.password);
        addToast(`Welcome back, ${user.displayName || user.email}! 👋`, 'success');
      } else {
        const user = await register(fields.email, fields.password, fields.name);
        addToast(`Account created! Welcome aboard, ${user.displayName || 'Learner'}! 🚀`, 'success');
      }
      onClose();
    } catch (err) {
      addToast(friendlyError(err.code), 'error');
    } finally {
      setSubmitting(false);
    }
  }, [mode, validate, fields, loginWithEmail, register, addToast, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? '⚡ Welcome Back' : '🚀 Create Account'}
      size="md"
    >
      <div className="auth-modal">
        {/* ── Tab switcher ── */}
        <div className="auth-modal__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-modal__tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Log In
          </button>
          <button
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-modal__tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* ── Google sign-in ── */}
        <button
          id="google-signin-btn"
          className="auth-modal__google-btn"
          onClick={handleGoogle}
          disabled={submitting}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-modal__divider"><span>or</span></div>

        {/* ── Form ── */}
        <form id="auth-form" className="auth-modal__form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <InputField
              id="auth-name"
              label="Full Name"
              type="text"
              value={fields.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
              placeholder="e.g. Alex Johnson"
              required
              autoComplete="name"
              icon="👤"
            />
          )}

          <InputField
            id="auth-email"
            label="Email Address"
            type="email"
            value={fields.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={errors.email}
            placeholder="you@example.com"
            required
            autoComplete={mode === 'login' ? 'username' : 'email'}
            icon="✉️"
          />

          <InputField
            id="auth-password"
            label="Password"
            type="password"
            value={fields.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            error={errors.password}
            placeholder={mode === 'register' ? 'Min 8 chars, 1 upper, 1 number, 1 special' : '••••••••'}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            icon="🔒"
          />

          {mode === 'register' && (
            <InputField
              id="auth-confirm"
              label="Confirm Password"
              type="password"
              value={fields.confirm}
              onChange={handleChange('confirm')}
              onBlur={handleBlur('confirm')}
              error={errors.confirm}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              icon="🔒"
            />
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary auth-modal__submit"
            disabled={submitting}
          >
            {submitting
              ? <><span className="auth-modal__spinner" aria-hidden="true" />Processing…</>
              : mode === 'login' ? 'Log In to LearnForge' : 'Create My Account'
            }
          </button>
        </form>

        {mode === 'login' && (
          <p className="auth-modal__footer-text">
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-modal__link"
              onClick={() => switchMode('register')}
            >
              Sign up free
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
}

export default AuthModal;
