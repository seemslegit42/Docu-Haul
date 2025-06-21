
"use client";

import type { GenerateDocumentationOutput } from '@/ai/flows/generate-documentation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download, ShieldCheck } from 'lucide-react';

interface GeneratedDocumentProps {
  isLoading: boolean;
  generatedDoc: GenerateDocumentationOutput | null;
  editableDocText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTxtDownload: () => void;
  onPdfDownload: () => void;
  onCheckCompliance: () => void;
}

export default function GeneratedDocument({
  isLoading,
  generatedDoc,
  editableDocText,
  onTextChange,
  onTxtDownload,
  onPdfDownload,
  onCheckCompliance
}: GeneratedDocumentProps) {
  const canDownload = generatedDoc && editableDocText.trim() && !isLoading;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Generated Document</CardTitle>
        <CardDescription>Preview and edit the AI-generated document below. You can download it once generated.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-card/80 backdrop-blur-sm z-10 rounded-b-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-body mt-2">Generating document...</p>
          </div>
        )}
        <Textarea
          value={editableDocText}
          onChange={onTextChange}
          rows={15}
          className="font-mono text-sm w-full flex-grow p-3 border rounded-md bg-muted/50 shadow-inner"
          placeholder="Your AI-generated document will appear here."
          disabled={!generatedDoc || isLoading}
        />
      </CardContent>
      {canDownload && (
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
                className="w-full sm:flex-grow" 
                onClick={onCheckCompliance} 
                disabled={!canDownload}
            >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Check Compliance
            </Button>
            <div className="flex w-full sm:w-auto gap-2">
                <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={onTxtDownload} 
                    disabled={!canDownload}
                >
                    <Download className="mr-2 h-4 w-4" />
                    .txt
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={onPdfDownload} 
                    disabled={!canDownload}
                >
                    <Download className="mr-2 h-4 w-4" />
                    .pdf
                </Button>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
