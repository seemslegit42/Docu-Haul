
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Tags, ShieldCheck, Hash } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Welcome to DocuHaul" 
        description="AI-powered creation of VIN labels, NVIS certificates, and Bills of Sale for trailer and vehicle manufacturers."
      />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Focus on Essential Documents</CardTitle>
            <CardDescription className="font-body">
              DocuHaul simplifies your document workflow by automating the generation and validation of critical vehicle documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-body mb-6">
              Leverage AI to effortlessly create, validate, and understand your key vehicle documents. Explore our core features:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<FileText className="w-8 h-8 text-primary" />}
                title="Smart Docs"
                description="AI-powered generation of NVIS certificates and Bills of Sale."
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
                description="Automated validation of your documents against regulations."
                href="/compliance-check"
              />
              <FeatureCard
                icon={<Hash className="w-8 h-8 text-primary" />}
                title="VIN Decoder"
                description="Break down and understand the structure of any VIN."
                href="/vin-decoder"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">How DocuHaul Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-body">
            <p><strong>1. Input Data:</strong> Provide essential vehicle and transaction specifications.</p>
            <p><strong>2. AI Processing:</strong> Our GenAI models analyze your data to generate accurate VIN labels, NVIS certificates, or Bills of Sale.</p>
            <p><strong>3. Generate & Validate:</strong> Instantly create your documents. Use our tools to decode VINs and cross-validate for compliance.</p>
            <p><strong>4. Manage & Deliver:</strong> Access, download, and manage all your generated documents in one centralized platform.</p>
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
    <Link href={href} className="group block">
      <Card className="h-full group-hover:border-primary group-hover:bg-muted/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-4">
          {icon}
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-body mb-4 min-h-[40px]">{description}</p>
          <div className="text-sm font-semibold text-primary flex items-center gap-2">
            Go to {title}
            <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">&rarr;</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
