'use client';

import * as React from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ScriptProvider } from '@/context/script-context';
import { useCurrentScript } from '@/context/current-script-context';
import { Skeleton } from '../ui/skeleton';
import { SettingsDialog } from '../settings-dialog';
import MyScriptsView from '../views/my-scripts-view';
import DashboardView from '../views/dashboard-view';
import EditorView from '../views/editor-view';
import LoglineView from '../views/logline-view';
import ScenesView from '../views/scenes-view';
import CharactersView from '../views/characters-view';
import NotesView from '../views/notes-view';

export type View = 'dashboard' | 'editor' | 'scenes' | 'characters' | 'notes' | 'logline' | 'profile' | 'settings';

export default function AppLayout() {
  const { currentScriptId, isCurrentScriptLoading } = useCurrentScript();
  const [view, setView] = React.useState<View>('dashboard');
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isCurrentScriptLoading && !currentScriptId) {
      setView('profile');
    } else if (!isCurrentScriptLoading && currentScriptId) {
        // If a script becomes active, move away from profile view
        if(view === 'profile') {
            setView('dashboard');
        }
    }
  }, [isCurrentScriptLoading, currentScriptId, view]);

  const handleSetView = (newView: View) => {
    if (newView === 'settings') {
      setSettingsOpen(true);
    } else {
      setView(newView);
    }
  };

  const renderView = () => {
    switch(view) {
      case 'dashboard': return <DashboardView />;
      case 'editor': return <EditorView isStandalone={false} />;
      case 'logline': return <LoglineView />;
      case 'scenes': return <ScenesView />;
      case 'characters': return <CharactersView />;
      case 'notes': return <NotesView />;
      case 'profile': return <MyScriptsView />;
      default: return <DashboardView />;
    }
  };

  const Content = () => {
    if (view === 'profile') {
      return <MyScriptsView setView={handleSetView} />;
    }
    
    if (isCurrentScriptLoading || !currentScriptId) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <p className="text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      );
    }

    return (
       <ScriptProvider scriptId={currentScriptId}>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {renderView()}
            </main>
       </ScriptProvider>
    );
  };


  return (
    <SidebarProvider>
        <div className="flex h-screen bg-background">
            <AppSidebar activeView={view} setView={handleSetView} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AppHeader activeView={view} setView={handleSetView} />
                <Content />
            </div>
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
    </SidebarProvider>
  );
}
