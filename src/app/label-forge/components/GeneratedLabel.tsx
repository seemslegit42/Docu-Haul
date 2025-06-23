'use client';

import type { VinLabelData } from '@/ai/flows/create-compliant-vin-label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ShieldCheck, Save } from 'lucide-react';
import { VinLabel } from './VinLabel';

interface GeneratedLabelProps {
  generatedData: VinLabelData | null;
  template:
    | 'standard'
    | 'bilingual_canadian'
    | 'bilingual_rv_canadian'
    | 'tire_and_loading'
    | 'multi_axle_heavy_duty';
  labelRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDownload: () => void;
  onCheckCompliance: () => void;
}

export default function GeneratedLabel({
  generatedData,
  template,
  labelRef,
  isLoading,
  isSaving,
  onSave,
  onDownload,
  onCheckCompliance,
}: GeneratedLabelProps) {
  const canPerformActions = generatedData && !isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generated Label & Rationale</CardTitle>
        <CardDescription className="font-body">
          Preview the deterministically rendered label and the AI's design rationale.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 font-body mt-2">Extracting label data with AI...</p>
          </div>
        )}
        {!isLoading && generatedData && (
          <>
            <div className="border rounded-md p-4 bg-muted/30 flex justify-center items-center min-h-[250px] overflow-x-auto">
              <VinLabel ref={labelRef} data={generatedData.labelData} template={template} />
            </div>
            <div>
              <h4 className="font-headline text-lg text-primary">Placement Rationale:</h4>
              <p className="font-body text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border whitespace-pre-wrap">
                {generatedData.placementRationale}
              </p>
            </div>
          </>
        )}
        {!isLoading && !generatedData && (
          <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex items-center justify-center">
            Your AI-generated label and rationale will appear here.
          </div>
        )}
      </CardContent>
      {canPerformActions && (
        <CardFooter className="flex flex-col md:flex-row gap-2 pt-4">
          <Button
            className="w-full md:flex-grow"
            onClick={onCheckCompliance}
            disabled={!canPerformActions || isSaving}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Check Compliance
          </Button>
          <Button
            variant="secondary"
            className="w-full md:w-auto"
            onClick={onSave}
            disabled={!canPerformActions || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Label
          </Button>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={onDownload}
            disabled={!canPerformActions || isSaving}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
