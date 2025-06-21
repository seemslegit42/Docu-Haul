
import admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK for server-side operations.
// It leverages application default credentials, which is the recommended
// approach for server-side Google Cloud environments like Firebase App Hosting.
// For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
// environment variable as described in the README.md.

if (!admin.apps.length) {
  try {
    // This is the line that requires credentials to be set.
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    // This block will execute if GOOGLE_APPLICATION_CREDENTIALS is not set
    // or points to an invalid file during local development.
    console.error(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' +
      'CRITICAL: Firebase Admin SDK initialization failed. \n' +
      'This is likely because the GOOGLE_APPLICATION_CREDENTIALS environment variable is not set correctly.\n' +
      'Refer to the README.md for instructions on setting up server-side credentials for local development.\n' +
      'Original error:', error.message,
      '\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
    );
    // Re-throw the error to crash the server process. This is intentional.
    // A server that cannot connect to its Firebase services should not run, as it leads to confusing errors.
    throw error;
  }
}

export default admin;
