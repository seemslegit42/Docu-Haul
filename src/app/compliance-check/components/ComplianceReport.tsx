
"use client";

import type { CheckComplianceOutput } from '@/ai/flows/check-compliance-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ComplianceReportProps {
  result: CheckComplianceOutput | null;
  isLoading: boolean;
}

export default function ComplianceReport({ result, isLoading }: ComplianceReportProps) {
  const getStatusIcon = (status?: string) => {
    if (!status) return <ShieldCheck className="w-7 h-7 text-muted-foreground mr-2" />;
    if (status.toLowerCase().includes("compliant")) return <CheckCircle2 className="w-7 h-7 text-success mr-2" />;
    if (status.toLowerCase().includes("potential issues") || status.toLowerCase().includes("needs review")) return <AlertTriangle className="w-7 h-7 text-warning mr-2" />;
    if (status.toLowerCase().includes("non-compliant")) return <AlertTriangle className="w-7 h-7 text-destructive mr-2" />;
    return <ShieldCheck className="w-7 h-7 text-primary mr-2" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          {getStatusIcon(result?.complianceStatus)}
          Compliance Report
        </CardTitle>
        <CardDescription className="font-body">AI-generated compliance analysis and recommendations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-body mt-2">Analyzing compliance...</p>
          </div>
        )}
        {!isLoading && result && (
          <>
            <div>
              <h4 className="font-headline text-lg text-primary">Overall Status:</h4>
              <p className="font-body text-md font-semibold p-2 bg-muted/30 rounded-md border">
                {result.complianceStatus}
              </p>
            </div>
            <div>
              <h4 className="font-headline text-lg text-primary mt-4">Detailed Findings:</h4>
              <ScrollArea className="h-96 w-full rounded-md border p-3 bg-background">
                <pre className="font-body text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.complianceReport}
                </pre>
              </ScrollArea>
            </div>
          </>
        )}
        {!isLoading && !result && (
          <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex items-center justify-center">
            Your compliance report will appear here after submitting the details.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
