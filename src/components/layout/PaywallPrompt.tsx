
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export function PaywallPrompt() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2 flex flex-col items-center justify-center text-center p-8 border-primary/20 bg-muted/30">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">Upgrade to Unlock Label Forge</CardTitle>
            <CardDescription className="max-w-md mx-auto">
            This is a premium feature. Please upgrade your plan to generate compliant VIN labels with AI-optimized content and layout.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button size="lg" disabled>
                Upgrade to Pro (Coming Soon)
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
                Payment integration is not yet implemented.
            </p>
        </CardContent>
        </Card>
    </div>
  );
}
