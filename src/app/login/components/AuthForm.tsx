
"use client";

import type { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from '@/components/shared/GoogleIcon';

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
    isGoogleLoading: boolean;
    buttonText: string;
    onPasswordReset: () => void;
    onGoogleSignIn: () => void;
}

export function AuthForm({ form, onSubmit, isLoading, isGoogleLoading, buttonText, onPasswordReset, onGoogleSignIn }: AuthFormProps) {
    const anyLoading = isLoading || isGoogleLoading;

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="name@company.com" {...field} disabled={anyLoading} />
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
                                        className="p-0 h-auto text-sm font-normal text-primary"
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
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={anyLoading}>
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Sign in with Google
            </Button>
        </div>
    );
}
