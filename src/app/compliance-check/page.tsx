"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComplianceCheckSchema, type ComplianceCheckInput } from '@/lib/schemas';
import { checkCompliance, type CheckComplianceOutput } from '@/ai/flows/check-compliance-flow';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const documentTypeOptions = [
  { value: "VIN Label", label: "VIN Label" },
  { value: "Shipping Manifest", label: "Shipping Manifest" },
  { value: "Customs Declaration", label: "Customs Declaration" },
  { value: "Vehicle Registration", label: "Vehicle Registration" },
  { value: "Bill of Lading", label: "Bill of Lading" },
  { value: "Other Vehicle Document", label: "Other Vehicle Document" },
];

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

  const onSubmit: SubmitHandler<ComplianceCheckInput> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
      const complianceResult = await checkCompliance(data);
      setResult(complianceResult);
      toast({
        title: "Compliance Check Complete",
        description: `Status: ${complianceResult.complianceStatus}`,
      });
    } catch (error) {
      console.error("Error performing compliance check:", error);
      let errorMessage = "Failed to perform compliance check. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error Performing Check",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return <ShieldCheck className="w-7 h-7 text-muted-foreground mr-2" />;
    if (status.toLowerCase().includes("compliant")) return <CheckCircle2 className="w-7 h-7 text-green-500 mr-2" />;
    if (status.toLowerCase().includes("potential issues") || status.toLowerCase().includes("needs review")) return <AlertTriangle className="w-7 h-7 text-yellow-500 mr-2" />;
    if (status.toLowerCase().includes("non-compliant")) return <AlertTriangle className="w-7 h-7 text-red-500 mr-2" />;
    return <ShieldCheck className="w-7 h-7 text-primary mr-2" />;
  };


  return (
    <AppLayout>
      <PageHeader 
        title="Compliance Checker"
        description="AI-powered analysis of your documents against transport regulations."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Compliance Input</CardTitle>
            <CardDescription className="font-body">Provide document details for AI compliance analysis.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-body">
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value} className="font-body">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">Document Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Paste the full text content of the document here..." {...field} rows={6} className="font-body"/>
                      </FormControl>
                      <FormDescription className="font-body text-xs">
                        Ensure all relevant text from the document is included for accurate analysis.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetRegulations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">Target Regulations</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., FMVSS Part 567, 49 CFR, ADR Chapter 5.3" {...field} className="font-body"/>
                      </FormControl>
                      <FormDescription className="font-body text-xs">
                        Specify the regulations or standards to check against.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="countryOfOperation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">Country/Region of Operation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., USA, European Union, Canada" {...field} className="font-body"/>
                      </FormControl>
                      <FormDescription className="font-body text-xs">
                        This helps tailor the compliance check to relevant jurisdictions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Check Compliance
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              {getStatusIcon(result?.complianceStatus)}
              Compliance Report
            </CardTitle>
            <CardDescription className="font-body">AI-generated compliance analysis and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-body mt-2">Analyzing compliance...</p>
              </div>
            )}
            {!isLoading && result && (
              <>
                <div>
                  <h4 className="font-headline text-lg text-primary">Overall Status:</h4>
                  <p className="font-body text-md font-semibold p-2 bg-muted/30 rounded-md border">
                    {result.complianceStatus}
                  </p>
                </div>
                <div>
                  <h4 className="font-headline text-lg text-primary mt-4">Detailed Findings:</h4>
                  <ScrollArea className="h-96 w-full rounded-md border p-3 bg-background">
                    <pre className="font-body text-sm text-muted-foreground whitespace-pre-wrap">
                      {result.complianceReport}
                    </pre>
                  </ScrollArea>
                </div>
              </>
            )}
            {!isLoading && !result && (
               <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex items-center justify-center">
                Your compliance report will appear here after submitting the details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
