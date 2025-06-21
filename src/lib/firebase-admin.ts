import admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK for server-side operations.
// It reads credentials from environment variables.

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey.replace(/\\n/g, '\n'), // Replace escaped newlines
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
  }
}

export default admin;
