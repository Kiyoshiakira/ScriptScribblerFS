'use client';
import { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar';
import {
  Film,
  Home,
  Bot,
  Users,
  Settings,
  BookText,
  Clapperboard,
  StickyNote,
  CaseSensitive,
  Library,
  Clock,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import type { View, ProofreadSuggestion } from '@/app/page';
import type { ScriptElement } from '../script-editor';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface AppSidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  activeScriptElement: ScriptElement | null;
  wordCount: number;
  estimatedMinutes: number;
  proofreadSuggestions: ProofreadSuggestion[];
  setProofreadSuggestions: (suggestions: ProofreadSuggestion[]) => void;
  isProofreading: boolean;
  onProofreadRequest: () => void;
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


export default function AppSidebar({
  activeView,
  setActiveView,
  activeScriptElement,
  wordCount,
  estimatedMinutes,
  proofreadSuggestions,
  setProofreadSuggestions,
  isProofreading,
  onProofreadRequest
}: AppSidebarProps) {
  const { state: sidebarState } = useSidebar();
  const [isSuggestionsDialogOpen, setIsSuggestionsDialogOpen] = useState(false);
  const { toast } = useToast();

  const applySuggestion = (suggestion: ProofreadSuggestion) => {
    // This function can't directly edit the script anymore.
    // It could emit an event that the parent component listens to.
    // For now, we'll just remove it from the list.
    toast({
        title: 'Suggestion Copied',
        description: 'The suggested text has been copied to your clipboard.',
    });
    navigator.clipboard.writeText(suggestion.correctedText);
    setProofreadSuggestions(proofreadSuggestions.filter(s => s !== suggestion));
  };

  const dismissSuggestion = (suggestion: ProofreadSuggestion) => {
    setProofreadSuggestions(proofreadSuggestions.filter(s => s !== suggestion));
  };
  
  const formatElementName = (name: string | null) => {
    if (!name) return 'N/A';
    if (sidebarState === 'collapsed') {
      return name.split('-').map(word => word[0].toUpperCase()).join('');
    }
    return name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const ScriptInfo = () => (
     <div className={cn("p-2 space-y-2 transition-opacity duration-200", activeView !== 'editor' && "hidden")}>
        <SidebarSeparator />
        <div className="text-xs text-sidebar-foreground/70 px-2 font-medium [&[data-collapsed=true]]:text-center [&[data-collapsed=true]]:px-0" data-collapsed={sidebarState === 'collapsed'}>
            {sidebarState === 'collapsed' ? 'Info' : 'Script Info'}
        </div>
         <div className='px-2 flex items-center justify-between text-sm' data-collapsed={sidebarState === 'collapsed'}>
            <div className='flex items-center gap-2'>
              <Clock className="w-4 h-4 text-sidebar-primary flex-shrink-0" />
              <span className='font-semibold text-sidebar-foreground'>{estimatedMinutes} min</span>
            </div>
            <span className='text-sidebar-foreground/70'>{wordCount} words</span>
        </div>
        <div 
          className={cn(
            "space-y-2 transition-opacity duration-200", 
            !activeScriptElement && "opacity-0"
          )}
        >
            <div className='px-2 flex items-center gap-2 [&[data-collapsed=true]]:justify-center' data-collapsed={sidebarState === 'collapsed'}>
              <CaseSensitive className="w-4 h-4 text-sidebar-primary flex-shrink-0" />
              <span className='font-semibold text-sm text-sidebar-foreground'>{formatElementName(activeScriptElement)}</span>
            </div>
        </div>
         <div className="px-2" data-collapsed={sidebarState === 'collapsed'}>
            <Button 
                variant="outline"
                size="sm" 
                className='w-full bg-sidebar-accent'
                onClick={() => {
                  onProofreadRequest();
                  setIsSuggestionsDialogOpen(true);
                }}
                disabled={isProofreading}
            >
                <Bot className="w-4 h-4 mr-2" />
                <span className={cn(sidebarState === 'collapsed' && 'hidden')}>Proofread</span>
                {isProofreading ? (
                  <Skeleton className='w-4 h-4 rounded-full ml-2' />
                ) : (
                  proofreadSuggestions.length > 0 && <Badge variant="default" className={cn("ml-2", sidebarState === 'collapsed' && 'hidden')}>{proofreadSuggestions.length}</Badge>
                )}
            </Button>
         </div>
    </div>
  );

  return (
    <>
    <Sidebar variant="sidebar" collapsible="icon" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Logo />
            <h1 className="text-xl font-bold font-headline">ScriptScribbler</h1>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 overflow-y-auto p-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setActiveView('my-scripts')}
            isActive={activeView === 'my-scripts'}
            tooltip="My Scripts"
          >
            <Library />
            <span>My Scripts</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarSeparator />
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
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setActiveView('notes')}
            isActive={activeView === 'notes'}
            tooltip="Notes"
          >
            <StickyNote />
            <span>Notes</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter>
        <ScriptInfo />
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
     <Dialog open={isSuggestionsDialogOpen} onOpenChange={setIsSuggestionsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2"><Sparkles className='w-5 h-5 text-primary' /> AI Proofreader Suggestions</DialogTitle>
            <DialogDescription>
              Review the suggestions below. You can apply or dismiss each correction.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            {isProofreading && proofreadSuggestions.length === 0 ? (
                <div className="space-y-4 py-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : (
            <div className="space-y-4 py-4">
              {proofreadSuggestions.map((suggestion, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 p-4">
                    <CardTitle className="text-sm font-semibold">{suggestion.explanation}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <p className="text-red-500 line-through mb-2">"{suggestion.originalText}"</p>
                    <p className="text-green-600">"{suggestion.correctedText}"</p>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-2 flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => dismissSuggestion(suggestion)}>
                      <X className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                    <Button size="sm" onClick={() => applySuggestion(suggestion)}>
                      <Check className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {!isProofreading && proofreadSuggestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Check className="w-12 h-12 mx-auto" />
                    <h3 className="mt-4 text-lg font-medium">No errors found!</h3>
                    <p>The proofreader didn't find any suggestions.</p>
                </div>
              )}
            </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
