import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAkFrnXBTyxoq_NlnjQ4W9puwNOFTjhk08",
    authDomain: "project-barangay-4f81f.firebaseapp.com",
    projectId: "project-barangay-4f81f",
    storageBucket: "project-barangay-4f81f.firebasestorage.app",
    messagingSenderId: "1014174557585",
    appId: "1:1014174557585:web:b1a6a9cff3de3db3236630"

};

export const firebaseReady = !Object.values(firebaseConfig).some((value) => value.startsWith("YOUR_"));

const app = firebaseReady ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
