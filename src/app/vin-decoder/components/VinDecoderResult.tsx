"use client";

import type { DecodeVinOutput } from '@/ai/flows/decode-vin-flow';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FilePlus2, Tags } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Decoded VIN Structure</CardTitle>
        <CardDescription className="font-body">The VIN has been broken down into its core components below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <ResultSkeleton />}
        {!isLoading && result && (
          <dl className="divide-y divide-border">
            <ResultRow label="Full VIN" value={result.fullVin} />
            <ResultRow label="WMI (Digits 1-3)" value={result.wmi.value} description={result.wmi.description} />
            <ResultRow label="VDS (Digits 4-8)" value={result.vehicleDescriptors.value} description="Vehicle Descriptor Section" />
            
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 pl-6 border-l-2 border-primary/20">
              <dt className="text-sm font-medium text-muted-foreground col-span-3 -ml-6 mb-2 text-primary/80">Descriptor Details</dt>
              <ResultRow label="Trailer Type (Digit 4)" value={result.vehicleDescriptors.trailerType} isMono={false} />
              <ResultRow label="Body Type (Digit 5)" value={result.vehicleDescriptors.bodyType} isMono={false} />
              <ResultRow label="Body Length (Digits 6-7)" value={result.vehicleDescriptors.bodyLength} isMono={false} />
              <ResultRow label="Number of Axles (Digit 8)" value={result.vehicleDescriptors.numberOfAxles} isMono={false} />
            </div>

            <ResultRow label="Check Digit (Digit 9)" value={result.checkDigit.value} description={result.checkDigit.description} />
            <ResultRow label="Model Year (Digit 10)" value={result.modelYear.value} description={result.modelYear.description} />
            <ResultRow label="Plant Code (Digit 11)" value={result.plant.value} description={result.plant.description} />
            <ResultRow label="Sequential Number" value={result.sequentialNumber.value} description={result.sequentialNumber.description} />
          </dl>
        )}
        {!isLoading && !result && (
          <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-96 flex items-center justify-center">
            The decoded VIN analysis will appear here.
          </div>
        )}
      </CardContent>
      {result && !isLoading && (
        <CardFooter className="flex flex-col md:flex-row gap-2 pt-4">
            <Button asChild className="w-full">
              <Link href={`/smart-docs?vin=${result.fullVin}&modelYear=${result.modelYear.year}&axles=${result.vehicleDescriptors.numberOfAxles}`}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Generate NVIS / BoS
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/label-forge?vin=${result.fullVin}`}>
                <Tags className="mr-2 h-4 w-4" />
                Forge VIN Label
              </Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
