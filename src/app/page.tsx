'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While the initial user check is happening, show a simplified loading screen.
  // AppLayout will handle its own more detailed loading once the user is confirmed.
  if (isUserLoading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Once the user is verified, render the full application layout.
  return <AppLayout />;
}
