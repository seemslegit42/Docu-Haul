
"use client";

import type { UseFormReturn } from 'react-hook-form';
import type { DecodeVinInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Hash } from 'lucide-react';

interface VinDecoderFormProps {
  form: UseFormReturn<DecodeVinInput>;
  onSubmit: (data: DecodeVinInput) => void;
  isLoading: boolean;
}

export default function VinDecoderForm({ form, onSubmit, isLoading }: VinDecoderFormProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>VIN Input</CardTitle>
        <CardDescription className="font-body">Enter a 17-digit VIN to decode its structure based on standard trailer formats.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline">Vehicle Identification Number (VIN)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 17-character VIN" {...field} className="font-mono uppercase"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
              Decode VIN
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
