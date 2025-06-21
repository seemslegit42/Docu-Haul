
"use client";

import type { UseFormReturn } from 'react-hook-form';
import type { LabelForgeInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Tags } from 'lucide-react';

interface LabelForgeFormProps {
  form: UseFormReturn<LabelForgeInput>;
  onSubmit: (data: LabelForgeInput) => void;
  isLoading: boolean;
}

export default function LabelForgeForm({ form, onSubmit, isLoading }: LabelForgeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Label Data Input</CardTitle>
        <CardDescription className="font-body">Enter the data for your VIN label. The AI will generate a compliant label image, using placeholders for any missing standard information.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="vinData"
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
                  <FormLabel className="font-headline">Trailer Specifications</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter all known vehicle and manufacturer specifications" 
                      {...field} 
                      rows={4} 
                      className="font-body"
                    />
                  </FormControl>
                  <FormDescription className="font-body text-xs">
                    Include details like GVWR, GAWRs, tire/rim specs, manufacturer, manufacture date, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="regulatoryStandards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline">Regulatory Standards (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter applicable standards" {...field} className="font-body"/>
                  </FormControl>
                    <FormDescription className="font-body text-xs">
                    If blank, a general compliance statement will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labelDimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline">Target Label Dimensions</FormLabel>
                  <FormControl>
                    <Input placeholder="Approximate physical dimensions" {...field} className="font-body"/>
                  </FormControl>
                    <FormDescription className="font-body text-xs">
                    e.g., "4x2 inches", "100x50mm". Helps the AI with layout.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
              Forge Label
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
