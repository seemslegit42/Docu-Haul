
import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfServicePage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center gap-2">
                    <FileCheck2 className="w-7 h-7 text-primary" />
                    <span className="font-headline text-xl font-bold text-primary tracking-tight">DocuHaul</span>
                </Link>
                <nav className="flex-1 flex justify-end">
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                        Back to App
                    </Link>
                </nav>
                </div>
            </header>

            <main className="flex-1 py-12 md:py-16">
                <div className="container max-w-4xl mx-auto">
                    <PageHeader 
                        title="Terms of Service"
                        description="Last updated: June 22, 2025"
                    />
                    <Card>
                        <CardContent className="pt-6 text-muted-foreground space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">1. Introduction</h2>
                                <p>Welcome to DocuHaul. These Terms of Service ("Terms") govern your use of our website and services (collectively, "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">2. Use of Services</h2>
                                <p>You must use our Service in compliance with all applicable laws. You are responsible for your conduct and any data, text, information, and other content ("Content") that you submit, post, and display on the DocuHaul Service.</p>
                                <p>The AI-generated content is provided for informational purposes only and does not constitute legal or compliance advice. You are solely responsible for verifying the accuracy, completeness, and compliance of all generated documents with applicable laws and regulations. DocuHaul is not liable for any inaccuracies or non-compliance of documents generated through the Service.</p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">3. Accounts</h2>
                                <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                            </div>
                             <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">4. Termination</h2>
                                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">5. Limitation of Liability</h2>
                                <p>In no event shall DocuHaul, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                            </div>
                             <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">6. Changes</h2>
                                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
