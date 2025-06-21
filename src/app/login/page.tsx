
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, FileCheck2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AuthForm, formSchema, type LoginFormValues } from './components/AuthForm';
import { GoogleIcon } from '@/components/shared/GoogleIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
                    <AuthForm 
                      form={form} 
                      onSubmit={onSubmit} 
                      isLoading={isLoading} 
                      isOtherLoading={isGoogleLoading} 
                      buttonText="Login"
                      onPasswordReset={handlePasswordReset}
                    />
                </TabsContent>
                <TabsContent value="signup">
                    <AuthForm 
                      form={form} 
                      onSubmit={onSubmit} 
                      isLoading={isLoading} 
                      isOtherLoading={isGoogleLoading} 
                      buttonText="Sign Up"
                      onPasswordReset={handlePasswordReset}
                    />
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
