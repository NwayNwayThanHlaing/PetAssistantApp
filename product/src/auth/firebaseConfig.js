import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqz90lvvGYfw_XRRzbfJ4fiitQzjjqTLk",
  authDomain: "fyp-purrnote.firebaseapp.com",
  projectId: "fyp-purrnote",
  storageBucket: "fyp-purrnote.appspot.com",
  messagingSenderId: "476410167113",
  appId: "1:476410167113:web:5065475f5bd458d124a498",
  measurementId: "G-3FC29QG1N3",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const firestore = getFirestore(app);

let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
