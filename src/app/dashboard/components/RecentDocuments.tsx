
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getGeneratedDocumentsForUser, type GeneratedDocument } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelative } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowRight, History, FileText } from 'lucide-react';

interface RecentDocumentsProps {
  limit?: number;
}

export function RecentDocuments({ limit = 5 }: RecentDocumentsProps) {
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
        const userDocs = await getGeneratedDocumentsForUser(user.uid, limit);
        setDocuments(userDocs);
      } catch (error) {
        console.error("Error fetching recent documents:", error);
        toast({
          title: "Error Fetching Documents",
          description: "Could not retrieve your recent documents.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [user, isAuthLoading, toast, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <CardTitle>Recent Activity</CardTitle>
        </div>
        <CardDescription>A quick look at the documents you've recently generated.</CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center text-muted-foreground font-body p-6 border border-dashed rounded-md flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-headline font-semibold">No Recent Activity</h3>
            <p className="text-sm">Generate a document using Smart Docs or Label Forge to see it here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.documentType}</TableCell>
                  <TableCell className="font-mono">{doc.vin}</TableCell>
                  <TableCell className="text-right">
                    {doc.createdAt?.toDate ? formatRelative(doc.createdAt.toDate(), new Date()) : 'Just now'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {documents.length > 0 && (
        <CardFooter>
            <Button variant="outline" asChild className="w-full">
                <Link href="/history">
                    View All History <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
