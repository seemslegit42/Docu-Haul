'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { LabelForgeInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
        <CardDescription className="font-body">
          Enter the data for your VIN label. The AI will generate a compliant label image, using
          placeholders for any missing standard information.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-headline">Label Template</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="standard" />
                        </FormControl>
                        <FormLabel className="font-normal">Standard US Label</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="bilingual_canadian" />
                        </FormControl>
                        <FormLabel className="font-normal">Bilingual Canadian Label</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="bilingual_rv_canadian" />
                        </FormControl>
                        <FormLabel className="font-normal">Bilingual RV (Tall)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="tire_and_loading" />
                        </FormControl>
                        <FormLabel className="font-normal">Tire & Loading Placard</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="multi_axle_heavy_duty" />
                        </FormControl>
                        <FormLabel className="font-normal">Multi-Axle Heavy Duty</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vinData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline">
                    Vehicle Identification Number (VIN)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 17-character VIN"
                      {...field}
                      className="font-body text-sm"
                    />
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
                      className="font-body text-sm"
                    />
                  </FormControl>
                  <FormDescription className="font-body text-xs">
                    Include details like GVWR, GAWRs, tire/rim specs, manufacturer, manufacture
                    date, etc.
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
                    <Input
                      placeholder="Enter applicable standards"
                      {...field}
                      className="font-body text-sm"
                    />
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
                    <Input
                      placeholder="Approximate physical dimensions"
                      {...field}
                      className="font-body text-sm"
                    />
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
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Tags className="mr-2 h-4 w-4" />
              )}
              Forge Label
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
