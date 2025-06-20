
'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthAwareButtonProps {
  buttonProps?: ButtonProps;
  text: string;
  loginText?: string;
}

export function AuthAwareButton({ buttonProps, text, loginText }: AuthAwareButtonProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="h-11 w-40 rounded-md" />;
  }

  return (
    <Link href={user ? '/dashboard' : '/login'} passHref legacyBehavior>
      <Button {...buttonProps}>
        {user ? text : (loginText ?? 'Login')} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  );
}
