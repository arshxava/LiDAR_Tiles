
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all necessary Firebase config values are present
const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  console.error(
    `Firebase configuration is missing or incomplete in your .env file. 
    Missing keys: ${missingConfigKeys.join(', ')}. 
    Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set correctly.
    Firebase will not initialize properly.`
  );
}

let app: FirebaseApp;

// Initialize Firebase only if config seems mostly complete (apiKey is a good basic check)
if (firebaseConfig.apiKey && !getApps().length) {
  app = initializeApp(firebaseConfig);
} else if (firebaseConfig.apiKey) {
  app = getApp();
} else {
  // If config is missing, provide a dummy app to prevent crashes, but auth will fail.
  console.warn("Firebase App could not be initialized due to missing configuration. Auth features will not work.");
  // @ts-ignore
  app = undefined; 
}

// @ts-ignore
const auth = app ? getAuth(app) : null;

if (auth) {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Error setting auth persistence:", error);
    });
} else {
  console.warn("Firebase Auth could not be initialized. Authentication will not function.");
}

export { app, auth };
