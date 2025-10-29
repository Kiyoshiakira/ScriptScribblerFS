'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

// This page is now a compatibility redirect.
// All logic is handled in the main `page.tsx`.
export default function ProfileRedirectPage() {
    const router = useRouter();
    React.useEffect(() => {
        router.replace('/');
    }, [router]);
    
    return null;
}
