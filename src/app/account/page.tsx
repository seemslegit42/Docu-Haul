"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import AccountDetails from './components/AccountDetails';
import UpgradeToPremium from './components/UpgradeToPremium';
import { useAuth } from '@/hooks/use-auth';

export default function AccountPage() {
    const { isPremium } = useAuth();
    
    return (
        <AppLayout>
            <PageHeader 
                title="Account Management"
                description="Manage your profile, subscription, and settings."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AccountDetails />
                </div>
                {!isPremium && (
                    <div className="lg:col-span-1">
                        <UpgradeToPremium />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
