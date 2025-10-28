'use client';
import { useState } from 'react';
import AiAssistant from '@/components/ai-assistant';
import ScriptEditor from '@/components/script-editor';

const initialScript = `FADE IN:

INT. COFFEE SHOP - DAY

Sunlight streams through the large windows of a bustling, modern coffee shop. The air is thick with the smell of roasted beans and chatter.

JANE (28), sharp and dressed in a business suit, types furiously on her laptop. A half-empty mug sits beside her.

Across the room, LEO (30), clad in a worn-out band t-shirt and jeans, sketches in a notebook, seemingly lost in his own world.

A sudden CRASH from the counter makes everyone jump. A barista has dropped a tray of cups.

In the ensuing silence, Jane and Leo's eyes meet for the first time. A spark.

BARISTA
(Flustered)
Sorry, everyone! Clean-up on aisle three!

The moment is broken. Jane returns to her screen, a faint smile on her lips. Leo goes back to his sketch, but his drawing has now changed. It's a quick, rough portrait of Jane.

FADE OUT.
`;

export default function EditorView() {
  const [scriptContent, setScriptContent] = useState(initialScript);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <div className="lg:col-span-8 xl:col-span-9">
        <ScriptEditor
          scriptContent={scriptContent}
          setScriptContent={setScriptContent}
        />
      </div>
      <div className="lg:col-span-4 xl:col-span-3">
        <AiAssistant scriptContent={scriptContent} />
      </div>
    </div>
  );
}
