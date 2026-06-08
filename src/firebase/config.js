import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

// True when all env vars are present
export const isConfigured = Boolean(import.meta.env.VITE_FB_API_KEY && import.meta.env.VITE_FB_PROJECT_ID);

let _app, _db, _storage;
if (isConfigured) {
  _app     = initializeApp(firebaseConfig);
  _db      = getFirestore(_app);
  _storage = getStorage(_app);
}

export const db      = _db;
export const storage = _storage;
