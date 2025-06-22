
'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';

// The base URL for your Lemon Squeezy checkout.
// This should be set in your .env file.
const LEMON_SQUEEZY_CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || "#";

interface PaywallPromptProps {
  title?: string;
  description?: string;
}

export function PaywallPrompt({ title, description }: PaywallPromptProps) {
  const { user } = useAuth();
  
  // Append the user's ID to the checkout URL as custom data.
  // This is crucial for the webhook to identify which user to grant premium access to.
  const checkoutUrl = user 
    ? `${LEMON_SQUEEZY_CHECKOUT_URL}?checkout_data[custom][user_id]=${user.uid}`
    : LEMON_SQUEEZY_CHECKOUT_URL;

  const isCheckoutDisabled = checkoutUrl === "#" || !user;

  return (
    <div className="grid grid-cols-1">
        <Card className="overflow-hidden border-primary/20 bg-muted/30">
            <div className="p-8 flex flex-col justify-center items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl text-primary">{title || 'Premium Feature Locked'}</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        {description || 'This feature requires a one-time purchase to unlock. Please upgrade your plan.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Button asChild size="lg" disabled={isCheckoutDisabled}>
                        <Link href={checkoutUrl} target="_blank">
                            Purchase Access <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                     {isCheckoutDisabled && (
                        <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto">
                            Checkout is not yet configured. Please set the `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` in your environment.
                        </p>
                    )}
                    {!isCheckoutDisabled && (
                         <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto">
                            After purchasing, you may need to sign out and sign back in for the changes to take effect.
                        </p>
                    )}
                </CardContent>
            </div>
        </Card>
    </div>
  );
}
