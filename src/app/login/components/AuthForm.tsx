
"use client";

import type { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' }),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
    form: UseFormReturn<LoginFormValues>;
    onSubmit: (data: LoginFormValues) => void;
    isLoading: boolean;
    isOtherLoading: boolean;
    buttonText: string;
    onPasswordReset: () => void;
}

export function AuthForm({ form, onSubmit, isLoading, isOtherLoading, buttonText, onPasswordReset }: AuthFormProps) {
    const anyLoading = isLoading || isOtherLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{buttonText}</CardTitle>
                <CardDescription>Enter your credentials to continue to DocuHaul.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter your email" {...field} disabled={anyLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                      <FormLabel>Password</FormLabel>
                                      {buttonText === 'Login' && (
                                        <Button
                                          type="button"
                                          variant="link"
                                          className="p-0 h-auto text-sm font-normal"
                                          onClick={onPasswordReset}
                                          disabled={anyLoading || !form.getValues('email')}
                                        >
                                          Forgot Password?
                                        </Button>
                                      )}
                                    </div>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} disabled={anyLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={anyLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {buttonText}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
