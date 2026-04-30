import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// developer firebase config (for local development and staging)
// const firebaseConfig = {
//   apiKey: "AIzaSyD6FVwLZaZyEzbgv3C2DgzNF0Bj2sLJ2Rc",
//   authDomain: "wadding-team.firebaseapp.com",
//   projectId: "wadding-team",
//   storageBucket: "wadding-team.firebasestorage.app",
//   messagingSenderId: "475818735841",
//   appId: "1:475818735841:web:c363748b86520559489fa0"
// };

const firebaseConfig = {
  apiKey: "AIzaSyA24yw-N-Iy02VxaQEtcvqFmAuHksU8AkE",
  authDomain: "wading-team.firebaseapp.com",
  projectId: "wading-team",
  storageBucket: "wading-team.firebasestorage.app",
  messagingSenderId: "711151313894",
  appId: "1:711151313894:web:56d69d810918e4d5576c27"
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      "Firebase client not configured. Set NEXT_PUBLIC_FIREBASE_* env vars in .env.local"
    );
  }

  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) return firebaseAuth;
  firebaseAuth = getAuth(getFirebaseApp());
  return firebaseAuth;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}
