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

// A more robust function to parse the raw script content into lines
const parseContentToLines = (content: string): ScriptLine[] => {
    if (typeof content !== 'string') return [];
    
    const rawLines = content.split('\n');
    const parsedLines: ScriptLine[] = [];

    for (let i = 0; i < rawLines.length; i++) {
        const text = rawLines[i];
        const trimmedText = text.trim();
        let type: ScriptElement = 'action'; // Default to action

        const isAllUpperCase = trimmedText === trimmedText.toUpperCase() && trimmedText !== '';
        const prevLine = parsedLines[i - 1];
        const prevLineIsEmpty = prevLine ? prevLine.text.trim() === '' : true;

        if (trimmedText.startsWith('INT.') || trimmedText.startsWith('EXT.')) {
            type = 'scene-heading';
        } else if (trimmedText.endsWith('TO:')) {
            type = 'transition';
        } else if (trimmedText.startsWith('(') && trimmedText.endsWith(')')) {
            type = 'parenthetical';
        } else if (isAllUpperCase && (prevLineIsEmpty || prevLine?.type === 'action' || prevLine?.type === 'transition' || prevLine?.type === 'scene-heading')) {
             // Heuristic: A line in all caps on its own is likely a character name.
             // We check that it doesn't contain lowercase letters to be more certain.
             if (!/[a-z]/.test(trimmedText)) {
                type = 'character';
             }
        } else if (prevLine?.type === 'character' || prevLine?.type === 'parenthetical') {
            type = 'dialogue';
        }
        
        parsedLines.push({
            id: `line-${i}-${Date.now()}`,
            type,
            text,
        });
    }

    return parsedLines;
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

  const updateFirestore = useCallback((field: 'content' | 'title' | 'logline', value: string) => {
    if (scriptDocRef) {
        setDoc(scriptDocRef, { 
            [field]: value,
            lastModified: serverTimestamp()
        }, { merge: true });
    }
  }, [scriptDocRef]);
  
  useEffect(() => {
    // Syncs firestore data to local state. This is the source of truth from the DB.
    if (firestoreScript) {
        // Update local script if it's different
        setLocalScript(firestoreScript);

        // Only update lines if the content is truly different to avoid re-parsing and losing cursor position.
        const currentContent = lines.map(line => line.text.replace(/<br>/g, '')).join('\n');
        if (firestoreScript.content !== currentContent) {
           const parsed = parseContentToLines(firestoreScript.content || '');
           setLocalLines(parsed);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreScript]);


  useEffect(() => {
    // Saves user edits back to Firestore.
    const newContent = debouncedLines.map(line => line.text.replace(/<br>/g, '')).join('\n');
    
    // Only update if there's content to save and it's different from what's in our local truth (the script object).
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
