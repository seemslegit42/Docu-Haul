
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DecodeVinSchema, type DecodeVinInput } from '@/lib/schemas';
import { decodeVin, type DecodeVinOutput } from '@/ai/flows/decode-vin-flow';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import VinDecoderForm from './components/VinDecoderForm';
import VinDecoderResult from './components/VinDecoderResult';
import { PaywallPrompt } from '@/components/layout/PaywallPrompt';
import { Skeleton } from '@/components/ui/skeleton';

export default function VinDecoderPage() {
  const [result, setResult] = useState<DecodeVinOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isPremium, isLoading: isAuthLoading } = useAuth();

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
      if (!user) {
        throw new Error("You must be logged in to perform this action.");
      }
      const authToken = await user.getIdToken();
      const decodedResult = await decodeVin({ vin: data.vin.toUpperCase() }, authToken);
      setResult(decodedResult);

      if (decodedResult.isValid) {
        toast({
          title: "VIN Decode Complete",
          description: `Successfully decoded VIN ending in ...${decodedResult.decodedData?.sequentialNumber.value}.`,
        });
      } else {
         toast({
          title: "VIN Decode Failed",
          description: decodedResult.error || "An unknown validation error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // This catch block now only handles unexpected errors, like network issues or auth failures.
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

  const renderContent = () => {
    if (isAuthLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Skeleton className="h-[250px] w-full lg:col-span-1" />
          <Skeleton className="h-[500px] w-full lg:col-span-2" />
        </div>
      );
    }

    if (!isPremium) {
      return <PaywallPrompt
        title="VIN Decoder is a Premium Feature"
        description="Break down and understand any VIN by upgrading to our premium plan."
      />;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <VinDecoderForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <VinDecoderResult result={result} isLoading={isLoading} />
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <PageHeader 
        title="VIN Decoder"
        description="Break down a Vehicle Identification Number into its component parts using AI."
      />
      {renderContent()}
    </AppLayout>
  );
}
