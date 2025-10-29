'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useDebounce } from 'use-debounce';

interface Script {
    id: string;
    title: string;
    content: string;
    [key: string]: any; 
}

interface ScriptContextType {
  script: Script | null;
  scriptContent: string | undefined;
  setScriptContent: (content: string) => void;
  setScriptTitle: (title: string) => void;
  isScriptLoading: boolean;
}

export const ScriptContext = createContext<ScriptContextType>({
  script: null,
  scriptContent: undefined,
  setScriptContent: () => {},
  setScriptTitle: () => {},
  isScriptLoading: true,
});

export const ScriptProvider = ({ children, scriptId }: { children: ReactNode, scriptId: string }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [localScript, setLocalScript] = useState<Script | null>(null);
  const [localContent, setLocalContent] = useState<string | undefined>(undefined);

  const scriptDocRef = useMemoFirebase(
    () => (user && firestore && scriptId ? doc(firestore, 'users', user.uid, 'scripts', scriptId) : null),
    [user, firestore, scriptId]
  );
  
  const { data: firestoreScript, isLoading: isDocLoading } = useDoc<Script>(scriptDocRef);

  const [debouncedContent] = useDebounce(localContent, 1000);

  useEffect(() => {
    if (firestoreScript) {
        setLocalScript(firestoreScript);
        if (localContent === undefined) { // Only set initial content
            setLocalContent(firestoreScript.content);
        }
    }
  }, [firestoreScript, localContent]);

  const updateFirestore = useCallback((field: 'content' | 'title', value: string) => {
    if (scriptDocRef) {
        setDoc(scriptDocRef, { 
            [field]: value,
            lastModified: serverTimestamp()
        }, { merge: true });
    }
  }, [scriptDocRef]);


  useEffect(() => {
    // Only update firestore if the debounced content is a string (meaning it has been set)
    // and is different from the original firestore content.
    if (typeof debouncedContent === 'string' && firestoreScript && debouncedContent !== firestoreScript.content) {
      updateFirestore('content', debouncedContent);
    }
  }, [debouncedContent, firestoreScript, updateFirestore]);


  const setScriptContent = (content: string) => {
    setLocalContent(content);
  };

  const setScriptTitle = (title: string) => {
    setLocalScript(prev => prev ? { ...prev, title } : null);
    updateFirestore('title', title);
  };
  
  const value = { 
    script: localScript,
    scriptContent: localContent,
    setScriptContent,
    setScriptTitle,
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
