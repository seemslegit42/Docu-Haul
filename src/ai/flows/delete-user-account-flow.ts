
'use server';
/**
 * @fileOverview A flow for a user to securely delete their own account and all associated data.
 */

import admin from '@/lib/firebase-admin';
import { deleteGeneratedDocumentsForUser } from '@/lib/firestore';
import { handleFlowError } from './utils/errorHandler';

/**
 * An authenticated flow for a user to delete their own account.
 * It verifies the user's identity from their auth token, deletes all their
 * generated documents from Firestore, and then deletes their Firebase Auth user record.
 *
 * @param _ The input is empty as the user is derived from the token.
 * @param authToken The user's Firebase ID token.
 * @returns A promise that resolves to an object indicating success.
 */
export const deleteUserAccount = async (_: {}, authToken: string | undefined): Promise<{ success: boolean }> => {
  if (!authToken) {
    throw new Error('Authentication required. Access denied.');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Step 1: Delete all documents associated with the user from Firestore.
    // This is crucial for data privacy and cleanup.
    await deleteGeneratedDocumentsForUser(userId);
    console.log(`Successfully deleted all documents for user ${userId}`);
    
    // Step 2: Delete the user's record from Firebase Authentication.
    await admin.auth().deleteUser(userId);
    console.log(`Successfully deleted user account ${userId}`);

    return { success: true };

  } catch (error) {
    // Use the centralized error handler
    await handleFlowError(error);
    throw new Error('This part of the code should not be reachable.'); // To satisfy Promise<{success: boolean}> return type
  }
};
