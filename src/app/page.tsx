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
        description="Your intelligent solution for transport documentation and compliance."
      />
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Get Started</CardTitle>
            <CardDescription className="font-body">
              Navigate through our powerful tools to streamline your vehicle processing tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-body mb-6">
              DocuHaul leverages cutting-edge AI to help you generate compliant documentation and labels effortlessly. Explore the features below:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FileText className="w-8 h-8 text-primary" />}
                title="Smart Docs"
                description="AI-powered document generation based on vehicle and cargo specs."
                href="/smart-docs"
              />
              <FeatureCard
                icon={<Tags className="w-8 h-8 text-primary" />}
                title="Label Forge"
                description="Create compliant labels with AI-optimized information placement."
                href="/label-forge"
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                title="Compliance Check"
                description="Automated cross-validation and reporting for transport regulations."
                href="/compliance-check"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-body">
            <p><strong>1. Input Data:</strong> Provide vehicle, cargo, and shipment specifications.</p>
            <p><strong>2. AI Processing:</strong> Our GenAI models analyze your data and relevant standards.</p>
            <p><strong>3. Generate & Preview:</strong> Instantly create documents and labels. Preview and make edits as needed.</p>
            <p><strong>4. Ensure Compliance:</strong> Utilize the compliance checker for peace of mind.</p>
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
