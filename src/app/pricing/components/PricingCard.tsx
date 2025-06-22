
"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const LEMON_SQUEEZY_CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || "#";

interface PricingCardProps {
    planName: string;
    price: string;
    priceDescription: string;
    features: string[];
    ctaText: string;
    ctaSubtext: string;
    isFeatured?: boolean;
}

export default function PricingCard({ planName, price, priceDescription, features, ctaText, ctaSubtext, isFeatured = false }: PricingCardProps) {
    const { user, isLoading, isPremium } = useAuth();
    
    const isPremiumPlan = planName === 'Premium';

    const getCtaLink = () => {
        if (!isPremiumPlan) {
            return user ? '/dashboard' : '/login';
        }
        if (!user) {
            return '/login?redirect=/pricing';
        }
        return user ? `${LEMON_SQUEEZY_CHECKOUT_URL}?checkout_data[custom][user_id]=${user.uid}` : '#';
    };

    const isCtaDisabled = isPremiumPlan && (LEMON_SQUEEZY_CHECKOUT_URL === '#' || (user && isPremium));

    const renderCta = () => {
        if (isLoading) {
            return <Skeleton className="h-11 w-full" />;
        }
        
        if (isPremiumPlan && isPremium) {
            return <Button className="w-full" disabled>Your Current Plan</Button>;
        }

        return (
            <Button asChild size="lg" className="w-full" disabled={isCtaDisabled}>
                <Link href={getCtaLink()} target={isPremiumPlan && user ? '_blank' : '_self'}>
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
            </CardFooter>
        </Card>
    );
}
