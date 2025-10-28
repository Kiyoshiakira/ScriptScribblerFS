'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Film,
  Home,
  Bot,
  Users,
  Settings,
  BookText,
  Clapperboard,
} from 'lucide-react';
import type { View } from '@/app/page';

interface AppSidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Logo = () => (
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


export default function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Logo />
            <h1 className="text-xl font-bold font-headline">ScriptSync</h1>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setActiveView('editor')}
            isActive={activeView === 'editor'}
            tooltip="Editor"
          >
            <BookText />
            <span>Editor</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setActiveView('scenes')}
            isActive={activeView === 'scenes'}
            tooltip="Scenes"
          >
            <Clapperboard />
            <span>Scenes</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setActiveView('characters')}
            isActive={activeView === 'characters'}
            tooltip="Characters"
          >
            <Users />
            <span>Characters</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter>
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
