'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useDebounce } from 'use-debounce';
import type { ScriptElement } from '@/components/script-editor';

interface Script {
    id: string;
    title: string;
    content: string; // The raw string content for Firestore
    logline?: string;
    [key: string]: any; 
}

export interface ScriptLine {
  id: string;
  type: ScriptElement;
  text: string;
}

interface ScriptContextType {
  script: Script | null;
  lines: ScriptLine[];
  setLines: (linesOrContent: ScriptLine[] | string | ((prev: ScriptLine[]) => ScriptLine[])) => void;
  setScriptTitle: (title: string) => void;
  setScriptLogline: (logline: string) => void;
  isScriptLoading: boolean;
}

export const ScriptContext = createContext<ScriptContextType>({
  script: null,
  lines: [],
  setLines: () => {},
  setScriptTitle: () => {},
  setScriptLogline: () => {},
  isScriptLoading: true,
});

// Function to parse the raw script content into lines
const parseContentToLines = (content: string): ScriptLine[] => {
    if (typeof content !== 'string') return [];
    const lineTexts = content.split('\n');
    
    return lineTexts.map((text, index) => {
        let type: ScriptElement = 'action';
        const trimmedText = text.trim();

        if (trimmedText.startsWith('INT.') || trimmedText.startsWith('EXT.')) {
        type = 'scene-heading';
        } else if (trimmedText.startsWith('(') && trimmedText.endsWith(')')) {
        type = 'parenthetical';
        } else if (trimmedText.endsWith('TO:')) {
        type = 'transition';
        } else if (/^[A-Z\s]+$/.test(trimmedText) && trimmedText.length > 0 && trimmedText.length < 35 && !trimmedText.includes('(')) {
            // Heuristic for character: ALL CAPS, short, and not a transition.
            // Look at previous line to be more certain.
            const prevLine = lineTexts[index - 1]?.trim() ?? '';
            if (prevLine === '' || prevLine.endsWith('TO:')) { // Previous line was empty or a transition
                type = 'character';
            }
        } else if (index > 0) {
            const prevLine = lineTexts[index - 1]?.trim() ?? '';
            const prevLineIsCharacter = /^[A-Z\s]+$/.test(prevLine) && prevLine.length < 35 && !prevLine.includes('(');
            if(prevLineIsCharacter) {
                type = 'dialogue';
            }
        }

        return { id: `line-${index}-${Date.now()}`, type, text };
    });
};

export const ScriptProvider = ({ children, scriptId }: { children: ReactNode, scriptId: string }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [localScript, setLocalScript] = useState<Script | null>(null);
  const [lines, setLocalLines] = useState<ScriptLine[]>([]);

  const scriptDocRef = useMemoFirebase(
    () => (user && firestore && scriptId ? doc(firestore, 'users', user.uid, 'scripts', scriptId) : null),
    [user, firestore, scriptId]
  );
  
  const { data: firestoreScript, isLoading: isDocLoading } = useDoc<Script>(scriptDocRef);

  const [debouncedLines] = useDebounce(lines, 1000);

  
  useEffect(() => {
    // This effect's job is to sync the firestoreScript data to our local state.
    // It is the single source of truth from the database.
    if (firestoreScript) {
        setLocalScript(firestoreScript);
        // Always re-parse the content from Firestore when the document changes.
        // This ensures that on script switch or import, we get the new content.
        const parsed = parseContentToLines(firestoreScript.content || '');
        setLocalLines(parsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreScript]);


  const updateFirestore = useCallback((field: 'content' | 'title' | 'logline', value: string) => {
    if (scriptDocRef) {
        setDoc(scriptDocRef, { 
            [field]: value,
            lastModified: serverTimestamp()
        }, { merge: true });
    }
  }, [scriptDocRef]);


  useEffect(() => {
    // This effect's job is to save the user's edits back to Firestore.
    // It only runs when the user-edited `debouncedLines` change.
    const newContent = debouncedLines.map(line => line.text.replace(/<br>/g, '')).join('\n');
    
    // Only update if there are lines to save and the content is different
    // from what we know is in the database.
    if (debouncedLines.length > 0 && localScript && newContent !== localScript.content) {
      updateFirestore('content', newContent);
    }
  }, [debouncedLines, localScript, updateFirestore]);

  const setLines = useCallback((linesOrContent: ScriptLine[] | string | ((prev: ScriptLine[]) => ScriptLine[])) => {
    if (typeof linesOrContent === 'string') {
        const newLines = parseContentToLines(linesOrContent);
        setLocalLines(newLines);
    } else {
        setLocalLines(linesOrContent);
    }
  }, []);

  const setScriptTitle = (title: string) => {
    setLocalScript(prev => prev ? { ...prev, title } : null);
    updateFirestore('title', title);
  };
  
  const setScriptLogline = (logline: string) => {
      setLocalScript(prev => prev ? { ...prev, logline } : null);
      updateFirestore('logline', logline);
  }
  
  const value = { 
    script: localScript,
    lines,
    setLines,
    setScriptTitle,
    setScriptLogline,
    isScriptLoading: isDocLoading || !localScript
  };

  return (
    <ScriptContext.Provider value={value}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useScript = () => {
    const context = useContext(ScriptContext);
    if (!context) {
        throw new Error('useScript must be used within a ScriptProvider');
    }
    return context;
}
