
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAqDE7UqL_pCgVN7M0xJH7inTuxMDvq5g",
  authDomain: "try-on-d85ca.firebaseapp.com",
  projectId: "try-on-d85ca",
  storageBucket: "try-on-d85ca.firebasestorage.app",
  messagingSenderId: "447318132816",
  appId: "1:447318132816:web:936cc800b925e14b3f6955"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };
