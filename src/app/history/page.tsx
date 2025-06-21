
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import DocumentHistoryClient from './components/DocumentHistoryClient';

export default function DocumentHistoryPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Document History"
        description="View and manage all your previously generated documents."
      />
      <DocumentHistoryClient />
    </AppLayout>
  );
}
