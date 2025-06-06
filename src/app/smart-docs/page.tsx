
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SmartDocsSchema, type SmartDocsInput } from '@/lib/schemas';
import { generateDocumentation, type GenerateDocumentationOutput } from '@/ai/flows/generate-documentation';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, FileText, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';


export default function SmartDocsPage() {
  const [generatedDoc, setGeneratedDoc] = useState<GenerateDocumentationOutput | null>(null);
  const [editableDocText, setEditableDocText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
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

  const onSubmit: SubmitHandler<SmartDocsInput> = async (data) => {
    setIsLoading(true);
    setGeneratedDoc(null);
    setEditableDocText('');
    setAiError(null);
    try {
      const result = await generateDocumentation(data);
      if (result.documentText.startsWith("ERROR:")) {
        setAiError(result.documentText);
        setGeneratedDoc(null); 
        setEditableDocText(''); 
      } else {
        setGeneratedDoc(result);
        setEditableDocText(result.documentText);
        setAiError(null);
      }
      toast({
        title: result.documentText.startsWith("ERROR:") ? "Document Generation Failed" : `${data.documentType} Generated`,
        description: result.documentText.startsWith("ERROR:") ? "The AI encountered an issue. Please check the error message." : `The ${data.documentType === 'NVIS' ? 'NVIS certificate' : 'Bill of Sale'} has been successfully generated.`,
        variant: result.documentText.startsWith("ERROR:") ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Error generating documentation:", error);
      setGeneratedDoc(null); 
      setEditableDocText(''); 
      let errorMessage = "Failed to generate documentation. Please try again or check your input.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setAiError(errorMessage); 
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

  const handleDownload = () => {
    if (!editableDocText || !generatedDoc || aiError) return;

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

  const handlePdfDownload = () => {
    if (!editableDocText || !generatedDoc || aiError) return;

    const selectedDocType = form.getValues('documentType');
    const vin = form.getValues('vin') || 'document';
    const filename = `${selectedDocType}_${vin}.pdf`;

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    // Split text into lines and add to PDF, handling basic wrapping
    const lines = doc.splitTextToSize(editableDocText.trim(), 180); // 180 is approx width in mm for A4
    doc.text(lines, 15, 20); // 15mm left margin, 20mm top margin
    doc.save(filename);

    toast({
      title: "PDF Download Started",
      description: `${filename} is being downloaded.`,
    });
  };

  const watchedDocumentType = form.watch('documentType');

  return (
    <AppLayout>
      <PageHeader 
        title="Smart Docs: NVIS & Bills of Sale"
        description="AI-powered generation of New Vehicle Information Statements (NVIS) and Bills of Sale."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Document Details</CardTitle>
            <CardDescription className="font-body">Select document type and enter details for AI generation.</CardDescription>
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
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="font-body">
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NVIS" className="font-body">NVIS Certificate</SelectItem>
                          <SelectItem value="BillOfSale" className="font-body">Bill of Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">Vehicle Identification Number (VIN)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter 17-character VIN" {...field} className="font-body"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trailerSpecs" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">
                        {watchedDocumentType === 'BillOfSale' ? 'Transaction & Vehicle Details' : 'Trailer Specifications'}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            watchedDocumentType === 'BillOfSale' 
                              ? "e.g., Seller: John Doe, 123 Main St; Buyer: Jane Smith, 456 Oak Ave; Price: $5000; Vehicle: 2023 Utility Trailer. Provide as much detail as possible." 
                              : "e.g., Manufacturer: Acme Trailers, Model: UT-200, GVWR: 7000 lbs, Axles: 2, DOM: 03/2024. Provide comprehensive trailer details."
                          } 
                          {...field} 
                          rows={5} 
                          className="font-body"
                        />
                      </FormControl>
                       <FormDescription className="font-body text-xs">
                        {watchedDocumentType === 'BillOfSale' 
                              ? "Include seller/buyer names & addresses, sale price, date, and key vehicle info." 
                              : "Include manufacturer, model, GVWR, GAWRs, tire/rim specs, manufacture date, etc."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">Document Tone (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-body">
                            <SelectValue placeholder="Select document tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional" className="font-body">Professional / Formal</SelectItem>
                          <SelectItem value="legal" className="font-body">Legalistic</SelectItem>
                          <SelectItem value="friendly" className="font-body">Friendly / Casual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="font-body text-xs">
                        Defaults to Professional/Formal if not specified.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText />}
                  Generate Document
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Generated Document</CardTitle>
            <CardDescription className="font-body">Preview and edit the AI-generated document below. You can download it once generated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Generation Error</AlertTitle>
                <AlertDescription>
                  {aiError}
                </AlertDescription>
              </Alert>
            )}
            {isLoading && (
              <div className="flex flex-col justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-body mt-2">Generating document...</p>
              </div>
            )}
            {!isLoading && !aiError && generatedDoc && (
              <Textarea
                value={editableDocText}
                onChange={handleTextChange}
                rows={15}
                className="font-body w-full p-3 border rounded-md bg-background shadow-inner"
                placeholder="Generated document will appear here..."
              />
            )}
            {!isLoading && (aiError || !generatedDoc) && (
               <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex items-center justify-center">
                {aiError ? "Document generation failed. See error above." : "Your AI-generated NVIS or Bill of Sale will appear here after submitting the details."}
              </div>
            )}
          </CardContent>
          {generatedDoc && !isLoading && !aiError && (
            <CardFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
               <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDownload} 
                  disabled={!generatedDoc || !editableDocText.trim() || !!aiError}
                >
                <Download className="mr-2 h-4 w-4" />
                Download .txt
              </Button>
              <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handlePdfDownload} 
                  disabled={!generatedDoc || !editableDocText.trim() || !!aiError}
                >
                <Download className="mr-2 h-4 w-4" />
                Download .pdf
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
