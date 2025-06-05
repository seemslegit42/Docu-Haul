"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Tags, ShieldCheck, CarFront } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/smart-docs', label: 'Smart Docs', icon: FileText },
  { href: '/label-forge', label: 'Label Forge', icon: Tags },
  { href: '/compliance-check', label: 'Compliance Check', icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-3 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <CarFront className="w-7 h-7 text-primary" />
          {open && <span className="font-headline text-xl font-bold text-primary">DocuHaul</span>}
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
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {open && (
          <p className="text-xs text-sidebar-foreground/70 font-body">
            © {new Date().getFullYear()} DocuHaul
          </p>
        )}
      </SidebarFooter>
    </>
  );
}
