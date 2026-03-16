import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLbGFS6Igs2O1rztJZFd74tNdUiktnlEw",
  authDomain: "supermarket-billing-54b21.firebaseapp.com",
  projectId: "supermarket-billing-54b21",
  storageBucket: "supermarket-billing-54b21.firebasestorage.app",
  messagingSenderId: "932677635450",
  appId: "1:932677635450:web:2f07af0de26e1270571ac3",
  measurementId: "G-K7GELN8HX5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);