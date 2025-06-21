
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Tags, ShieldCheck, FileCheck2, Hash, LogOut, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
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
  { href: '/history', label: 'History', icon: History },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, isMobile } = useSidebar();
  const { user } = useAuth();

  // On mobile, the sidebar is inside a sheet, so it's conceptually "open" when visible.
  // On desktop, its state is determined by the `open` prop.
  const isExpanded = isMobile || open;

  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <SidebarHeader className="flex items-center p-3 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <FileCheck2 className="w-7 h-7 text-primary" />
          {isExpanded && <span className="font-headline text-xl font-bold text-primary tracking-tight">DocuHaul</span>}
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== '/';
              
            return (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={{ children: item.label, className: "font-body" }}
                        className={cn(
                        "font-body",
                        isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                    >
                        <a>
                        <item.icon className="h-5 w-5" />
                        <span className={cn(isExpanded ? "opacity-100" : "opacity-0 md:opacity-100", "transition-opacity duration-200 delay-100")}>{item.label}</span>
                        </a>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            )
        })}
      </SidebarMenu>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {user && (
           <SidebarMenuItem>
             <SidebarMenuButton
               onClick={handleSignOut}
               tooltip={{ children: `Sign out (${user.email})`, side: 'right' }}
               className="w-full"
             >
               <LogOut className="h-5 w-5" />
               <span className={cn(isExpanded ? "opacity-100" : "opacity-0 md:opacity-100", "transition-opacity duration-200 delay-100")}>Sign Out</span>
             </SidebarMenuButton>
           </SidebarMenuItem>
        )}
        {open && (
           <div className="text-center text-xs text-muted-foreground font-body py-2">
             <p>© {new Date().getFullYear()} DocuHaul</p>
           </div>
        )}
      </SidebarFooter>
    </>
  );
}
