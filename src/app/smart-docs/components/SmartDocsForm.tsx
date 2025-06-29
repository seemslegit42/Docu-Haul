
"use client";

import type { UseFormReturn } from 'react-hook-form';
import type { SmartDocsInput } from '@/lib/schemas';
import { DOCUMENT_TYPES, SMART_DOCS_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText } from 'lucide-react';

interface SmartDocsFormProps {
  form: UseFormReturn<SmartDocsInput>;
  onSubmit: (data: SmartDocsInput) => void;
  isLoading: boolean;
}

export default function SmartDocsForm({ form, onSubmit, isLoading }: SmartDocsFormProps) {
  const watchedDocumentType = form.watch('documentType');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Details</CardTitle>
        <CardDescription className="font-body">Choose a document type and provide the necessary details. The AI will generate a complete NVIS or Bill of Sale.</CardDescription>
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
                      {SMART_DOCS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value} className="font-body">{option.label}</SelectItem>
                      ))}
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
                    <Input placeholder="Enter 17-character VIN" {...field} className="font-body text-sm"/>
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
                    {watchedDocumentType === DOCUMENT_TYPES.BILL_OF_SALE ? 'Supplemental Details' : 'Supplemental Specifications'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any details to supplement or override the standard vehicle info."
                      {...field} 
                      rows={5} 
                      className="font-body text-sm"
                    />
                  </FormControl>
                    <FormDescription className="font-body text-xs">
                      The AI agent will look up base vehicle data using the VIN. Use this field for specifics like buyer/seller info, sale price, or to override auto-populated data.
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
  );
}
