import admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK for server-side operations.
// It leverages application default credentials, which is the recommended
// approach for server-side Google Cloud environments like Firebase App Hosting.

if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    console.warn('Please ensure you have set up application default credentials. Server-side validation will not be available.');
  }
}

export default admin;
