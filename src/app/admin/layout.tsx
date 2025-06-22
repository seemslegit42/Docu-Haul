"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppLayout } from '@/components/layout/app-layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard'); // Redirect non-admins to the dashboard
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
        <AppLayout>
            <div className="flex items-center justify-center pt-20">
                <Alert variant="destructive" className="max-w-lg">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view this page. Redirecting...
                    </AlertDescription>
                </Alert>
            </div>
        </AppLayout>
    );
  }

  return <>{children}</>;
}
