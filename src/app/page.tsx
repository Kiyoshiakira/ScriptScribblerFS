'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import EditorView from '@/components/views/editor-view';
import ScenesView from '@/components/views/scenes-view';
import CharactersView from '@/components/views/characters-view';
import NotesView from '@/components/views/notes-view';
import LoglineView from '@/components/views/logline-view';
import DashboardView from '@/components/views/dashboard-view';
import MyScriptsView from '@/components/views/my-scripts-view';
import type { ScriptElement } from '@/components/script-editor';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentScript } from '@/context/current-script-context';
import type { AiProofreadScriptOutput } from '@/ai/flows/ai-proofread-script';
import { ScriptProvider } from '@/context/script-context';
import type { Character } from '@/components/views/characters-view';
import type { Scene } from '@/components/views/scenes-view';
import type { Note } from '@/components/views/notes-view';


export type View = 'dashboard' | 'editor' | 'scenes' | 'characters' | 'notes' | 'profile' | 'logline';

export type ProofreadSuggestion = AiProofreadScriptOutput['suggestions'][0];

function AppLayout({ setView, view }: { setView: (view: View) => void, view: View}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { currentScriptId } = useCurrentScript();
  const [activeScriptElement, setActiveScriptElement] =
    React.useState<ScriptElement | null>(null);

  // State lifted from ScriptEditor
  const [wordCount, setWordCount] = React.useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = React.useState(0);
  
  // Data fetching for export
    const charactersCollection = useMemoFirebase(
        () => (user && firestore && currentScriptId ? collection(firestore, 'users', user.uid, 'scripts', currentScriptId, 'characters') : null),
        [firestore, user, currentScriptId]
    );
    const { data: characters } = useCollection<Character>(charactersCollection);

    const notesCollection = useMemoFirebase(
        () => (user && firestore && currentScriptId ? collection(firestore, 'users', user.uid, 'scripts', currentScriptId, 'notes') : null),
        [firestore, user, currentScriptId]
    );
    const { data: notes } = useCollection<Note>(notesCollection);

    const scenesCollection = useMemoFirebase(
        () => (user && firestore && currentScriptId ? query(collection(firestore, 'users', user.uid, 'scripts', currentScriptId, 'scenes'), orderBy('sceneNumber')) : null),
        [firestore, user, currentScriptId]
    );
    const { data: scenes } = useCollection<Scene>(scenesCollection);

  const renderView = () => {
    // These views require a script context
    return (
       <ScriptProvider scriptId={currentScriptId!}>
          {
            {
              'dashboard': <DashboardView setView={setView} />,
              'editor': <EditorView 
                  onActiveLineTypeChange={setActiveScriptElement}
                  setWordCount={setWordCount}
                  setEstimatedMinutes={setEstimatedMinutes}
                  isStandalone={false}
              />,
              'scenes': <ScenesView />,
              'characters': <CharactersView />,
              'notes': <NotesView />,
              'logline': <LoglineView />,
              'profile': <MyScriptsView setView={setView} />,
            }[view]
          }
       </ScriptProvider>
    )
  };
  
  // Conditionally wrap with ScriptProvider if a script is active
  const MainContent = () => (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar
          activeView={view}
          setActiveView={setView}
          activeScriptElement={view === 'editor' ? activeScriptElement : null}
          wordCount={wordCount}
          estimatedMinutes={estimatedMinutes}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader 
            setView={setView} 
            characters={characters}
            scenes={scenes}
            notes={notes}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );

   return <MainContent />;
}

function MainApp() {
  const { currentScriptId, isCurrentScriptLoading } = useCurrentScript();
  const [view, setView] = React.useState<View>('dashboard');

  // While waiting for user/script context, show a full-page loader.
  if (isCurrentScriptLoading) {
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

  // If loading is complete but there is no script ID, show the MyScriptsView
  if (!currentScriptId) {
     return (
        <SidebarProvider>
          <div className="flex h-screen bg-background">
              <AppSidebar
                activeView={'profile'}
                setActiveView={setView}
                activeScriptElement={null}
                wordCount={0}
                estimatedMinutes={0}
              />
               <div className="flex flex-1 flex-col overflow-hidden">
                <AppHeader 
                  setView={setView} 
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                  <MyScriptsView setView={setView} />
                </main>
              </div>
          </div>
        </SidebarProvider>
    );
  }
  
  // If there is a script, render the full app layout
  return <AppLayout view={view} setView={setView} />;
}


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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

  return <MainApp />;
}
