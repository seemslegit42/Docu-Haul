
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
          {open && <span className="font-headline text-xl font-bold text-primary tracking-tight">DocuHaul</span>}
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
        {user && (
           <SidebarMenuItem className="mb-2">
             <SidebarMenuButton
               onClick={handleSignOut}
               tooltip={{ children: `Sign out (${user.email})`, side: 'right' }}
               className="w-full"
             >
               <LogOut className="h-5 w-5" />
               <span>Sign Out</span>
             </SidebarMenuButton>
           </SidebarMenuItem>
        )}
        {open && (
           <div className="text-center text-xs text-muted-foreground font-body space-y-1">
             <p>© {new Date().getFullYear()} DocuHaul</p>
             {user && (
               <div className="flex items-center justify-center gap-2 p-1 rounded-md">
                 <UserIcon className="w-4 h-4 shrink-0" />
                 <p className="truncate">{user.email}</p>
               </div>
             )}
           </div>
        )}
      </SidebarFooter>
    </>
  );
}
