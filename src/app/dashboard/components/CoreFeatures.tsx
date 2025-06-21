
import { FeatureCard } from '@/components/shared/FeatureCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Tags, ShieldCheck, Hash, AppWindow } from 'lucide-react';

export function CoreFeatures() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <AppWindow className="w-6 h-6 text-primary" />
            <CardTitle>Core Features</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
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
  );
}
