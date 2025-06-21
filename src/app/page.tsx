
import Link from 'next/link';
import Image from 'next/image';
import { FileCheck2, Tags, ShieldCheck, Hash } from 'lucide-react';
import { AuthAwareButton } from '@/components/layout/AuthAwareButton';
import { FeatureCard } from '@/components/shared/FeatureCard';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileCheck2 className="w-7 h-7 text-primary" />
            <span className="font-headline text-xl font-bold text-primary tracking-tight">DocuHaul</span>
          </Link>
          <nav className="flex-1 flex justify-end">
            <AuthAwareButton text="Go to App" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#2d4168_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>

          <div className="container text-center">
              <div>
                <h1 className="text-4xl font-headline font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Reimagine Vehicle Documentation
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                  DocuHaul leverages Generative AI to automate the creation, validation, and management of essential vehicle documents. Save time, ensure compliance, and streamline your workflow.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <AuthAwareButton text="Get Started Now" buttonProps={{ size: "lg" }} />
                </div>
              </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 bg-card/40">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-headline font-bold sm:text-4xl">Everything You Need for Vehicle Documentation</h2>
              <p className="mt-4 text-muted-foreground">
                From VIN labels to compliance checks, our AI-powered tools are designed for accuracy and efficiency.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<FileCheck2 className="w-10 h-10 mb-4 text-primary" />}
                title="Smart Docs"
                description="Instantly generate NVIS certificates and Bills of Sale from minimal input. Professional, accurate, and fast."
              />
              <FeatureCard
                icon={<Tags className="w-10 h-10 mb-4 text-primary" />}
                title="Label Forge"
                description="Create compliant VIN labels with AI-optimized layouts. The AI determines content placement for clarity and compliance."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-10 h-10 mb-4 text-primary" />}
                title="Compliance Check"
                description="Validate your documents against specific regulations. Get detailed reports and recommendations from our AI compliance expert."
              />
               <FeatureCard
                icon={<Hash className="w-10 h-10 mb-4 text-primary" />}
                title="VIN Decoder"
                description="Instantly break down any 17-digit VIN into its core components. Understand vehicle origins, specs, and more."
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
          <div className="font-headline text-lg font-bold text-primary">DocuHaul</div>
        </div>
      </footer>
    </div>
  );
}
