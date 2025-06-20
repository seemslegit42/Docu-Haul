
"use client";

import type { GenerateDocumentationOutput } from '@/ai/flows/generate-documentation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Download } from 'lucide-react';

interface GeneratedDocumentProps {
  isLoading: boolean;
  aiError: string | null;
  generatedDoc: GenerateDocumentationOutput | null;
  editableDocText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTxtDownload: () => void;
  onPdfDownload: () => void;
}

export default function GeneratedDocument({
  isLoading,
  aiError,
  generatedDoc,
  editableDocText,
  onTextChange,
  onTxtDownload,
  onPdfDownload,
}: GeneratedDocumentProps) {
  const canDownload = generatedDoc && editableDocText.trim() && !aiError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generated Document</CardTitle>
        <CardDescription className="font-body">Preview and edit the AI-generated document below. You can download it once generated.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Error</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-body mt-2">Generating document...</p>
          </div>
        )}
        {!isLoading && !aiError && generatedDoc && (
          <Textarea
            value={editableDocText}
            onChange={onTextChange}
            rows={15}
            className="font-mono text-sm w-full p-3 border rounded-md bg-muted/50 shadow-inner"
            placeholder="Generated document will appear here..."
          />
        )}
        {!isLoading && (aiError || !generatedDoc) && (
            <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex items-center justify-center">
            {aiError ? "Document generation failed. See error above." : "Your AI-generated NVIS or Bill of Sale will appear here after submitting the details."}
          </div>
        )}
      </CardContent>
      {canDownload && (
        <CardFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onTxtDownload} 
              disabled={!canDownload}
            >
            <Download className="mr-2 h-4 w-4" />
            Download .txt
          </Button>
          <Button 
              variant="outline" 
              className="w-full" 
              onClick={onPdfDownload} 
              disabled={!canDownload}
            >
            <Download className="mr-2 h-4 w-4" />
            Download .pdf
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
