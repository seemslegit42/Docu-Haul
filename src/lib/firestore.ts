
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit, writeBatch, type DocumentData } from 'firebase/firestore';

const GENERATED_DOCS_COLLECTION = 'generatedDocuments';

export interface GeneratedDocument {
  id?: string;
  userId: string;
  documentType: string;
  vin: string;
  content: string;
  createdAt: any; 
  imageDataUri?: string; // Add optional field for image data
}

/**
 * Throws an error if the Firestore database is not initialized.
 * This is a safeguard to ensure Firebase client-side configuration is present.
 */
function ensureDbInitialized() {
  if (!db) {
    throw new Error("Firestore is not initialized. Check your Firebase client-side configuration in your .env file.");
  }
}

/**
 * Adds a new generated document to Firestore.
 * @param doc - The document data to add.
 * @returns The ID of the newly created document.
 */
export async function addGeneratedDocument(doc: Omit<GeneratedDocument, 'id' | 'createdAt'>): Promise<string> {
  ensureDbInitialized();
  try {
    const docRef = await addDoc(collection(db, GENERATED_DOCS_COLLECTION), {
      ...doc,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document to Firestore: ", error);
    throw new Error("Failed to save document. Please try again.");
  }
}

/**
 * Fetches generated documents for a specific user.
 * @param userId - The ID of the user whose documents to fetch.
 * @param docLimit - Optional number of documents to limit the query to.
 * @returns A promise that resolves to an array of document data.
 */
export async function getGeneratedDocumentsForUser(userId: string, docLimit?: number): Promise<GeneratedDocument[]> {
  ensureDbInitialized();
  try {
    const constraints = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ];

    if (docLimit) {
      constraints.push(limit(docLimit));
    }

    const q = query(
      collection(db, GENERATED_DOCS_COLLECTION),
      ...constraints
    );

    const querySnapshot = await getDocs(q);
    const documents: GeneratedDocument[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as GeneratedDocument);
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents from Firestore: ", error);
    throw new Error("Failed to fetch documents. Please try again.");
  }
}


/**
 * Deletes all generated documents for a specific user.
 * This is used during account deletion to clean up user data.
 * @param userId - The ID of the user whose documents to delete.
 */
export async function deleteGeneratedDocumentsForUser(userId: string): Promise<void> {
  if (!db) {
    console.error("Firestore not initialized. Cannot delete user documents.");
    return;
  }

  // A read to find all documents for the user.
  const q = query(collection(db, GENERATED_DOCS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`No documents to delete for user ${userId}.`);
    return;
  }

  // Use a write batch to delete all documents in a single atomic operation.
  // Batches are more efficient for multiple writes.
  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`Successfully deleted ${querySnapshot.size} documents for user ${userId}.`);
}
