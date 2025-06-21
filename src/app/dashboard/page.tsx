
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RecentDocuments } from './components/RecentDocuments';
import { CoreFeatures } from './components/CoreFeatures';

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Dashboard"
        description="Welcome back! Here's a quick overview of your workspace."
      />
      <div className="space-y-8">
        <RecentDocuments />
        <CoreFeatures />
      </div>
    </AppLayout>
  );
}
