
import admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK for server-side operations.
// It leverages application default credentials, which is the recommended
// approach for server-side Google Cloud environments like Firebase App Hosting.
// For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
// environment variable as described in the README.md.

if (!admin.apps.length) {
  // We do not wrap this in a try...catch block. If the Admin SDK fails to initialize,
  // it's a critical, fatal error for the server that should be addressed immediately.
  // Swallowing this error with a try...catch can lead to confusing downstream
  // failures and obscure the real problem. Failing fast provides clearer error logs.
  admin.initializeApp();
  console.log('Firebase Admin SDK initialized successfully.');
}

export default admin;
