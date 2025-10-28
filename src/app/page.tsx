'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import EditorView from '@/components/views/editor-view';
import ScenesView from '@/components/views/scenes-view';
import CharactersView from '@/components/views/characters-view';
import NotesView from '@/components/views/notes-view';

export type View = 'editor' | 'scenes' | 'characters' | 'notes';

export default function Home() {
  const [view, setView] = React.useState<View>('editor');

  const renderView = () => {
    switch (view) {
      case 'editor':
        return <EditorView />;
      case 'scenes':
        return <ScenesView />;
      case 'characters':
        return <CharactersView />;
      case 'notes':
        return <NotesView />;
      default:
        return <EditorView />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar activeView={view} setActiveView={setView} />
        <SidebarInset className="flex-1">
          <AppHeader />
          <main className="p-4 sm:p-6 lg:p-8">{renderView()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
