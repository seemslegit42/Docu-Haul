
import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import { AuthAwareButton } from '@/components/layout/AuthAwareButton';
import PricingCard from './components/PricingCard';

const premiumFeatures = [
    "AI-Powered Label Forge",
    "NVIS & Bill of Sale Generation",
    "VIN Decoder Access",
    "Document Compliance Check",
    "Full Document History & Management",
    "Advanced Label Templates",
    "Save & Download All Documents",
    "Priority Support",
];

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center gap-2">
                    <FileCheck2 className="w-7 h-7 text-primary" />
                    <span className="font-headline text-xl font-bold text-primary tracking-tight">DocuHaul</span>
                </Link>
                <nav className="ml-auto flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Login
                    </Link>
                    <AuthAwareButton text="Go to App" />
                </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <section className="py-16 md:py-24">
                <div className="container text-center">
                    <h1 className="text-4xl font-headline font-extrabold tracking-tighter sm:text-5xl">
                        Unlock Full Access
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                        A simple one-time payment unlocks all features of DocuHaul, with no hidden fees or recurring subscriptions.
                    </p>
                </div>

                <div className="container mt-12 flex justify-center">
                    <div className="w-full max-w-md">
                         <PricingCard
                            planName="Premium Access"
                            price="$49"
                            priceDescription="one-time payment"
                            features={premiumFeatures}
                            ctaText="Get Premium Access"
                            ctaSubtext="Unlock all features instantly."
                            isFeatured={true}
                        />
                    </div>
                </div>
                </section>
            </main>

             {/* Footer */}
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
