import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// These web config values are public identifiers, not secrets.
// Your data is protected by firestore.rules, not by hiding this config.
const firebaseConfig = {
  apiKey: 'AIzaSyC8y_OhI8PlssFALRZHG7kUocMrcpwfEqc',
  authDomain: 'my-family-nest-26.firebaseapp.com',
  projectId: 'my-family-nest-26',
  storageBucket: 'my-family-nest-26.firebasestorage.app',
  messagingSenderId: '322548954281',
  appId: '1:322548954281:web:4270b2c1e4dc88bfb3e5b8',
  measurementId: 'G-LVQLQ02R3N',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
