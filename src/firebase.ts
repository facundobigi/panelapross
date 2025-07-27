import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjIkC2WvjWi3y7g8ief9fgvaayHIlBQ5Y",
  authDomain: "apross-app-7de19.firebaseapp.com",
  projectId: "apross-app-7de19",
  storageBucket: "apross-app-7de19.appspot.com",
  messagingSenderId: "705883268332",
  appId: "1:705883268332:web:0fbf3719afe1bd472a71c9",
  measurementId: "G-VSRN72ENXX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
