'use client';

import AiFab from '@/components/ai-fab';
import ScriptEditor from '@/components/script-editor';

export default function EditorView() {
  return (
    <>
      <ScriptEditor isStandalone={false} />
      <AiFab />
    </>
  );
}
