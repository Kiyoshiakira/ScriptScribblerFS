'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import AppLayout from '@/components/layout/AppLayout';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    // This can be a more sophisticated loading screen
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

  return <AppLayout />;
}
