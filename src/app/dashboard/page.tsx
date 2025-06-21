
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureCard } from '@/components/shared/FeatureCard';
import { FileText, Tags, ShieldCheck, Hash } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Welcome to VINscribe" 
        description="AI-powered creation of VIN labels, NVIS certificates, and Bills of Sale for trailer and vehicle manufacturers."
      />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Focus on Essential Documents</CardTitle>
            <CardDescription className="font-body">
              VINscribe simplifies your document workflow by automating the generation and validation of critical vehicle documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-body mb-6">
              Leverage AI to effortlessly create, validate, and understand your key vehicle documents. Explore our core features:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                variant="link"
                icon={<FileText className="w-8 h-8 text-primary" />}
                title="Smart Docs"
                description="AI-powered generation of NVIS certificates and Bills of Sale."
                href="/smart-docs"
              />
              <FeatureCard
                variant="link"
                icon={<Tags className="w-8 h-8 text-primary" />}
                title="Label Forge"
                description="Create compliant VIN labels with AI-optimized content and layout."
                href="/label-forge"
              />
              <FeatureCard
                variant="link"
                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                title="Compliance Check"
                description="Automated validation of your documents against regulations."
                href="/compliance-check"
              />
              <FeatureCard
                variant="link"
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
            <CardTitle className="font-headline text-2xl">How VINscribe Works</CardTitle>
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
