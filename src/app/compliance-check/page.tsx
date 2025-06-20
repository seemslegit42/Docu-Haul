
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComplianceCheckSchema, type ComplianceCheckInput } from '@/lib/schemas';
import { checkCompliance, type CheckComplianceOutput } from '@/ai/flows/check-compliance-flow';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import ComplianceCheckForm from './components/ComplianceCheckForm';
import ComplianceReport from './components/ComplianceReport';

export default function ComplianceCheckPage() {
  const [result, setResult] = useState<CheckComplianceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ComplianceCheckInput>({
    resolver: zodResolver(ComplianceCheckSchema),
    defaultValues: {
      documentType: '',
      documentContent: '',
      targetRegulations: '',
      countryOfOperation: '',
    },
  });

  const onSubmit = async (data: ComplianceCheckInput) => {
    setIsLoading(true);
    setResult(null);
    try {
      const complianceResult = await checkCompliance(data);
      setResult(complianceResult);
      toast({
        title: "Compliance Check Complete",
        description: `Status for ${data.documentType}: ${complianceResult.complianceStatus}`,
      });
    } catch (error) {
      console.error("Error performing compliance check:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Performing Check",
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
        title="Compliance Checker"
        description="AI-powered validation for your VIN labels, NVIS certificates, and Bills of Sale."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComplianceCheckForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
        <ComplianceReport result={result} isLoading={isLoading} />
      </div>
    </AppLayout>
  );
}
