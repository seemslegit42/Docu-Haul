
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DecodeVinSchema, type DecodeVinInput } from '@/lib/schemas';
import { decodeVin, type DecodeVinOutput } from '@/ai/flows/decode-vin-flow';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import VinDecoderForm from './components/VinDecoderForm';
import VinDecoderResult from './components/VinDecoderResult';

export default function VinDecoderPage() {
  const [result, setResult] = useState<DecodeVinOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<DecodeVinInput>({
    resolver: zodResolver(DecodeVinSchema),
    defaultValues: {
      vin: '',
    },
  });

  const onSubmit = async (data: DecodeVinInput) => {
    setIsLoading(true);
    setResult(null);
    try {
      const decodedResult = await decodeVin({ vin: data.vin.toUpperCase() });
      setResult(decodedResult);
      toast({
        title: "VIN Decode Complete",
        description: `Successfully decoded VIN: ${decodedResult.fullVin}`,
      });
    } catch (error) {
      console.error("Error decoding VIN:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Decoding VIN",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="VIN Decoder"
        description="Break down a Vehicle Identification Number into its component parts using AI."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <VinDecoderForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <VinDecoderResult result={result} isLoading={isLoading} />
        </div>
      </div>
    </AppLayout>
  );
}
