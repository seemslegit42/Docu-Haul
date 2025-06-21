
"use client";

import type { CreateCompliantVinLabelOutput } from '@/ai/flows/create-compliant-vin-label';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ShieldCheck } from 'lucide-react';

interface GeneratedLabelProps {
  generatedLabel: CreateCompliantVinLabelOutput | null;
  isLoading: boolean;
  onDownload: () => void;
  onCheckCompliance: () => void;
}

export default function GeneratedLabel({ generatedLabel, isLoading, onDownload, onCheckCompliance }: GeneratedLabelProps) {
  const canPerformActions = generatedLabel && !isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generated Label & Rationale</CardTitle>
        <CardDescription className="font-body">Preview the AI-generated label and its design rationale. Download or check compliance below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 font-body mt-2">Forging your label... This may take a moment.</p>
          </div>
        )}
        {!isLoading && generatedLabel && (
          <>
            <div className="border rounded-md p-4 bg-muted/30 flex justify-center items-center min-h-[250px]">
              <Image
                src={generatedLabel.labelDataUri}
                alt="Generated VIN Label"
                width={400} 
                height={200}
                className="rounded-md shadow-md object-contain"
                data-ai-hint="vehicle identification label"
                style={{ maxWidth: '100%', height: 'auto' }} 
              />
            </div>
            <div>
              <h4 className="font-headline text-lg text-primary">Placement Rationale:</h4>
              <p className="font-body text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border whitespace-pre-wrap">
                {generatedLabel.placementRationale}
              </p>
            </div>
          </>
        )}
        {!isLoading && !generatedLabel && (
            <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex items-center justify-center">
            Your AI-generated label and rationale will appear here.
          </div>
        )}
      </CardContent>
      {canPerformActions && (
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
                className="w-full sm:flex-grow" 
                onClick={onCheckCompliance} 
                disabled={!canPerformActions}
            >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Check Compliance
            </Button>
            <Button 
                variant="outline" 
                className="w-full sm:w-auto" 
                onClick={onDownload} 
                disabled={!canPerformActions}
            >
                <Download className="mr-2 h-4 w-4" />
                Download Label
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
