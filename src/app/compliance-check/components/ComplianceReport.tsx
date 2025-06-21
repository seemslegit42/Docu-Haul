
"use client";

import type { CheckComplianceOutput } from '@/ai/flows/check-compliance-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ComplianceReportProps {
  result: CheckComplianceOutput | null;
  isLoading: boolean;
}

const StatusIconMap: Record<string, React.ReactNode> = {
    compliant: <CheckCircle2 className="w-7 h-7 text-success mr-2" />,
    "potential issues": <AlertTriangle className="w-7 h-7 text-warning mr-2" />,
    "needs review": <AlertTriangle className="w-7 h-7 text-warning mr-2" />,
    "non-compliant": <AlertTriangle className="w-7 h-7 text-destructive mr-2" />,
    default: <ShieldCheck className="w-7 h-7 text-primary mr-2" />,
    initial: <ShieldCheck className="w-7 h-7 text-muted-foreground mr-2" />,
};

const getStatusIcon = (status?: string) => {
    if (!status) {
      return StatusIconMap.initial;
    }
    const lowerStatus = status.toLowerCase();
    for (const key in StatusIconMap) {
      if (lowerStatus.includes(key)) {
        return StatusIconMap[key];
      }
    }
    return StatusIconMap.default;
};

export default function ComplianceReport({ result, isLoading }: ComplianceReportProps) {
  return (
    <Card>
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
              <ScrollArea className="h-96 w-full rounded-md border p-3 bg-muted/30">
                <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.complianceReport}
                </pre>
              </ScrollArea>
            </div>
          </>
        )}
        {!isLoading && !result && (
          <div className="text-center text-muted-foreground font-body p-4 border border-dashed rounded-md h-60 flex flex-col items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p>Your compliance report will appear here once you submit the form.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
