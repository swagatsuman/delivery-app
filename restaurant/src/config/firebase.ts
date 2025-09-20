import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateConfig = () => {
    const requiredKeys = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
    ];

    const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);

    if (missingKeys.length > 0) {
        console.error('Missing Firebase environment variables:', missingKeys);
        return false;
    }

    return true;
};

// Initialize Firebase only if configuration is valid
let app;
let auth;
let db;
let storage;

if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Connect to emulators in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
        try {
            connectAuthEmulator(auth, 'http://localhost:9099');
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectStorageEmulator(storage, 'localhost', 9199);
            console.log('🔥 Connected to Firebase emulators');
        } catch (error) {
            console.warn('Firebase emulators connection failed:', error);
        }
    }
} else {
    console.error('❌ Firebase initialization failed due to missing configuration');
}

export { auth, db, storage };
export default app;
