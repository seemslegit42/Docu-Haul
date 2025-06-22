
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getGeneratedDocumentsForUser, type GeneratedDocument } from '@/lib/firestore';
import { deleteDocument } from '@/ai/flows/delete-document-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { DocumentActions } from './DocumentActions';
import { FileText } from 'lucide-react';

export default function DocumentHistoryClient() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchDocuments() {
      try {
        const userDocs = await getGeneratedDocumentsForUser(user.uid);
        setDocuments(userDocs);
      } catch (error) {
        console.error("Error fetching document history:", error);
        toast({
          title: "Error Fetching History",
          description: "Could not retrieve your document history. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [user, isAuthLoading, toast]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!user) {
      throw new Error("You must be logged in to perform this action.");
    }
    
    const authToken = await user.getIdToken();
    
    await deleteDocument({ documentId }, authToken);
    
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId));
  };


  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center text-muted-foreground font-body p-10 border border-dashed rounded-md h-80 flex flex-col items-center justify-center">
        <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-headline font-semibold">No Documents Found</h3>
        <p>You haven't saved any documents yet. Go to Smart Docs or Label Forge to get started!</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.documentType}</TableCell>
                <TableCell className="font-mono">{doc.vin}</TableCell>
                <TableCell>
                  {doc.createdAt?.toDate ? format(doc.createdAt.toDate(), 'PPP p') : 'Just now'}
                </TableCell>
                <TableCell className="text-right">
                  <DocumentActions document={doc} onDelete={handleDeleteDocument} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
