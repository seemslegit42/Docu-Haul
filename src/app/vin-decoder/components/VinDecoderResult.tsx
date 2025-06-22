
"use client";

import type { DecodeVinOutput } from '@/ai/flows/decode-vin-flow';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FilePlus2, Tags, ShieldAlert } from 'lucide-react';

interface VinDecoderResultProps {
  result: DecodeVinOutput | null;
  isLoading: boolean;
}

interface ResultRowProps {
  label: string;
  value: string;
  description?: string;
  isMono?: boolean;
}

const ResultRow = ({ label, value, description, isMono = true }: ResultRowProps) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
      <span className={isMono ? "font-mono bg-muted/60 px-2 py-1 rounded-md" : ""}>{value || "N/A"}</span>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </dd>
  </div>
);

const ResultSkeleton = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-full" />
        </div>
        <Separator/>
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-2/3" />
        </div>
        <Separator/>
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-1/2" />
        </div>
         <Separator/>
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
        </div>
        <Separator/>
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-2/5" />
        </div>
    </div>
);

export default function VinDecoderResult({ result, isLoading }: VinDecoderResultProps) {
  const renderContent = () => {
    if (isLoading) {
      return <ResultSkeleton />;
    }

    if (!result) {
      return (
        <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-96 flex items-center justify-center">
          The decoded VIN analysis will appear here.
        </div>
      );
    }
    
    if (!result.isValid || !result.decodedData) {
        return (
             <Alert variant="destructive" className="h-96 flex flex-col justify-center items-center text-center">
                <ShieldAlert className="h-12 w-12 mb-4" />
                <AlertTitle className="text-xl font-headline">VIN Decoding Failed</AlertTitle>
                <AlertDescription className="max-w-md">
                    {result.error || "An unknown error occurred during validation. Please check the VIN and try again."}
                </Aler<ctrl63>