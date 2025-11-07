
'use client';

import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Fuel,
  Gauge,
  LayoutDashboard,
  Truck,
  User,
  Users,
  Wrench,
  Tractor,
} from 'lucide-react';
import Image from 'next/image';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/drivers', label: 'Drivers', icon: Users },
  { href: '/fuel-queue', label: 'Fuel Queue', icon: Fuel },
  { href: '/odometer', label: 'Odometer', icon: Gauge },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Tractor className="size-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground font-headline">
            SAS Fleet
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{
                  children: item.label,
                }}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={pathname === '/profile'}
                tooltip={{
                  children: "Profile",
                }}
              >
              <a href="/profile">
                <Avatar className="h-8 w-8">
                  {user?.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span>Profile</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
