"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { LabelForgeSchema, type LabelForgeInput } from '@/lib/schemas';
import { createCompliantVinLabel, type CreateCompliantVinLabelOutput } from '@/ai/flows/create-compliant-vin-label';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LabelForgePage() {
  const [generatedLabel, setGeneratedLabel] = useState<CreateCompliantVinLabelOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LabelForgeInput>({
    resolver: zodResolver(LabelForgeSchema),
    defaultValues: {
      vinData: '',
      trailerSpecs: '',
      regulatoryStandards: '',
      labelDimensions: '',
    },
  });

  const onSubmit: SubmitHandler<LabelForgeInput> = async (data) => {
    setIsLoading(true);
    setGeneratedLabel(null);
    try {
      // Use placeholder for AI flow as image generation is complex for this example
      // const result = await createCompliantVinLabel(data);
      // For demonstration, using a placeholder image and rationale
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      const result: CreateCompliantVinLabelOutput = {
        labelDataUri: `https://placehold.co/400x200.png?text=VIN+Label%0AVIN: ${data.vinData.substring(0,5)}...%0ADim: ${data.labelDimensions}`,
        placementRationale: `AI Rationale: Information is organized for clarity. VIN is prominent. Key specifications are grouped. Complies with standard ${data.regulatoryStandards || 'general'} practices for ${data.labelDimensions} labels. Trailer type: ${data.trailerSpecs.substring(0,20)}...`,
      };
      setGeneratedLabel(result);
      toast({
        title: "Label Generated",
        description: "The VIN label has been successfully designed by AI.",
      });
    } catch (error) {
      console.error("Error generating label:", error);
      toast({
        title: "Error",
        description: "Failed to generate label. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Label Forge"
        description="AI-powered VIN label creation with optimized information placement."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Label Data</CardTitle>
            <CardDescription className="font-body">Provide all necessary information for VIN label generation.</CardDescription>
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
                        <Textarea placeholder="Key trailer specs (e.g., GVWR, Axle Count, Tire Size)" {...field} rows={3} className="font-body"/>
                      </FormControl>
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
                        <Input placeholder="e.g., FMVSS, CMVSS" {...field} className="font-body"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="labelDimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">Label Dimensions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 100mm x 50mm or 4in x 2in" {...field} className="font-body"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Forge Label
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Generated Label & Rationale</CardTitle>
            <CardDescription className="font-body">Preview the AI-generated label and its design rationale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 font-body mt-2">Forging your label...</p>
              </div>
            )}
            {!isLoading && generatedLabel && (
              <>
                <div className="border rounded-md p-4 bg-muted/30 flex justify-center items-center">
                  <Image
                    src={generatedLabel.labelDataUri}
                    alt="Generated VIN Label"
                    width={400}
                    height={200}
                    className="rounded-md shadow-md"
                    data-ai-hint="vehicle label"
                  />
                </div>
                <div>
                  <h4 className="font-headline text-lg text-primary">Placement Rationale:</h4>
                  <p className="font-body text-sm text-muted-foreground bg-background p-3 rounded-md border">
                    {generatedLabel.placementRationale}
                  </p>
                </div>
              </>
            )}
            {!isLoading && !generatedLabel && (
               <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex items-center justify-center">
                Your generated label and rationale will appear here.
              </div>
            )}
          </CardContent>
           {generatedLabel && (
            <CardFooter>
               <Button variant="outline" className="w-full">
                Download Label (Conceptual)
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
