
"use client";

import type { DecodeVinOutput } from '@/ai/flows/decode-vin-flow';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FilePlus2, Tags, ShieldAlert, Hash } from 'lucide-react';

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
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-border/60 last:border-b-0">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
      <span className={isMono ? "font-mono bg-muted/60 px-2 py-1 rounded-md" : ""}>{value || "N/A"}</span>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </dd>
  </div>
);

const ResultSkeleton = () => (
    <div className="space-y-4 p-6">
        <div className="space-y-3">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-3 pt-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-2/3" />
        </div>
        <div className="space-y-3 pt-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-1/2" />
        </div>
         <div className="space-y-3 pt-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
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
        <CardContent className="p-6">
            <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-96 flex flex-col items-center justify-center">
                <Hash className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-headline text-lg">Awaiting VIN</h3>
                <p>The decoded VIN analysis will appear here once you submit a VIN.</p>
            </div>
        </CardContent>
      );
    }
    
    if (!result.isValid || !result.decodedData) {
        return (
            <CardContent className="p-6">
                <Alert variant="destructive" className="h-96 flex flex-col justify-center items-center text-center">
                    <ShieldAlert className="h-12 w-12 mb-4" />
                    <AlertTitle className="text-xl font-headline">VIN Decoding Failed</AlertTitle>
                    <AlertDescription className="max-w-md">
                        {result.error || "An unknown error occurred during validation. Please check the VIN and try again."}
                    </AlertDescription>
                </Alert>
            </CardContent>
        );
    }

    const { decodedData } = result;
    const query = new URLSearchParams({
        vin: decodedData.fullVin,
        modelYear: decodedData.modelYear.year,
        axles: decodedData.vehicleDescriptors.numberOfAxles,
    }).toString();

    return (
      <>
        <CardContent className="p-0 sm:p-6">
          <dl className="sm:divide-y sm:divide-border/60">
            <ResultRow label="WMI" value={decodedData.wmi.value} description={decodedData.wmi.description} />
            <ResultRow label="VDS" value={decodedData.vehicleDescriptors.value} description={decodedData.vehicleDescriptors.description} />
            <ResultRow label="- Trailer Type" value={decodedData.vehicleDescriptors.trailerType} isMono={false} />
            <ResultRow label="- Body Type" value={decodedData.vehicleDescriptors.bodyType} isMono={false} />
            <ResultRow label="- Body Length" value={decodedData.vehicleDescriptors.bodyLength} isMono={false} />
            <ResultRow label="- Number of Axles" value={decodedData.vehicleDescriptors.numberOfAxles} isMono={false} />
            <ResultRow label="Check Digit" value={decodedData.checkDigit.value} description={decodedData.checkDigit.description} />
            <ResultRow label="Model Year" value={`${decodedData.modelYear.year} (Code: ${decodedData.modelYear.code})`} description={decodedData.modelYear.description} isMono={false} />
            <ResultRow label="Plant Code" value={decodedData.plant.value} description={decodedData.plant.description} />
            <ResultRow label="Sequential Number" value={decodedData.sequentialNumber.value} description={decodedData.sequentialNumber.description} />
          </dl>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button asChild className="w-full">
            <Link href={`/smart-docs?${query}`}>
              <FilePlus2 /> Generate NVIS / BoS
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href={`/label-forge?${query}`}>
              <Tags /> Create VIN Label
            </Link>
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decoded VIN Report</CardTitle>
        <CardDescription className="font-body">A detailed breakdown of the provided Vehicle Identification Number.</CardDescription>
      </CardHeader>
      <Separator className="hidden sm:block" />
      {renderContent()}
    </Card>
  );
}
