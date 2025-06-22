"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './components/ProfileSettings';
import PasswordSettings from './components/PasswordSettings';
import BillingSettings from './components/BillingSettings';
import DangerZone from './components/DangerZone';

export default function AccountPage() {
    return (
        <AppLayout>
            <PageHeader 
                title="Account Settings"
                description="Manage your profile, password, subscription, and other settings."
            />
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full max-w-lg grid-cols-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="danger">Danger Zone</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-6">
                    <ProfileSettings />
                </TabsContent>
                 <TabsContent value="password" className="mt-6">
                    <PasswordSettings />
                </TabsContent>
                <TabsContent value="billing" className="mt-6">
                    <BillingSettings />
                </TabsContent>
                <TabsContent value="danger" className="mt-6">
                    <DangerZone />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
