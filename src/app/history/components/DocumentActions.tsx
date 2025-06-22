
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MoreHorizontal, Eye, Copy, ShieldCheck, FileText, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedDocument } from '@/lib/firestore';

interface DocumentActionsProps {
  document: GeneratedDocument;
  onDelete: (documentId: string) => Promise<void>;
}

export function DocumentActions({ document, onDelete }: DocumentActionsProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    toast({
      title: "Content Copied",
      description: "The document content has been copied to your clipboard.",
    });
  };

  const handleCheckCompliance = () => {
    const complianceDocType = document.documentType === 'NVIS' 
      ? 'NVIS Certificate' 
      : document.documentType;

    const query = new URLSearchParams({
        documentType: complianceDocType,
        documentContent: document.content,
    }).toString();

    router.push(`/compliance-check?${query}`);
  };

  const handleDeleteConfirm = async () => {
    if (!document.id) return;
    setIsDeleting(true);
    try {
      await onDelete(document.id);
      toast({
        title: "Document Deleted",
        description: `The ${document.documentType} for VIN ${document.vin} has been deleted.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isImageView = document.documentType === 'VIN Label' && document.imageDataUri;

  return (
    <>
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Content</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCheckCompliance}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Check Compliance</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive"/>
                  Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the document for VIN <span className="font-mono font-semibold">{document.vin}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, delete document
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <FileText/> {document.documentType} - {document.vin}
            </DialogTitle>
            <DialogDescription>
              {isImageView
                ? "Image for the selected VIN Label."
                : "Content for the selected document. You can scroll to see the full content."}
            </DialogDescription>
          </DialogHeader>
          {isImageView ? (
            <div className="flex justify-center p-4 bg-muted/30 rounded-md border">
              <Image
                src={document.imageDataUri as string}
                alt={`VIN Label for ${document.vin}`}
                width={400}
                height={200}
                className="rounded-md shadow-md object-contain"
                data-ai-hint="vehicle identification label"
              />
            </div>
          ) : (
            <ScrollArea className="h-72 w-full rounded-md border p-4 font-mono text-sm whitespace-pre-wrap">
              {document.content}
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
