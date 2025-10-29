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
import * as React from 'react';

const provider = new GoogleAuthProvider();

function LoginCard() {
  const app = useFirebaseApp(); 
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      // signInWithRedirect does not need to be awaited. It navigates the page.
      signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error initiating sign in with Google:', error);
      setIsLoading(false); // Only reached if there's an immediate error
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
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <LoginCard />
    </main>
  );
}
