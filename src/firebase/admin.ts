'use server';
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: This file should only be used in server-side code ('use server').
// It initializes the Firebase Admin SDK, which has elevated privileges.

const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
  : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  });
}

export const adminApp = admin.apps[0]!;
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
