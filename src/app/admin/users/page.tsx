import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import UserManagementClient from './components/UserManagementClient';

export default function UserManagementPage() {
  return (
    <AppLayout>
      <PageHeader
        title="User Management"
        description="View and manage all registered users."
      />
      <UserManagementClient />
    </AppLayout>
  );
}
