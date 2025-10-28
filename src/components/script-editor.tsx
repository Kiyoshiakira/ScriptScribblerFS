'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Film } from 'lucide-react';
import React from 'react';

interface ScriptEditorProps {
  scriptContent: string;
  setScriptContent: (content: string) => void;
}

export default function ScriptEditor({ scriptContent, setScriptContent }: ScriptEditorProps) {
  
  const [wordCount, setWordCount] = React.useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = React.useState(0);

  React.useEffect(() => {
    const words = scriptContent.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    setWordCount(count);
    
    // A common rule of thumb is 1 page of screenplay is 1 minute of screen time.
    // An average page has about 250 words.
    const minutes = Math.round((count / 160) * 10) / 10; // More realistic estimate
    setEstimatedMinutes(minutes);

  }, [scriptContent]);

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline flex items-center gap-2 text-lg">
            <Film className="w-5 h-5 text-primary" />
            <span>SCENE 1: INT. COFFEE SHOP - DAY</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex">
        <Textarea
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          placeholder="FADE IN..."
          className="flex-1 resize-none font-code text-base leading-relaxed bg-card"
          style={{ minHeight: '60vh' }}
        />
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground justify-end gap-6">
        <span>{wordCount} words</span>
        <div className="flex items-center gap-2">
            <Clock className='w-4 h-4' />
            <span>Approx. {estimatedMinutes} min</span>
        </div>
      </CardFooter>
    </Card>
  );
}
