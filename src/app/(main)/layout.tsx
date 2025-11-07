
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Tractor } from 'lucide-react';
import { useEffect } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Tractor className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 md:pl-[var(--sidebar-width-icon)]">
        <AppHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
