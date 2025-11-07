
'use client';
import { useUser } from '@/firebase';
import { Tractor } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect('/dashboard');
      } else {
        redirect('/login');
      }
    }
  }, [user, loading]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Tractor className="h-12 w-12 animate-pulse" />
    </div>
  );
}
