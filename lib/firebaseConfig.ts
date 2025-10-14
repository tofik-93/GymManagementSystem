import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbvDW4K6B8uTDTAoYXiHYk4Z_Hau5jsLA",
  authDomain: "gympro-104c3.firebaseapp.com",
  databaseURL: "https://gympro-104c3-default-rtdb.firebaseio.com",
  projectId: "gympro-104c3",
  storageBucket: "gympro-104c3.firebasestorage.app",
  messagingSenderId: "1087432278997",
  appId: "1:1087432278997:web:7d163d58d70f80f054f35c",
  measurementId: "G-7LMW9ND8DX",
};

// Only initialize Firebase if running in browser
let app: ReturnType<typeof getApp>;
if (typeof window !== "undefined") {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const rtdb: Database = app ? getDatabase(app) : undefined!;
export const storage: FirebaseStorage = app ? getStorage(app) : undefined!;