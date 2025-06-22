"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, ArrowRight } from 'lucide-react';

const LEMON_SQUEEZY_CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || "#";

export default function UpgradeToPremium() {
    const { user } = useAuth();
    
    const checkoutUrl = user 
        ? `${LEMON_SQUEEZY_CHECKOUT_URL}?checkout_data[custom][user_id]=${user.uid}`
        : LEMON_SQUEEZY_CHECKOUT_URL;

    const isCheckoutDisabled = checkoutUrl === "#" || !user;

    return (
        <Card className="bg-gradient-to-br from-primary/10 to-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Rocket />
                    Unlock Premium Features
                </CardTitle>
                <CardDescription>
                    Upgrade your account to gain access to exclusive features like the AI-powered Label Forge.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full" disabled={isCheckoutDisabled}>
                    <Link href={checkoutUrl} target="_blank">
                        Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                {isCheckoutDisabled && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Checkout is not yet configured by the site administrator.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
