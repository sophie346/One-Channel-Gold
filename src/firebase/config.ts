import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqG6-Do0OIlKkZMhqA1NBVqAyKuVBHkZY",
  authDomain: "one-gold-89f59.firebaseapp.com",
  projectId: "one-gold-89f59",
  storageBucket: "one-gold-89f59.firebasestorage.app",
  messagingSenderId: "821643614436",
  appId: "1:821643614436:web:c3763db29bd88bd2c234f1",
  measurementId: "G-4HKZ2M27N1"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
