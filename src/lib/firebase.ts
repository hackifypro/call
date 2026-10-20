import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC9Eoffi4eubjo701dtG6W66XqwvPjuk7w",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "call-boy-4ef22.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "call-boy-4ef22",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "call-boy-4ef22.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "760056494850",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:760056494850:web:fe92a19d113e620114601b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-HTQS8Y842C",
};

// Initialize Firebase (Singleton pattern to prevent re-initialization on Next.js Fast Refresh)
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth & Firestore
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Analytics runs safely only in browser environments (SSR-safe)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

export const getClientAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return analytics || getAnalytics(app);
    }
  }
  return null;
};
