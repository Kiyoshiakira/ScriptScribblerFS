'use client';
import { ScriptProvider } from '@/context/script-context';
import AiFab from '@/components/ai-fab';
import ScriptEditor, { ScriptElement } from '@/components/script-editor';
import { useCurrentScript } from '@/context/current-script-context';

interface EditorViewProps {
  onActiveLineTypeChange: (type: ScriptElement | null) => void;
}

function EditorWithAssistant({ onActiveLineTypeChange }: EditorViewProps) {
  return (
    <div className="relative h-full">
      <ScriptEditor onActiveLineTypeChange={onActiveLineTypeChange} />
      <AiFab />
    </div>
  );
}

export default function EditorView(props: EditorViewProps) {
    const { currentScriptId } = useCurrentScript();

    if (!currentScriptId) {
        // This can happen briefly during loading, or if no scripts exist.
        // MyScriptsView will handle the "no scripts" case.
        return null; 
    }

  return (
    <ScriptProvider scriptId={currentScriptId}>
      <EditorWithAssistant {...props} />
    </ScriptProvider>
  );
}
