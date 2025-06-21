
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck2, AlertTriangle } from 'lucide-react';
import { AuthForm, formSchema, type LoginFormValues } from './components/AuthForm';

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please try logging in.';
    case 'auth/weak-password':
      return 'The password is too weak. It must be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in process was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Please sign in using the original method you used.';
    case 'auth/too-many-requests':
        return 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
    default:
      return 'An unexpected authentication error occurred. Please try again.';
  }
};


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
    if (!auth) {
        toast({ title: 'Configuration Error', description: 'Authentication is not configured.', variant: 'destructive' });
        return;
    }
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
      console.error("Auth Error:", error.code, error.message);
      const description = getAuthErrorMessage(error.code);
      toast({
        title: 'Authentication Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
        toast({ title: 'Configuration Error', description: 'Authentication is not configured.', variant: 'destructive' });
        return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Success', description: 'Logged in successfully with Google.' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.code, error.message);
      const description = getAuthErrorMessage(error.code);
      toast({
        title: 'Google Sign-In Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth) return;
    const email = form.getValues('email');
    if (!email) {
      form.setError('email', { type: 'manual', message: 'Please enter your email to receive a reset link.' });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox.`,
      });
    } catch (error: any) {
      console.error('Password Reset Error:', error.code, error.message);
      const description = getAuthErrorMessage(error.code);
      toast({
        title: 'Password Reset Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const anyLoading = isLoading || isGoogleLoading;

  if (!auth) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive" />
                        Authentication Not Configured
                    </CardTitle>
                    <CardDescription>
                        The application's authentication service is currently unavailable. This is likely due to missing configuration settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        If you are the administrator, please ensure that the Firebase client-side configuration variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) are set correctly in your environment file. Please refer to the `README.md` for setup instructions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <main className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="relative hidden h-full lg:block">
          <Image
              src="https://placehold.co/1920x1080.png"
              alt="A stylized image of vehicle blueprints or a manufacturing plant"
              data-ai-hint="vehicle blueprints manufacturing"
              width={1920}
              height={1080}
              className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-background/20" />
          <div className="absolute bottom-10 left-10 text-white">
              <h1 className="font-headline text-4xl font-bold">DocuHaul</h1>
              <p className="max-w-md mt-2 text-lg">
                  Streamline Your Vehicle Documentation. Fast, Compliant, and AI-Powered.
              </p>
          </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
           <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <FileCheck2 className="w-8 h-8 text-primary" />
              <span className="font-headline text-3xl font-bold text-primary tracking-tight">DocuHaul</span>
            </Link>
            <p className="text-muted-foreground">
                {activeTab === 'login' ? 'Welcome back! Please sign in to your account.' : 'Create an account to get started.'}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login" disabled={anyLoading}>Login</TabsTrigger>
                        <TabsTrigger value="signup" disabled={anyLoading}>Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="mt-6">
                        <AuthForm 
                        form={form} 
                        onSubmit={onSubmit} 
                        isLoading={isLoading} 
                        isGoogleLoading={isGoogleLoading}
                        buttonText="Login"
                        onPasswordReset={handlePasswordReset}
                        onGoogleSignIn={handleGoogleSignIn}
                        />
                    </TabsContent>
                    <TabsContent value="signup" className="mt-6">
                        <AuthForm 
                        form={form} 
                        onSubmit={onSubmit} 
                        isLoading={isLoading} 
                        isGoogleLoading={isGoogleLoading} 
                        buttonText="Sign Up"
                        onPasswordReset={handlePasswordReset}
                        onGoogleSignIn={handleGoogleSignIn}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </div>
    </div>
    </main>
  );
}
