import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoF6Uuunb7dl1bfmqPSbzZNZqWZYNYwEI",
  authDomain: "try-on-c05f0.firebaseapp.com",
  projectId: "try-on-c05f0",
  storageBucket: "try-on-c05f0.firebasestorage.appspot.com",
  messagingSenderId: "681286310762",
  appId: "1:681286310762:web:f183b38d64d211357c6313",
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with persistent storage for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// ✅ Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
