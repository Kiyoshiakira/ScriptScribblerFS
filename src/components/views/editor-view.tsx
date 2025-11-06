'use client';

import { useState } from 'react';
import AiFab from '@/components/ai-fab';
import ScriptEditor from '@/components/script-editor';
import { Button } from '../ui/button';
import { Search, Plus } from 'lucide-react';
import { FindReplaceDialog } from '../find-replace-dialog';
import { FindReplaceProvider } from '@/hooks/use-find-replace';
import EditorStatusBar from '../editor-status-bar';
import { useScript } from '@/context/script-context';
import { ScriptBlockType } from '@/lib/editor-types';
import { useRouter } from 'next/navigation';
import { useCurrentScript } from '@/context/current-script-context';

function EditorViewContent() {
  const [isFindOpen, setIsFindOpen] = useState(false);
  const { document, insertBlockAfter, scenes } = useScript();
  const router = useRouter();
  const { currentScriptId } = useCurrentScript();

  const handleAddScene = () => {
    if (!document || document.blocks.length === 0) {
      // If no blocks exist, we can't add after anything
      return;
    }
    
    // Get the last block in the document
    const lastBlock = document.blocks[document.blocks.length - 1];
    
    // Insert a new scene heading after the last block
    insertBlockAfter(lastBlock.id, 'INT. NEW LOCATION - DAY', ScriptBlockType.SCENE_HEADING);
  };

  const handleEditScene = (sceneNumber: number) => {
    // Navigate to the Scenes tab/view where the user can edit scene details
    // Since this is a tabbed interface, we need to trigger the tab change
    // The actual editing dialog is in the scenes-view component
    // For now, we'll just log it - the parent layout should handle tab switching
    console.log('Edit scene requested:', sceneNumber);
    
    // In a real implementation, you might want to:
    // 1. Switch to the Scenes tab
    // 2. Open the edit dialog for this specific scene
    // 3. Or show an inline edit modal here
    
    // For now, let's show an alert to inform the user
    alert(`To edit scene ${sceneNumber} details (setting, description, time), please go to the Scenes tab.`);
  };

  return (
      <div className="relative h-full w-full flex flex-col">
        <div className="flex-shrink-0 flex justify-end p-2">
            <Button variant="outline" size="sm" onClick={() => setIsFindOpen(true)}>
                <Search className="mr-2 h-4 w-4" />
                Find & Replace
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto pb-24">
          <ScriptEditor isStandalone={false} onEditScene={handleEditScene} />
          
          {/* Add Scene Button - Below the editor content */}
          <div className="max-w-3xl mx-auto px-4 py-6 flex justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleAddScene}
              className="w-full max-w-md"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Scene
            </Button>
          </div>
        </div>
        <EditorStatusBar />
        <AiFab />
        <FindReplaceDialog open={isFindOpen} onOpenChange={setIsFindOpen} />
      </div>
  )
}


export default function EditorView() {
  return (
    <FindReplaceProvider>
      <EditorViewContent />
    </FindReplaceProvider>
  );
}
