"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PricingCardProps {
    planName: string;
    price: string;
    priceDescription: string;
    features: string[];
    ctaText: string;
    ctaSubtext: string;
    isFeatured?: boolean;
    checkoutUrl?: string; // New prop
}

export default function PricingCard({ planName, price, priceDescription, features, ctaText, ctaSubtext, isFeatured = false, checkoutUrl }: PricingCardProps) {
    const { user, isLoading, isPremium } = useAuth();
    
    // A plan is considered a "paid" plan if a checkout URL is provided.
    const isPaidPlan = !!checkoutUrl && checkoutUrl !== "#";
    
    const getCtaLink = () => {
        // If it's a paid plan and a user exists, append user data to the URL.
        if (isPaidPlan && user) {
            try {
                const url = new URL(checkoutUrl!);
                url.searchParams.set('checkout_data[custom][user_id]', user.uid);
                if (user.email) {
                    url.searchParams.set('checkout_data[email]', user.email);
                }
                return url.toString();
            } catch (error) {
                // If checkoutUrl is not a valid URL, return the fallback
                return checkoutUrl || '#';
            }
        }
        
        // If it's a paid plan but no user is logged in, redirect to login first.
        if (isPaidPlan && !user) {
             return '/login?redirect=/pricing';
        }
        
        // Default for free plans or other scenarios
        return user ? '/dashboard' : '/login';
    };
    
    // A CTA should be disabled if it's a paid plan that the user already has.
    // We assume both paid plans grant the `isPremium` status.
    const isCtaDisabled = isPaidPlan && (isLoading || isPremium);

    const renderCta = () => {
        if (isLoading) {
            return <Skeleton className="h-11 w-full" />;
        }
        
        if (isPaidPlan && isPremium) {
            return <Button className="w-full" disabled>Your Current Plan</Button>;
        }

        return (
            <Button asChild size="lg" className="w-full" disabled={isCtaDisabled || checkoutUrl === "#"}>
                <Link href={getCtaLink()} target={isPaidPlan && user ? '_blank' : '_self'}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        );
    };

    return (
        <Card className={cn("flex flex-col h-full", isFeatured && "border-primary shadow-lg shadow-primary/20")}>
            {isFeatured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
            )}
            <CardHeader className="items-center text-center">
                <CardTitle className="text-2xl">{planName}</CardTitle>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground">{priceDescription}</span>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2 pt-6">
                {renderCta()}
                <p className="text-xs text-muted-foreground">{ctaSubtext}</p>
                 {isPaidPlan && checkoutUrl === "#" && !isPremium && (
                    <p className="text-xs text-destructive text-center">This plan is not yet available for purchase.</p>
                )}
            </CardFooter>
        </Card>
    );
}
