import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
  Auth,
} from 'firebase/auth';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Fallback configuration if file or env is missing
const fallbackConfig = {
  projectId: "gen-lang-client-0848523256",
  appId: "1:758870849852:web:78c4314b7ab01337ad8639",
  apiKey: "AIzaSyC-PQ6EFaLMn1Z1q48K-pJ7tqRrRtuvIpw",
  authDomain: "gen-lang-client-0848523256.firebaseapp.com",
  storageBucket: "gen-lang-client-0848523256.firebasestorage.app",
  messagingSenderId: "758870849852",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  const finalConfig = { ...fallbackConfig, ...(firebaseConfigFile || {}) };
  app = getApps().length > 0 ? getApp() : initializeApp(finalConfig);
  auth = getAuth(app);
} catch (err) {
  console.warn('Firebase initialization error (operating in offline/local mode):', err);
}

export { app, auth };

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/gmail.send',
];

let provider: GoogleAuthProvider | null = null;
try {
  provider = new GoogleAuthProvider();
  SCOPES.forEach((scope) => provider?.addScope(scope));
  provider.setCustomParameters({
    prompt: 'consent',
    access_type: 'offline',
  });
} catch (e) {
  console.warn('GoogleAuthProvider initialization warning:', e);
}

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token is in memory only
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth || !provider) {
    throw new Error('ระบบ Google Auth ยังไม่พร้อมใช้งานบนสภาพแวดล้อมนี้ กรุณาลองใหม่อีกครั้ง');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessTokenManual = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
};
