

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