
import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import { AuthAwareButton } from '@/components/layout/AuthAwareButton';
import PricingCard from './components/PricingCard';

const standardFeatures = [
    "NVIS & Bill of Sale Generation",
    "VIN Decoder Access",
    "Document Compliance Check",
    "Full Document History",
    "Community Support",
];

const premiumFeatures = [
    "All Standard features, plus:",
    "AI-Powered Label Forge",
    "Advanced Label Templates",
    "Save & Download Custom Labels",
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
                        Find the Perfect Plan
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                        Choose the plan that best fits your needs. Start for free and upgrade anytime to unlock powerful premium features.
                    </p>
                </div>

                <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto items-start">
                    <PricingCard
                        planName="Standard"
                        price="Free"
                        priceDescription="For individuals and small teams"
                        features={standardFeatures}
                        ctaText="Get Started for Free"
                        ctaSubtext="No credit card required."
                    />
                     <PricingCard
                        planName="Premium"
                        price="$49"
                        priceDescription="one-time payment"
                        features={premiumFeatures}
                        ctaText="Upgrade to Premium"
                        ctaSubtext="Unlock the Label Forge and more."
                        isFeatured={true}
                    />
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
