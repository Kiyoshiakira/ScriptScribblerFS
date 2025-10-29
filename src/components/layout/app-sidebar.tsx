'use client';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent
} from '@/components/ui/sidebar';
import {
  BookText,
  Clapperboard,
  StickyNote,
  Users,
  NotebookPen,
  LayoutDashboard,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScript } from '@/context/script-context';
import { Skeleton } from '../ui/skeleton';
import type { View } from './AppLayout';
import { useCurrentScript } from '@/context/current-script-context';


export const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-primary"
  >
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
    <path d="M12 4v16" />
  </svg>
);


export default function AppSidebar({
  activeView,
  setView
}: {
  activeView: View;
  setView: (view: View) => void;
}) {
  const { isScriptLoading } = useScript();
  const { currentScriptId } = useCurrentScript();
  
  const isProfileView = activeView === 'profile';
  const noScriptLoaded = !currentScriptId;

  const scriptMenuItems = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'editor', label: 'Editor', icon: BookText },
    { view: 'logline', label: 'Logline', icon: NotebookPen },
    { view: 'scenes', label: 'Scenes', icon: Clapperboard },
    { view: 'characters', label: 'Characters', icon: Users },
    { view: 'notes', label: 'Notes', icon: StickyNote },
  ] as const;

  return (
    <Sidebar variant="sidebar" collapsible="icon" side="left">
      <SidebarHeader>
        <a href="#" className="flex items-center gap-2 p-2" onClick={() => setView(noScriptLoaded ? 'profile' : 'dashboard')}>
            <Logo />
            <h1 className="text-xl font-bold font-headline">ScriptScribbler</h1>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="flex-1 overflow-y-auto p-2">
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setView('profile')}
                    isActive={isProfileView}
                    tooltip="My Scripts"
                >
                    <UserIcon />
                    <span>My Scripts</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            <hr className="my-2 border-sidebar-border" />

            {scriptMenuItems.map(item => (
                <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                        onClick={() => setView(item.view)}
                        isActive={activeView === item.view}
                        tooltip={item.label}
                        aria-disabled={noScriptLoaded}
                        className={cn(noScriptLoaded && "cursor-not-allowed opacity-50")}
                        disabled={noScriptLoaded}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        {(isScriptLoading && !isProfileView) ? (
          <div className='p-2 space-y-2'><Skeleton className='h-24 w-full' /></div>
        ) : (
          null
        )}
      </SidebarContent>
    </Sidebar>
  );
}
