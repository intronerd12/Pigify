import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Pigify Web App Firebase Configuration
const firebaseConfig = { 
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCVV13Haa79XO_yEJVwchbmUrqVs051Cxo", 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pigify-ecfcf.firebaseapp.com", 
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pigify-ecfcf", 
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pigify-ecfcf.firebasestorage.app", 
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "236055056140", 
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:236055056140:web:725be7237c8a0e8a6a8329", 
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V5498BXCY4" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };

