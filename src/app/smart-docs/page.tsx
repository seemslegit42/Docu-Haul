
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SmartDocsSchema, type SmartDocsInput } from '@/lib/schemas';
import { generateDocumentation, type GenerateDocumentationOutput } from '@/ai/flows/generate-documentation';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import SmartDocsForm from './components/SmartDocsForm';
import GeneratedDocument from './components/GeneratedDocument';

export default function SmartDocsPage() {
  const [generatedDoc, setGeneratedDoc] = useState<GenerateDocumentationOutput | null>(null);
  const [editableDocText, setEditableDocText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SmartDocsInput>({
    resolver: zodResolver(SmartDocsSchema),
    defaultValues: {
      vin: '',
      trailerSpecs: '', 
      documentType: 'NVIS',
      tone: 'professional',
    },
  });

  const onSubmit = async (data: SmartDocsInput) => {
    setIsLoading(true);
    setGeneratedDoc(null);
    setEditableDocText('');

    try {
      const result = await generateDocumentation(data);
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableDocText(e.target.value);
  };

  const handleTxtDownload = () => {
    if (!editableDocText.trim() || !generatedDoc) return;

    const selectedDocType = form.getValues('documentType');
    const vin = form.getValues('vin') || 'document';
    const filename = `${selectedDocType}_${vin}.txt`;
    
    const blob = new Blob([editableDocText.trim()], { type: 'text/plain;charset=utf-f' });
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

  const handlePdfDownload = () => {
    if (!editableDocText.trim() || !generatedDoc) return;

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

  return (
    <AppLayout>
      <PageHeader 
        title="Smart Docs: NVIS & Bills of Sale"
        description="AI-powered generation of New Vehicle Information Statements (NVIS) and Bills of Sale."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SmartDocsForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
        <GeneratedDocument
          isLoading={isLoading}
          generatedDoc={generatedDoc}
          editableDocText={editableDocText}
          onTextChange={handleTextChange}
          onTxtDownload={handleTxtDownload}
          onPdfDownload={handlePdfDownload}
        />
      </div>
    </AppLayout>
  );
}
