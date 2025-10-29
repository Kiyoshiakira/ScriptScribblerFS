'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/app-sidebar';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import MyScriptsView from '@/components/views/my-scripts-view';

// This page is now primarily a fallback or a direct navigation target,
// but the main script management UI is now integrated into the main '/' route.
export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (!isUserLoading && user) {
        // If a user is logged in, the main page '/' handles the view logic.
        // Redirecting there ensures the correct view (dashboard or profile) is shown.
        router.push('/');
    }
  }, [user, isUserLoading, router]);


  // Show a loader while checking for user auth status.
  return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <Logo />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
}
