'use server';
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: This file should only be used in server-side code ('use server').
// It initializes the Firebase Admin SDK, which has elevated privileges.

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;

const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
  : undefined;

if (!admin.apps.length) {
  if (serviceAccount) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      storageBucket: `${firebaseConfig.projectId}.appspot.com`,
    });
  } else {
    console.warn("Firebase Admin SDK service account credentials are not set. Admin features will be unavailable.");
    // Create a dummy app to avoid crashing the server if admin features are called.
    // Functions using adminDb or adminAuth will fail gracefully.
    adminApp = admin.initializeApp();
  }
} else {
    adminApp = admin.apps[0]!;
}

adminAuth = admin.auth(adminApp);
adminDb = admin.firestore(adminApp);

export { adminApp, adminAuth, adminDb };
