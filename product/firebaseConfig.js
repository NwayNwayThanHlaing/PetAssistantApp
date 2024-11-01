// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
