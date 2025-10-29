'use client';
import * as React from 'react';
import MyScriptsView from '@/components/views/my-scripts-view';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentScript } from '@/context/current-script-context';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { setCurrentScriptId } = useCurrentScript();

    // On the profile page, we explicitly ensure no script is considered active.
    React.useEffect(() => {
        setCurrentScriptId(null);
    }, [setCurrentScriptId]);

    const handleSetView = (view: any) => {
        // This function is now used to navigate FROM the profile page to a script view.
        // It's called by AppSidebar when a view button is clicked.
        // Since we don't have a script selected, we push to '/' and let the main page logic
        // pick up the most recent script.
        router.push('/');
    };

    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background">
                <AppSidebar
                    activeView={'profile'}
                    setActiveView={handleSetView}
                    activeScriptElement={null}
                    wordCount={0}
                    estimatedMinutes={0}
                />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <AppHeader 
                      setView={handleSetView} 
                    />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <MyScriptsView setView={handleSetView} />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
