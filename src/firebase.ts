// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBt00iodrRZG5EMdjajXxV-AxOplGUbGO0",
  authDomain: "ftl-emp.firebaseapp.com",
  projectId: "ftl-emp",
  storageBucket: "ftl-emp.firebasestorage.app",
  messagingSenderId: "810133203475",
  appId: "1:810133203475:web:d9abd6522d9c9204dcade6",
  measurementId: "G-1SXNRWDHPV",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
