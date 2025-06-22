
import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { AuthAwareButton } from '@/components/layout/AuthAwareButton';

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center gap-2">
                    <FileCheck2 className="w-7 h-7 text-primary" />
                    <span className="font-headline text-xl font-bold text-primary tracking-tight">DocuHaul</span>
                </Link>
                <nav className="ml-auto flex items-center gap-4">
                     <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Pricing
                    </Link>
                    <AuthAwareButton text="Go to App" />
                </nav>
                </div>
            </header>

            <main className="flex-1 py-12 md:py-16">
                <div className="container max-w-4xl mx-auto">
                    <PageHeader 
                        title="Privacy Policy"
                        description="Last updated: June 22, 2025"
                    />
                    <Card>
                        <CardContent className="pt-6 text-muted-foreground space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">1. Information We Collect</h2>
                                <p>We collect information you provide directly to us, such as when you create an account. This includes your email address. We also collect information about your use of our services, such as the documents you generate.</p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">2. How We Use Your Information</h2>
                                <p>We use the information we collect to provide, maintain, and improve our services, including to process transactions, develop new features, and provide customer support. We do not use the content of your generated documents to train our AI models.</p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">3. Information Sharing</h2>
                                <p>We do not share your personal information with third parties except as described in this Privacy Policy, such as to comply with a legal obligation, to protect and defend our rights or property, or with your consent.</p>
                            </div>
                             <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">4. Data Security</h2>
                                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration, and destruction.</p>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-semibold text-foreground">5. Your Choices</h2>
                                <p>You may update or correct your account information at any time by logging into your account. You may also delete your documents from your history page.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

             <footer className="border-t border-border/40">
                <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} DocuHaul. All rights reserved.
                </p>
                <div className="flex gap-4">
                    <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-primary">
                        Terms of Service
                    </Link>
                    <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-primary">
                        Privacy Policy
                    </Link>
                </div>
                </div>
            </footer>
        </div>
    );
}
