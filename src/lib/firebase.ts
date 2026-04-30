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
  apiKey: "AIzaSyBBVn-xnjxfZZyJugEwlHbKrn2_rjwjznU",
  authDomain: "wadding-team-d22c3.firebaseapp.com",
  projectId: "wadding-team-d22c3",
  storageBucket: "wadding-team-d22c3.firebasestorage.app",
  messagingSenderId: "3157995559",
  appId: "1:3157995559:web:2cb2b1df49c617864ede02"
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
