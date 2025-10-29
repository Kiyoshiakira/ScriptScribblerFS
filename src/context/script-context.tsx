'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Script {
    id: string;
    title: string;
    content: string;
    [key: string]: any; 
}

interface ScriptContextType {
  script: Script | null;
  setScriptContent: (content: string) => void;
  setScriptTitle: (title: string) => void;
  isScriptLoading: boolean;
}

export const ScriptContext = createContext<ScriptContextType>({
  script: null,
  setScriptContent: () => {},
  setScriptTitle: () => {},
  isScriptLoading: true,
});

export const ScriptProvider = ({ children, scriptId }: { children: ReactNode, scriptId: string }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [localScript, setLocalScript] = useState<Script | null>(null);

  const scriptDocRef = useMemoFirebase(
    () => (user && firestore && scriptId ? doc(firestore, 'users', user.uid, 'scripts', scriptId) : null),
    [user, firestore, scriptId]
  );
  
  const { data: firestoreScript, isLoading: isDocLoading } = useDoc<Script>(scriptDocRef);

  useEffect(() => {
    if (firestoreScript) {
        setLocalScript(firestoreScript);
    }
  }, [firestoreScript]);

  const updateFirestore = useCallback((field: 'content' | 'title', value: string) => {
    if (scriptDocRef) {
        setDoc(scriptDocRef, { 
            [field]: value,
            lastModified: serverTimestamp()
        }, { merge: true });
    }
  }, [scriptDocRef]);


  const setScriptContent = (content: string) => {
    setLocalScript(prev => prev ? { ...prev, content } : null);
    updateFirestore('content', content);
  };

  const setScriptTitle = (title: string) => {
    setLocalScript(prev => prev ? { ...prev, title } : null);
    updateFirestore('title', title);
  };
  
  const value = { 
    script: localScript,
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
