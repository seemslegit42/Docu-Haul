
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";

// TODO: Replace this with your actual Lemon Squeezy checkout link
const LEMON_SQUEEZY_CHECKOUT_URL = "https://your-store.lemonsqueezy.com/checkout/buy/your-variant-id";

export function PaywallPrompt() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2 flex flex-col items-center justify-center text-center p-8 border-primary/20 bg-muted/30">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">Premium Feature Locked</CardTitle>
            <CardDescription className="max-w-md mx-auto">
            AI-powered VIN label generation is a premium feature that requires a one-time purchase to unlock.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild size="lg">
                <Link href={LEMON_SQUEEZY_CHECKOUT_URL} target="_blank">
                    Purchase Access <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto">
                After purchasing, you may need to sign out and sign back in for the changes to take effect.
            </p>
        </CardContent>
        </Card>
    </div>
  );
}
