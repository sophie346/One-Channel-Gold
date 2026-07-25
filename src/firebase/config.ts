import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBN6JBQ7OXwXNWC3EkZxC2et0CMTd91IEA',
  authDomain: 'onetruckpartscom.firebaseapp.com',
  projectId: 'onetruckpartscom',
  storageBucket: 'onetruckpartscom.appspot.com',
  messagingSenderId: '200627911533',
  appId: '1:200627911533:web:f8ef05ccbb3e10426bf864',
  measurementId: 'G-NSE0V4RM8P',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
