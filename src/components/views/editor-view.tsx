'use client';
import { ScriptProvider } from '@/context/script-context';
import AiAssistant from '@/components/ai-assistant';
import ScriptEditor, { ScriptElement } from '@/components/script-editor';
import { useContext } from 'react';
import { ScriptContext } from '@/context/script-context';
import { useCurrentScript } from '@/context/current-script-context';

interface EditorViewProps {
  onActiveLineTypeChange: (type: ScriptElement | null) => void;
}

function EditorWithAssistant({ onActiveLineTypeChange }: EditorViewProps) {
  const { lines } = useContext(ScriptContext);
  const scriptContent = lines.map(l => l.text).join('\n');
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <div className="lg:col-span-8 xl:col-span-9">
        <ScriptEditor
          onActiveLineTypeChange={onActiveLineTypeChange}
        />
      </div>
      <div className="lg:col-span-4 xl:col-span-3">
        <AiAssistant scriptContent={scriptContent} />
      </div>
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
