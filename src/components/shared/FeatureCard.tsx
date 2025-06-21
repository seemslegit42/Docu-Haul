
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
  variant?: 'default' | 'link';
}

export function FeatureCard({ icon, title, description, href, variant = 'default', className }: FeatureCardProps) {
  if (variant === 'link' && href) {
    return (
      <Link href={href} className="group block h-full">
        <Card className={cn("h-full transition-colors duration-300 group-hover:border-primary group-hover:bg-muted/30", className)}>
          <CardHeader className="flex flex-row items-center gap-4">
            {icon}
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-body mb-4 min-h-[40px]">{description}</p>
            <div className="text-sm font-semibold text-primary flex items-center gap-2">
              Go to {title}
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant, used on landing page
  return (
    <Card className={cn(
        "text-center transition-transform duration-300 hover:border-primary/50 hover:-translate-y-2 flex flex-col bg-card/80 backdrop-blur-sm", 
        className
    )}>
      <CardContent className="pt-6 flex flex-col items-center flex-grow">
        {icon}
        <h3 className="font-headline text-xl font-bold mt-4 mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
