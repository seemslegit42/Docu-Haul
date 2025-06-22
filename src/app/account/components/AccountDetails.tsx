"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Star, Shield } from 'lucide-react';

export default function AccountDetails() {
  const { user, isPremium, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <AccountDetailsSkeleton />;
  }

  if (!user) {
    return null; // Or some other placeholder
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <User />
            Your Account
        </CardTitle>
        <CardDescription>
            This is your personal account information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Email Address</span>
            <p className="font-semibold">{user.email}</p>
        </div>
        <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Subscription Plan</span>
             <div className="flex items-center gap-2">
                {isPremium ? <Star className="w-5 h-5 text-yellow-400" /> : <Shield className="w-5 h-5 text-muted-foreground" />}
                <p className="font-semibold">{isPremium ? "Premium" : "Standard"}</p>
                {isAdmin && <Badge variant="destructive">Admin</Badge>}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}


function AccountDetailsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-1/3" />
                </div>
            </CardContent>
        </Card>
    )
}
