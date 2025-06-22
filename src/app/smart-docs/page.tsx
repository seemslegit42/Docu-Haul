
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SmartDocsSchema, type SmartDocsInput } from '@/lib/schemas';
import { generateDocumentation, type GenerateDocumentationOutput } from '@/ai/flows/generate-documentation';
import { addGeneratedDocument } from '@/lib/firestore';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import SmartDocsForm from './components/SmartDocsForm';
import GeneratedDocument from './components/GeneratedDocument';
import { PaywallPrompt } from '@/components/layout/PaywallPrompt';
import { Skeleton } from '@/components/ui/skeleton';

export default function SmartDocsPage() {
  const [generatedDoc, setGeneratedDoc] = useState<GenerateDocumentationOutput | null>(null);
  const [editableDocText, setEditableDocText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isPremium, isLoading: isAuthLoading } = useAuth();

  const form = useForm<SmartDocsInput>({
    resolver: zodResolver(SmartDocsSchema),
    defaultValues: {
      vin: '',
      trailerSpecs: '', 
      documentType: 'NVIS',
      tone: 'professional',
    },
  });

  useEffect(() => {
    const vin = searchParams.get('vin');
    if (!vin) return;

    // Set the VIN from the query parameters
    form.setValue('vin', vin, { shouldValidate: true });
    
    // Construct a helpful pre-fill string for the user
    const modelYear = searchParams.get('modelYear');
    const axles = searchParams.get('axles');
    
    const prefillDetails = [];
    if (modelYear) prefillDetails.push(`Year: ${modelYear}`);
    if (axles) prefillDetails.push(`Number of Axles: ${axles}`);

    if (prefillDetails.length > 0) {
        // Pre-fill the trailer specs with decoded VIN info for user convenience
        const newSpecsContent = `--- Pre-filled from VIN Decoder ---\n${prefillDetails.join('\n')}\n--- Please add more details below ---\n`;
        form.setValue('trailerSpecs', newSpecsContent, { shouldValidate: true });
    }

  }, [searchParams, form]);

  const onSubmit = async (data: SmartDocsInput) => {
    setIsLoading(true);
    setGeneratedDoc(null);
    setEditableDocText('');

    try {
      if (!user) {
        throw new Error("You must be logged in to perform this action.");
      }
      const authToken = await user.getIdToken();
      const result = await generateDocumentation(data, authToken);
      setGeneratedDoc(result);
      setEditableDocText(result.documentText);
      toast({
        title: `${data.documentType} Generated Successfully`,
        description: `The ${data.documentType === 'NVIS' ? 'NVIS certificate' : 'Bill of Sale'} has been created.`,
      });
    } catch (error) {
      console.error("Error generating documentation:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Generating Document",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedDoc || !editableDocText.trim()) return;
    setIsSaving(true);
    try {
      await addGeneratedDocument({
        userId: user.uid,
        documentType: form.getValues('documentType'),
        vin: form.getValues('vin'),
        content: editableDocText.trim(),
      });
      toast({
        title: "Document Saved",
        description: "Your document has been saved to your history.",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Saving Document",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableDocText(e.target.value);
  };

  const handleTxtDownload = () => {
    if (!editableDocText.trim() || !generatedDoc) return;

    const selectedDocType = form.getValues('documentType');
    const vin = form.getValues('vin') || 'document';
    const filename = `${selectedDocType}_${vin}.txt`;
    
    const blob = new Blob([editableDocText.trim()], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); 
    
    toast({
      title: "Download Started",
      description: `${filename} is being downloaded.`,
    });
  };

  const handlePdfDownload = async () => {
    if (!editableDocText.trim() || !generatedDoc) return;

    const { default: jsPDF } = await import('jspdf');

    const selectedDocType = form.getValues('documentType');
    const vin = form.getValues('vin') || 'document';
    const filename = `${selectedDocType}_${vin}.pdf`;

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(editableDocText.trim(), 180);
    doc.text(lines, 15, 20);
    doc.save(filename);

    toast({
      title: "PDF Download Started",
      description: `${filename} is being downloaded.`,
    });
  };

  const handleCheckCompliance = () => {
    if (!generatedDoc || !editableDocText.trim()) return;

    const docType = form.getValues('documentType');
    const docContent = editableDocText.trim();
    
    // Map from internal enum to user-facing string for compliance form
    const complianceDocType = docType === 'NVIS' ? 'NVIS Certificate' : 'Bill of Sale';

    const query = new URLSearchParams({
        documentType: complianceDocType,
        documentContent: docContent,
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
      return <PaywallPrompt 
        title="Smart Docs is a Premium Feature" 
        description="Instantly generate NVIS certificates and Bills of Sale by upgrading your plan." 
      />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SmartDocsForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
        <GeneratedDocument
          isLoading={isLoading}
          generatedDoc={generatedDoc}
          editableDocText={editableDocText}
          isSaving={isSaving}
          onTextChange={handleTextChange}
          onSave={handleSave}
          onTxtDownload={handleTxtDownload}
          onPdfDownload={handlePdfDownload}
          onCheckCompliance={handleCheckCompliance}
        />
      </div>
    );
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Smart Docs: NVIS & Bills of Sale"
        description="AI-powered generation of New Vehicle Information Statements (NVIS) and Bills of Sale."
      />
      {renderContent()}
    </AppLayout>
  );
}
