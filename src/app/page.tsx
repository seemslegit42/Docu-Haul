import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Tags, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Welcome to DocuHaul" 
        description="AI-powered document logistics automating creation, validation, and delivery of transport & compliance documents for trailer and vehicle manufacturers."
      />
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Streamline Your Documentation</CardTitle>
            <CardDescription className="font-body">
              DocuHaul automates VIN labels, NVIS certificates, customs forms, and more — all in one click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-body mb-6">
              Leverage AI to effortlessly create, validate, and manage your critical transport and compliance documents. Explore our core features:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FileText className="w-8 h-8 text-primary" />}
                title="Smart Docs"
                description="AI-powered generation for a variety of transport documents."
                href="/smart-docs"
              />
              <FeatureCard
                icon={<Tags className="w-8 h-8 text-primary" />}
                title="Label Forge"
                description="Create compliant VIN labels with AI-optimized content and layout."
                href="/label-forge"
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                title="Compliance Check"
                description="Automated validation of documents against transport regulations."
                href="/compliance-check"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">How DocuHaul Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-body">
            <p><strong>1. Input Data:</strong> Provide essential vehicle, manufacturer, and shipment specifications.</p>
            <p><strong>2. AI Processing:</strong> Our GenAI models analyze your data, select appropriate templates, and populate documents according to regulatory standards.</p>
            <p><strong>3. Generate & Validate:</strong> Instantly create documents like VIN labels, NVIS certificates, and customs forms. AI cross-validates for compliance.</p>
            <p><strong>4. Deliver & Manage:</strong> Access, download, and manage all your generated documents in one centralized platform.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground font-body mb-4">{description}</p>
        <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Link href={href}>Go to {title}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
