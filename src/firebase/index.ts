'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';

// Store the initialized services in a module-level variable to act as a singleton.
let firebaseServices: { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore; } | null = null;


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore; } {
  if (typeof window === 'undefined') {
    // On the server, we can't rely on a singleton pattern across requests.
    // We create a new instance each time, assuming server-side rendering is isolated per request.
     if (!getApps().length) {
        const firebaseApp = initializeApp(firebaseConfig);
        return getSdks(firebaseApp);
    }
    return getSdks(getApp());
  }

  // On the client, we use the singleton pattern.
  if (!firebaseServices) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    
    // Use the new initializeFirestore API for persistence
    try {
        const firestore = initializeFirestore(app, {
            localCache: persistentLocalCache({})
        });
        
        firebaseServices = {
            firebaseApp: app,
            auth: getAuth(app),
            firestore: firestore,
        };

    } catch (error: any) {
        // This catch block handles initialization errors, which are rare but possible.
        // Fallback to non-persistent Firestore if initialization fails.
        console.error("Firebase persistence initialization failed, falling back to in-memory cache:", error);
        
        const firestore = getFirestore(app);

        firebaseServices = {
            firebaseApp: app,
            auth: getAuth(app),
            firestore: firestore,
        };
    }
  }

  return firebaseServices;
}

export function getSdks(firebaseApp: FirebaseApp) {
  // On subsequent calls after initialization, we can just get the instance.
  // This part is more relevant for server environments or complex client scenarios.
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
