'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, setDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useDebounce } from 'use-debounce';
import type { Character } from '@/components/views/characters-view';
import type { Scene } from '@/components/views/scenes-view';
import type { Note } from '@/components/views/notes-view';

interface Script {
    id: string;
    title: string;
    content: string; // The raw string content for Firestore
    logline?: string;
    [key: string]: any; 
}

interface ScriptContextType {
  script: Script | null;
  setLines: (content: string) => void;
  setScriptTitle: (title: string) => void;
  setScriptLogline: (logline: string) => void;
  isScriptLoading: boolean;
  characters: Character[] | null;
  scenes: Scene[] | null;
  notes: Note[] | null;
}

export const ScriptContext = createContext<ScriptContextType>({
  script: null,
  setLines: () => {},
  setScriptTitle: () => {},
  setScriptLogline: () => {},
  isScriptLoading: true,
  characters: null,
  scenes: null,
  notes: null,
});

export const ScriptProvider = ({ children, scriptId }: { children: ReactNode, scriptId: string }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [localScript, setLocalScript] = useState<Script | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  console.log(`[ScriptContext] Provider mounted for scriptId: ${scriptId}`);

  const scriptDocRef = useMemoFirebase(
    () => {
        if (user && firestore && scriptId) {
            console.log(`[ScriptContext] Creating doc reference for scriptId: ${scriptId}`);
            return doc(firestore, 'users', user.uid, 'scripts', scriptId);
        }
        console.log('[ScriptContext] Cannot create doc reference. Missing user, firestore, or scriptId.');
        return null;
    },
    [user, firestore, scriptId]
  );
  
  const { data: firestoreScript, isLoading: isDocLoading } = useDoc<Script>(scriptDocRef);

  const [debouncedScript] = useDebounce(localScript, 1000);

  const charactersCollectionRef = useMemoFirebase(
    () => (user && firestore && scriptId ? collection(firestore, 'users', user.uid, 'scripts', scriptId, 'characters') : null),
    [firestore, user, scriptId]
  );
  const { data: characters, isLoading: areCharactersLoading } = useCollection<Character>(charactersCollectionRef);

  const scenesCollection = useMemoFirebase(
    () => (user && firestore && scriptId ? collection(firestore, 'users', user.uid, 'scripts', scriptId, 'scenes') : null),
    [firestore, user, scriptId]
  );
  const scenesQuery = useMemoFirebase(
    () => (scenesCollection ? query(scenesCollection, orderBy('sceneNumber', 'asc')) : null),
    [scenesCollection]
  );
  const { data: scenes, isLoading: areScenesLoading } = useCollection<Scene>(scenesQuery);
  
  const notesCollection = useMemoFirebase(
    () => (user && firestore && scriptId ? collection(firestore, 'users', user.uid, 'scripts', scriptId, 'notes') : null),
    [firestore, user, scriptId]
  );
  const { data: notes, isLoading: areNotesLoading } = useCollection<Note>(notesCollection);

  const updateFirestore = useCallback((dataToUpdate: Partial<Script>) => {
    if (scriptDocRef) {
        console.log('[ScriptContext] Saving changes to Firestore:', dataToUpdate);
        const payload = { 
            ...dataToUpdate,
            lastModified: serverTimestamp()
        };
        setDoc(scriptDocRef, payload, { merge: true }).catch(serverError => {
             const permissionError = new FirestorePermissionError({
                path: scriptDocRef.path,
                operation: 'update',
                requestResourceData: payload,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
  }, [scriptDocRef]);
  
  useEffect(() => {
    if (firestoreScript) {
        if (isInitialLoad) {
            console.log('[ScriptContext] Initial load complete. Setting local script from Firestore.');
            setLocalScript(firestoreScript);
            setIsInitialLoad(false);
        } else {
            // This logic is complex. The goal is to accept remote changes
            // without overriding recent local typing. For now, we favor
            // local changes by only updating if the content is truly different
            // and the local state hasn't been modified recently.
            if (localScript && firestoreScript.content !== localScript.content) {
                console.log("[ScriptContext] Remote change detected, but local state is preserved to avoid overriding user input.");
            }
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreScript, isInitialLoad]);


  useEffect(() => {
    // Do not save anything until the initial load is complete and we have data.
    if (isInitialLoad || !debouncedScript || !firestoreScript) {
      return;
    }
    
    const changes: Partial<Script> = {};
    if (debouncedScript.content !== firestoreScript.content) {
      changes.content = debouncedScript.content;
    }
    if (debouncedScript.title !== firestoreScript.title) {
      changes.title = debouncedScript.title;
    }
    if (debouncedScript.logline !== firestoreScript.logline) {
      changes.logline = debouncedScript.logline;
    }

    // Only write to Firestore if there are actual changes to save.
    if (Object.keys(changes).length > 0) {
      updateFirestore(changes);
    }
  }, [debouncedScript, firestoreScript, isInitialLoad, updateFirestore]);

  const setLines = useCallback((content: string) => {
    setLocalScript(prev => prev ? { ...prev, content } : null);
  }, []);

  const setScriptTitle = useCallback((title: string) => {
    setLocalScript(prev => prev ? { ...prev, title } : null);
  }, []);
  
  const setScriptLogline = useCallback((logline: string) => {
    setLocalScript(prev => prev ? { ...prev, logline } : null);
  }, []);
  
  const isScriptLoading = isInitialLoad || isDocLoading;
  console.log('[ScriptContext] State:', { isScriptLoading, hasLocalScript: !!localScript });

  const value = { 
    script: localScript,
    setLines,
    setScriptTitle,
    setScriptLogline,
    isScriptLoading,
    characters,
    scenes,
    notes,
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
