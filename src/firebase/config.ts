import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKOQ_7Q6pR6UvinMwtzrNdLgpBxZ-QTxk",
  authDomain: "apprafael-c7411.firebaseapp.com",
  projectId: "apprafael-c7411",
  storageBucket: "apprafael-c7411.firebasestorage.app",
  messagingSenderId: "389810659865",
  appId: "1:389810659865:web:3392a3c2fe3aef4710c088",
  measurementId: "G-0P0HZ6ST2P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços do Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
