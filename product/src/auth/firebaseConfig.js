// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth"; // Import necessary functions
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqz90lvvGYfw_XRRzbfJ4fiitQzjjqTLk",
  authDomain: "fyp-purrnote.firebaseapp.com",
  projectId: "fyp-purrnote",
  storageBucket: "fyp-purrnote.firebasestorage.app",
  messagingSenderId: "476410167113",
  appId: "1:476410167113:web:5065475f5bd458d124a498",
  measurementId: "G-3FC29QG1N3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Use AsyncStorage for persistence
});

// Initialize Firestore
export const firestore = getFirestore(app); // Initialize Firestore

// Initialize Analytics only if supported
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics }; // Export analytics if needed
