'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileCheck2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.52 1.98-3.53 0-6.43-2.9-6.43-6.43s2.9-6.43 6.43-6.43c1.93 0 3.33.73 4.1 1.45l2.43-2.33C17.65 4.32 15.4 3 12.48 3c-5.26 0-9.52 4.29-9.52 9.52s4.26 9.52 9.52 9.52c2.82 0 4.96-.94 6.62-2.62 1.7-1.7 2.22-4.13 2.22-6.85 0-.5-.06-.92-.15-1.35H12.48z" fill="currentColor"/>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Success', description: 'Logged in successfully.' });
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Success', description: 'Account created successfully.' });
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
        toast({ title: 'Error', description: 'Firebase is not configured.', variant: 'destructive' });
        return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Success', description: 'Logged in successfully with Google.' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      let description = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        description = 'The sign-in process was cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = 'An account already exists with this email. Please sign in using the original method.';
      }
      toast({
        title: 'Google Sign-In Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  const anyLoading = isLoading || isGoogleLoading;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md">
             <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                <FileCheck2 className="w-8 h-8 text-primary" />
                <span className="font-headline text-2xl font-bold text-primary tracking-tight">DocuHaul</span>
            </Link>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" disabled={anyLoading}>Login</TabsTrigger>
                    <TabsTrigger value="signup" disabled={anyLoading}>Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <AuthForm form={form} onSubmit={onSubmit} isLoading={isLoading} isOtherLoading={isGoogleLoading} buttonText="Login" />
                </TabsContent>
                <TabsContent value="signup">
                    <AuthForm form={form} onSubmit={onSubmit} isLoading={isLoading} isOtherLoading={isGoogleLoading} buttonText="Sign Up" />
                </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={anyLoading}>
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Sign in with Google
            </Button>
        </div>
    </div>
  );
}

function AuthForm({ form, onSubmit, isLoading, isOtherLoading, buttonText }: { form: any, onSubmit: (data: LoginFormValues) => void, isLoading: boolean, isOtherLoading: boolean, buttonText: string }) {
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
                                        <Input type="email" placeholder="you@example.com" {...field} disabled={anyLoading} />
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
                                    <FormLabel>Password</FormLabel>
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