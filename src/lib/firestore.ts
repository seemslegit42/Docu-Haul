
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

if (!db) {
  throw new Error("Firestore is not initialized. Check your Firebase configuration.");
}

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
 * Adds a new generated document to Firestore.
 * @param doc - The document data to add.
 * @returns The ID of the newly created document.
 */
export async function addGeneratedDocument(doc: Omit<GeneratedDocument, 'id' | 'createdAt'>): Promise<string> {
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
 * Fetches all generated documents for a specific user.
 * @param userId - The ID of the user whose documents to fetch.
 * @returns A promise that resolves to an array of document data.
 */
export async function getGeneratedDocumentsForUser(userId: string): Promise<GeneratedDocument[]> {
  try {
    const q = query(
      collection(db, GENERATED_DOCS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
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
