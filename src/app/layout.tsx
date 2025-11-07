
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});


export const metadata: Metadata = {
  title: 'SAS Fleet Manager',
  description: 'Fleet Management System by SAS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <FirebaseClientProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
