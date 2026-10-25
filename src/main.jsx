/**
 * main.jsx — PE2 update
 *
 * Wraps the app with:
 *   AuthProvider   — global Firebase auth state (Bhavnoor)
 *   ToastProvider  — global Toast notification system (Piyush)
 */

import { StrictMode }  from 'react';
import { createRoot }  from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
