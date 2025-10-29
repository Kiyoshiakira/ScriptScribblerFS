'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirebaseApp } from '@/firebase';
import { Logo } from '@/components/layout/app-sidebar';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const provider = new GoogleAuthProvider();

function LoginCard() {
  const app = useFirebaseApp(); // This is now safe to call inside this client component
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      // Using signInWithRedirect for a more robust authentication flow in this environment
      signInWithRedirect(auth, provider);
      // No need to await or handle router push here, Firebase handles the redirect flow.
    } catch (error) {
      console.error('Error initiating sign in with Google:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex items-center gap-2">
          <Logo />
          <h1 className="text-2xl font-bold font-headline">ScriptSync</h1>
        </div>
        <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to access your projects and collaborate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {isLoading ? (
            <Button disabled className="w-full">
              Redirecting to Google...
            </Button>
          ) : (
            <Button onClick={handleSignIn} className="w-full">
              Sign in with Google
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  // This parent component now contains no Firebase logic and is safe for server rendering.
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <LoginCard />
    </main>
  );
}
