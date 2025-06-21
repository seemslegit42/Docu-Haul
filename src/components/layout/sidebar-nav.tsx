
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Tags, ShieldCheck, FileCheck2, Hash, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/smart-docs', label: 'Smart Docs', icon: FileText },
  { href: '/label-forge', label: 'Label Forge', icon: Tags },
  { href: '/compliance-check', label: 'Compliance Check', icon: ShieldCheck },
  { href: '/vin-decoder', label: 'VIN Decoder', icon: Hash },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useSidebar();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-3 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <FileCheck2 className="w-7 h-7 text-primary" />
          {open && <span className="font-headline text-xl font-bold text-primary tracking-tight">VINscribe</span>}
        </Link>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, className: "font-body" }}
                className={cn(
                  "font-body",
                  pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <a>
                  <item.icon className="h-5 w-5" />
                  <span className={cn(open ? "opacity-100" : "opacity-0 md:opacity-100", "transition-opacity duration-200 delay-100")}>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
          <TooltipProvider>
            {user && (
              <div className="mb-2">
                {open ? (
                  <div className="flex items-center gap-2 p-1 rounded-md">
                    <UserIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium truncate flex-1">{user.email}</span>
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Sign Out</TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-full" onClick={handleSignOut}>
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Sign out {user.email}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </TooltipProvider>
        {open && (
          <p className="text-xs text-sidebar-foreground/70 font-body text-center">
            © {new Date().getFullYear()} VINscribe
          </p>
        )}
      </SidebarFooter>
    </>
  );
}
