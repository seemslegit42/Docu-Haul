
'use server';
/**
 * @fileOverview A flow for securely deleting a user's generated document.
 */

import { z } from 'genkit';
import admin from '@/lib/firebase-admin';
import { handleFlowError } from './utils/errorHandler';

// The input schema for the deletion flow.
export const DeleteDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required.'),
});
export type DeleteDocumentInput = z.infer<typeof DeleteDocumentSchema>;

/**
 * An authenticated flow to delete a generated document.
 * It verifies the user's identity from their auth token and ensures they own the document before deletion.
 *
 * @param input The input containing the documentId to delete.
 * @param authToken The user's Firebase ID token.
 * @returns A promise that resolves to an object indicating success.
 */
export const deleteDocument = async (input: DeleteDocumentInput, authToken: string | undefined): Promise<{ success: boolean }> => {
  if (!authToken) {
    throw new Error('Authentication required. Access denied.');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const userId = decodedToken.uid;
    const { documentId } = input;
    
    const db = admin.firestore();
    const docRef = db.collection('generatedDocuments').doc(documentId);
    
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error('Document not found.');
    }

    const docData = docSnap.data();
    
    // Security Check: Ensure the user requesting deletion is the owner of the document.
    if (docData?.userId !== userId) {
      console.warn(`Unauthorized delete attempt: User ${userId} tried to delete document ${documentId} owned by ${docData?.userId}`);
      throw new Error('You are not authorized to delete this document.');
    }

    await docRef.delete();
    console.log(`Document ${documentId} successfully deleted for user ${userId}`);

    return { success: true };

  } catch (error) {
    // Use the centralized error handler
    handleFlowError(error);
  }
};
