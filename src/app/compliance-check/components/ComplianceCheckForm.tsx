
"use client";

import type { UseFormReturn } from 'react-hook-form';
import type { ComplianceCheckInput } from '@/lib/schemas';
import { COMPLIANCE_CHECK_DOC_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ComplianceCheckFormProps {
  form: UseFormReturn<ComplianceCheckInput>;
  onSubmit: (data: ComplianceCheckInput) => void;
  isLoading: boolean;
}

export default function ComplianceCheckForm({ form, onSubmit, isLoading }: ComplianceCheckFormProps) {
  return (
    <Card>
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
                      {COMPLIANCE_CHECK_DOC_TYPES.map(option => (
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
                  <FormLabel className="font-headline">Target Regulations/Standards</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., FMVSS Part 567, State titling laws" {...field} className="font-body"/>
                  </FormControl>
                  <FormDescription className="font-body text-xs">
                    Specify the regulations relevant to the document type.
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
                    <Input placeholder="e.g., USA, Canada (or specific state/province)" {...field} className="font-body"/>
                  </FormControl>
                  <FormDescription className="font-body text-xs">
                    This helps tailor the compliance check.
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
  );
}
