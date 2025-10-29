'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

// A memoized singleton for Firebase services
let firebaseServices: FirebaseServices | null = null;

function getFirebaseServices(): FirebaseServices {
    if (!firebaseServices) {
        firebaseServices = initializeFirebase();
    }
    return firebaseServices;
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Ensure Firebase is initialized only once on the client.
  const services = useMemo(() => getFirebaseServices(), []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
