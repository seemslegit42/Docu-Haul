import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import StatCard from '../components/StatCard';
import { Users, DollarSign, FileText, BarChart } from 'lucide-react';

export default function AdminDashboardPage() {
  // In a real app, this data would come from a backend service.
  const stats = [
    { title: 'Total Revenue', value: '$1,250', icon: DollarSign, change: '+12.5%' },
    { title: 'Total Users', value: '431', icon: Users, change: '+5' },
    { title: 'Documents Generated', value: '2,890', icon: FileText, change: '+150' },
    { title: 'API Calls (24h)', value: '12,345', icon: BarChart, change: '-2.1%' },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Admin Dashboard"
        description="Overview of the application's activity and health."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        {/* Placeholder for more complex charts or tables */}
        <h2 className="text-xl font-semibold mb-4">More Analytics Coming Soon</h2>
        <div className="p-10 border border-dashed rounded-lg text-center text-muted-foreground">
            Revenue charts and user growth graphs will be displayed here.
        </div>
      </div>
    </AppLayout>
  );
}
