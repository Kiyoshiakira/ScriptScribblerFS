'use client';

import AiFab from '@/components/ai-fab';
import ScriptEditor from '@/components/script-editor';

export default function EditorView() {
  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <ScriptEditor isStandalone={false} />
      </div>
      <AiFab />
    </div>
  );
}
