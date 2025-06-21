
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";

// TODO: Replace this with your actual Lemon Squeezy checkout link
const LEMON_SQUEEZY_CHECKOUT_URL = "https://your-store.lemonsqueezy.com/checkout/buy/your-variant-id";

export function PaywallPrompt() {
  return (
    <div className="grid grid-cols-1">
        <Card className="overflow-hidden border-primary/20 bg-muted/30 md:grid md:grid-cols-2 md:items-stretch">
            <div className="p-8 flex flex-col justify-center order-2 md:order-1">
                <div className="flex justify-center md:justify-start mb-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <CardHeader className="p-0 mb-4 text-center md:text-left">
                    <CardTitle className="text-2xl text-primary">Premium Feature Locked</CardTitle>
                    <CardDescription className="max-w-md mx-auto md:mx-0">
                    AI-powered VIN label generation is a premium feature that requires a one-time purchase to unlock.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-center md:text-left">
                    <Button asChild size="lg">
                        <Link href={LEMON_SQUEEZY_CHECKOUT_URL} target="_blank">
                            Purchase Access <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto md:mx-0">
                        After purchasing, you may need to sign out and sign back in for the changes to take effect.
                    </p>
                </CardContent>
            </div>
            <div className="relative order-1 md:order-2 min-h-[200px] md:min-h-full">
                <Image
                    src="https://placehold.co/600x600.png"
                    alt="Stylized lock representing a premium feature"
                    fill
                    className="object-cover"
                    data-ai-hint="secure payment"
                />
            </div>
        </Card>
    </div>
  );
}
