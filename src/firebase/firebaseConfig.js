/**
 * firebaseConfig.js — Firebase app initialisation.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/ and create a project.
 * 2. Add a Web App to the project.
 * 3. Copy your config values into the object below (replace every placeholder).
 * 4. In Firebase Console → Authentication → Sign-in method:
 *      • Enable "Email/Password"
 *      • Enable "Google" (for signInWithPopup)
 * 5. In Firebase Console → Firestore Database → Create database (start in test mode).
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5hXlx_opssx00LKUZkWxGryQ_sCTtiGg",
  authDomain: "learnforge-f81c0.firebaseapp.com",
  projectId: "learnforge-f81c0",
  storageBucket: "learnforge-f81c0.firebasestorage.app",
  messagingSenderId: "671142601883",
  appId: "1:671142601883:web:fa9c5421efbd97ffd0123e",
  measurementId: "G-RTC0DT1GYP"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
