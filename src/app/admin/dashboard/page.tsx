"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getDashboardStats, type DashboardStats } from '@/ai/flows/admin-flows';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import StatCard from '../components/StatCard';
import { Users, FileText, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: adminUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!adminUser) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const authToken = await adminUser.getIdToken();
        const result = await getDashboardStats({}, authToken);
        setStats(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        toast({
          title: "Error Fetching Stats",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [adminUser, toast]);

  return (
    <AppLayout>
      <PageHeader 
        title="Admin Dashboard"
        description="Live overview of the application's activity and user base."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Users" 
              value={stats?.totalUsers.toString() || '0'} 
              icon={Users} 
            />
            <StatCard 
              title="Premium Users" 
              value={stats?.premiumUsers.toString() || '0'} 
              icon={Star} 
            />
            <StatCard 
              title="Documents Generated" 
              value={stats?.totalDocuments.toString() || '0'} 
              icon={FileText} 
            />
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">More Analytics Coming Soon</h2>
        <div className="p-10 border border-dashed rounded-lg text-center text-muted-foreground">
            Revenue charts and user growth graphs will be displayed here.
        </div>
      </div>
    </AppLayout>
  );
}
