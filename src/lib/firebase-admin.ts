import admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK for server-side operations.
// It leverages application default credentials, which is the recommended
// approach for server-side Google Cloud environments like Firebase App Hosting.
// For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
// environment variable as described in the README.md.

if (!admin.apps.length) {
  // This will throw a clear and descriptive error if credentials are not found
  // during local development. The Next.js server will stop, and the terminal
  // will show the specific error message from the Firebase Admin SDK.
  admin.initializeApp();
}

export default admin;
