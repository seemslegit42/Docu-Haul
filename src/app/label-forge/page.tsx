
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LabelForgeSchema, type LabelForgeInput } from '@/lib/schemas';
import { createCompliantVinLabel, type VinLabelData } from '@/ai/flows/create-compliant-vin-label';
import { addGeneratedDocument } from '@/lib/firestore';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PaywallPrompt } from '@/components/layout/PaywallPrompt';
import { Skeleton } from '@/components/ui/skeleton';
import LabelForgeForm from './components/LabelForgeForm';
import GeneratedLabel from './components/GeneratedLabel';

export default function LabelForgePage() {
  const [generatedLabelData, setGeneratedLabelData] = useState<VinLabelData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, isPremium, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const labelRef = useRef<HTMLDivElement>(null);

  const form = useForm<LabelForgeInput>({
    resolver: zodResolver(LabelForgeSchema),
    defaultValues: {
      template: 'standard',
      vinData: '',
      trailerSpecs: '',
      regulatoryStandards: '',
      labelDimensions: '4x2 inches',
    },
  });

  useEffect(() => {
    const vin = searchParams.get('vin');
    if (vin) {
      form.setValue('vinData', vin, { shouldValidate: true });
    }
  }, [searchParams, form]);


  const onSubmit = async (data: LabelForgeInput) => {
    setIsGenerating(true);
    setGeneratedLabelData(null);
    try {
      if (!user) {
        throw new Error("You must be logged in to perform this action.");
      }
      const authToken = await user.getIdToken();
      const result = await createCompliantVinLabel(data, authToken);
      
      setGeneratedLabelData(result);

      if (result.isVinValid) {
        toast({
          title: "Label Data Extracted",
          description: "The AI has successfully structured the data for your label.",
        });
      } else {
        toast({
          title: "VIN Validation Failed",
          description: result.placementRationale, // This contains the specific error message.
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating label data:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Generating Label Data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageDataUri = async (): Promise<string | undefined> => {
    if (!labelRef.current) {
        toast({ title: "Error", description: "Label component is not available.", variant: "destructive" });
        return;
    }
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(labelRef.current, { cacheBust: true, pixelRatio: 2 });
      return dataUrl;
    } catch (err) {
      console.error("Failed to generate image from component", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during image generation.";
      toast({
        title: "Error Generating Image",
        description: errorMessage,
        variant: "destructive",
      });
      return undefined;
    }
  };
  
  const handleSave = async () => {
    if (!user || !generatedLabelData) return;
    setIsSaving(true);
    try {
      const imageDataUri = await generateImageDataUri();
      if (!imageDataUri) {
        // Stop saving if image generation failed. The toast is handled in generateImageDataUri.
        setIsSaving(false);
        return;
      }

      await addGeneratedDocument({
        userId: user.uid,
        documentType: 'VIN Label',
        vin: form.getValues('vinData'),
        content: JSON.stringify(generatedLabelData.labelData, null, 2),
        imageDataUri: imageDataUri,
      });
      toast({
        title: "Label Saved",
        description: "Your VIN Label has been saved to your history.",
      });
    } catch (error) {
      console.error("Error saving label:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Saving Label",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    const imageDataUri = await generateImageDataUri();
    if (!imageDataUri) return;

    const link = document.createElement('a');
    link.href = imageDataUri;
    link.download = `vin_label_${form.getValues('vinData') || 'generated'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: `Label ${link.download} download initiated.` });
  };

  const handleCheckCompliance = () => {
    if (!generatedLabelData || !generatedLabelData.labelData) return;

    const documentContent = Object.entries(generatedLabelData.labelData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    const query = new URLSearchParams({
        documentType: 'VIN Label',
        documentContent: documentContent,
    }).toString();

    router.push(`/compliance-check?${query}`);
  };

  const renderContent = () => {
    if (isAuthLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      );
    }

    if (!isPremium) {
        return <PaywallPrompt />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabelForgeForm form={form} onSubmit={onSubmit} isLoading={isGenerating} />
            <GeneratedLabel 
                generatedData={generatedLabelData}
                template={form.watch('template')}
                labelRef={labelRef}
                isLoading={isGenerating} 
                isSaving={isSaving}
                onSave={handleSave}
                onDownload={handleDownload} 
                onCheckCompliance={handleCheckCompliance}
            />
        </div>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Label Forge"
        description="AI-powered VIN label creation with deterministic rendering for compliance."
      />
      {renderContent()}
    </AppLayout>
  );
}
