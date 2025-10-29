'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';

// This page is now primarily a fallback. The main app at '/' will handle
// showing the correct view (dashboard or profile).
export default function ProfilePage() {
  const router = useRouter();

  React.useEffect(() => {
    // Always redirect to the main page, which contains all the logic.
    router.replace('/');
  }, [router]);


  // Show a simple loader while redirecting.
  return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p>Redirecting...</p>
      </div>
    );
}
