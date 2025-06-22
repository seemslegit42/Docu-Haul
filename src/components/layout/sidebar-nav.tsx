
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Tags, ShieldCheck, FileCheck2, Hash, LogOut, History, User, ChevronUp, Star, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const { user, isPremium, isAdmin } = useAuth();

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
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
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
      
      {isAdmin && (
        <>
          <SidebarSeparator />
          <SidebarGroup className="p-2">
            <SidebarGroupLabel className="flex items-center gap-2 px-2">
                <Settings />
                Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/admin/dashboard" passHref legacyBehavior>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith('/admin/dashboard')}
                                tooltip={{ children: "Admin Dashboard", className: "font-body" }}
                                className={cn("font-body")}
                            >
                                <a>
                                <Home className="h-5 w-5" />
                                <span className={cn(isExpanded ? "opacity-100" : "opacity-0 md:opacity-100", "transition-opacity duration-200 delay-100")}>Dashboard</span>
                                </a>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/admin/users" passHref legacyBehavior>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith('/admin/users')}
                                tooltip={{ children: "Manage Users", className: "font-body" }}
                                className={cn("font-body")}
                            >
                                <a>
                                <User className="h-5 w-5" />
                                <span className={cn(isExpanded ? "opacity-100" : "opacity-0 md:opacity-100", "transition-opacity duration-200 delay-100")}>Users</span>
                                </a>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      )}

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <SidebarMenuButton className="w-full justify-start h-auto p-2" tooltip={{ children: user.email || 'User Account', side: 'right' }}>
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                    {isExpanded && (
                      <div className="flex flex-col items-start ml-2 overflow-hidden flex-grow">
                          <span className="font-semibold text-sm truncate">{user.email}</span>
                          <span className={cn(
                              "text-xs",
                              isPremium ? 'text-yellow-400' : 'text-muted-foreground'
                          )}>
                              {isPremium ? 'Premium User' : 'Standard User'}
                          </span>
                      </div>
                    )}
                    {isExpanded && <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto"/>}
               </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-2 ml-2 font-body">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      <span>Account & Billing</span>
                    </Link>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </>
  );
}
