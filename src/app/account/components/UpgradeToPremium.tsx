"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardProps } from '@/components/ui/card';
import { Rocket, ArrowRight, Star, Shield, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Read from environment variables
const LEMON_SQUEEZY_SUBSCRIPTION_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_SUBSCRIPTION_URL || "#";
const LEMON_SQUEEZY_CUSTOMER_PORTAL_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CUSTOMER_PORTAL_URL || "#";

export default function BillingSettings({ className, ...props }: CardProps) {
    const { user, isPremium, isAdmin } = useAuth();
    
    // Append user details to checkout URL for webhook mapping
    const checkoutUrl = user 
        ? `${LEMON_SQUEEZY_SUBSCRIPTION_URL}?checkout_data[custom][user_id]=${user.uid}&checkout_data[email]=${user.email}`
        : LEMON_SQUEEZY_SUBSCRIPTION_URL;

    const isCheckoutDisabled = checkoutUrl === "#" || !user;

    // Append user's email to portal URL for pre-filling login
    const customerPortalUrl = user?.email
        ? `${LEMON_SQUEEZY_CUSTOMER_PORTAL_URL}?email=${encodeURIComponent(user.email)}`
        : LEMON_SQUEEZY_CUSTOMER_PORTAL_URL;
        
    const isPortalDisabled = customerPortalUrl === "#";

    return (
        <Card className={cn("max-w-2xl", className)} {...props}>
            <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                    Manage your subscription plan and view billing history.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">Current Plan</CardTitle>
                        <div className="flex items-center gap-2 pt-2">
                            {isPremium ? <Star className="w-6 h-6 text-yellow-400" /> : <Shield className="w-6 h-6 text-muted-foreground" />}
                            <p className="font-semibold text-xl">{isPremium ? "Premium" : "Standard"}</p>
                            {isAdmin && <Badge variant="destructive">Admin</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {isPremium 
                                ? "You have full access to all features, including the Label Forge and Smart Docs."
                                : "You are on the Standard plan. Upgrade to unlock premium features."
                            }
                        </p>
                    </CardContent>
                </Card>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 border-t px-6 py-4">
                {isPremium ? (
                    <div>
                        <h3 className="font-semibold mb-2">Manage Your Subscription</h3>
                        <Button asChild disabled={isPortalDisabled}>
                            <Link href={customerPortalUrl} target="_blank">
                                Open Customer Portal <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        {isPortalDisabled && (
                             <p className="text-xs text-muted-foreground mt-2">
                                The customer portal is not yet configured by the site administrator.
                            </p>
                        )}
                    </div>
                ) : (
                    <div>
                        <h3 className="font-semibold mb-2">Upgrade to Premium</h3>
                        <Button asChild disabled={isCheckoutDisabled}>
                            <Link href={checkoutUrl} target="_blank">
                                <Rocket className="mr-2 h-4 w-4" />
                                Upgrade Now
                            </Link>
                        </Button>
                        {isCheckoutDisabled && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Checkout is not yet configured by the site administrator.
                            </p>
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
