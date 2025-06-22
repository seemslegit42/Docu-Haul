
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getGeneratedDocumentsForUser, type GeneratedDocument } from '@/lib/firestore';
import { deleteDocument } from '@/ai/flows/delete-document-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { DocumentActions } from './DocumentActions';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function DocumentHistoryClient() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const searchTermMatch = doc.vin.toLowerCase().includes(searchTerm.toLowerCase());
      const typeFilterMatch = typeFilter === 'all' || doc.documentType === typeFilter;
      return searchTermMatch && typeFilterMatch;
    });
  }, [documents, searchTerm, typeFilter]);

  const clearFilters = () => {
      setSearchTerm('');
      setTypeFilter('all');
  }

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
        <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by VIN..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="NVIS">NVIS</SelectItem>
                        <SelectItem value="BillOfSale">Bill of Sale</SelectItem>
                        <SelectItem value="VIN Label">VIN Label</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline" onClick={clearFilters} disabled={!searchTerm && typeFilter === 'all'}>
                    Clear
                </Button>
            </div>
        </CardHeader>
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
            {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
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
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No documents match your search criteria.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
