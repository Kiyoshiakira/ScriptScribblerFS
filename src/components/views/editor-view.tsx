'use client';
import { ScriptProvider } from '@/context/script-context';
import AiFab from '@/components/ai-fab';
import ScriptEditor, { ScriptElement } from '@/components/script-editor';
import { useCurrentScript } from '@/context/current-script-context';

interface EditorViewProps {
  onActiveLineTypeChange: (type: ScriptElement | null) => void;
  isStandalone: boolean;
  setWordCount: (count: number) => void;
  setEstimatedMinutes: (minutes: number) => void;
}

function EditorWithAssistant(props: Omit<EditorViewProps, 'isStandalone'>) {
  return (
    <div className="relative h-full">
      <ScriptEditor {...props} isStandalone={false} />
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
      {props.isStandalone ? (
        <ScriptEditor {...props} />
      ) : (
        <EditorWithAssistant {...props} />
      )}
    </ScriptProvider>
  );
}
