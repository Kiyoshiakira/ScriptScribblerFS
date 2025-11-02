
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, setDoc, serverTimestamp, query, orderBy, addDoc } from 'firebase/firestore';
import { useDebounce } from 'use-debounce';
import type { Character } from '@/components/views/characters-view';
import type { Scene } from '@/components/views/scenes-view';
import type { Note } from '@/components/views/notes-view';
import { ScriptDocument, ScriptBlock, ScriptBlockType } from '@/lib/editor-types';
import { parseScreenplay, serializeScript } from '@/lib/screenplay-parser';


interface Script {
    id: string;
    title: string;
    content: string; // The raw string content for Firestore
    logline?: string;
    [key: string]: any; 
}

export interface Comment {
    id: string;
    blockId: string;
    authorId: string;
    content: string;
    createdAt: any;
    updatedAt: any;
}


interface ScriptContextType {
  script: Script | null;
  document: ScriptDocument | null; // The structured document
  setBlocks: (blocks: ScriptBlock[]) => void;
  setScriptTitle: (title: string) => void;
  setScriptLogline: (logline: string) => void;
  splitScene: (blockId: string) => void;
  addComment: (blockId: string, content: string) => void;
  isScriptLoading: boolean;
  characters: Character[] | null;
  scenes: Scene[] | null;
  notes: Note[] | null;
  comments: Comment[] | null;
}

export const ScriptContext = createContext<ScriptContextType>({
  script: null,
  document: null,
  setBlocks: () => {},
  setScriptTitle: () => {},
  setScriptLogline: () => {},
  splitScene: () => {},
  addComment: () => {},
  isScriptLoading: true,
  characters: null,
  scenes: null,
  notes: null,
  comments: null,
});

export const ScriptProvider = ({ children, scriptId }: { children: ReactNode, scriptId: string }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [localScript, setLocalScript] = useState<Script | null>(null);
  const [localDocument, setLocalDocument] = useState<ScriptDocument | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scriptDocRef = useMemoFirebase(
    () => {
        if (user && firestore && scriptId) {
            return doc(firestore, 'users', user.uid, 'scripts', scriptId);
        }
        return null;
    },
    [user, firestore, scriptId]
  );
  
  const { data: firestoreScript, isLoading: isDocLoading } = useDoc<Script>(scriptDocRef);

  const [debouncedDocument] = useDebounce(localDocument, 1000);
  const [debouncedTitle] = useDebounce(localScript?.title, 1000);
  const [debouncedLogline] = useDebounce(localScript?.logline, 1000);


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

  const commentsCollectionRef = useMemoFirebase(
    () => (user && firestore && scriptId ? collection(firestore, 'users', user.uid, 'scripts', scriptId, 'comments') : null),
    [firestore, user, scriptId]
  );
  const commentsQuery = useMemoFirebase(
    () => (commentsCollectionRef ? query(commentsCollectionRef, orderBy('createdAt', 'asc')) : null),
    [commentsCollectionRef]
  );
  const { data: comments, isLoading: areCommentsLoading } = useCollection<Comment>(commentsQuery);

  const updateFirestore = useCallback((dataToUpdate: Partial<Script>) => {
    if (scriptDocRef && Object.keys(dataToUpdate).length > 0) {
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
  
  // Effect for initial data load
  useEffect(() => {
    if (firestoreScript && isInitialLoad) {
        setLocalScript(firestoreScript);
        setLocalDocument(parseScreenplay(firestoreScript.content));
        setIsInitialLoad(false);
    }
  }, [firestoreScript, isInitialLoad]);

  // Debounced effect for saving content changes
  useEffect(() => {
    if (isInitialLoad || !debouncedDocument) return;

    const newContent = serializeScript(debouncedDocument);
    // Only save if content has actually changed from what's in Firestore
    if (newContent.trim() !== firestoreScript?.content.trim()) {
      updateFirestore({ content: newContent });
    }
  }, [debouncedDocument, firestoreScript, isInitialLoad, updateFirestore]);

  // Debounced effect for saving title changes
  useEffect(() => {
    if (isInitialLoad || debouncedTitle === undefined) return;
    if (debouncedTitle !== firestoreScript?.title) {
        updateFirestore({ title: debouncedTitle });
    }
  }, [debouncedTitle, firestoreScript, isInitialLoad, updateFirestore]);

  // Debounced effect for saving logline changes
  useEffect(() => {
    if (isInitialLoad || debouncedLogline === undefined) return;
    if (debouncedLogline !== firestoreScript?.logline) {
        updateFirestore({ logline: debouncedLogline });
    }
  }, [debouncedLogline, firestoreScript, isInitialLoad, updateFirestore]);


  const setBlocks = useCallback((blocks: ScriptBlock[]) => {
    setLocalDocument({ blocks });
  }, []);

  const setScriptTitle = useCallback((title: string) => {
    setLocalScript(prev => prev ? { ...prev, title } : null);
  }, []);
  
  const setScriptLogline = useCallback((logline: string) => {
    setLocalScript(prev => prev ? { ...prev, logline } : null);
  }, []);

  const splitScene = useCallback((blockId: string) => {
    setLocalDocument(prevDoc => {
        if (!prevDoc) return null;

        const blockIndex = prevDoc.blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return prevDoc;

        const newSceneHeading: ScriptBlock = {
            id: `block_${Date.now()}`,
            type: ScriptBlockType.SCENE_HEADING,
            text: 'INT. NEW SCENE - DAY',
        };

        const newBlocks = [...prevDoc.blocks];
        newBlocks.splice(blockIndex + 1, 0, newSceneHeading);

        return { ...prevDoc, blocks: newBlocks };
    });
  }, []);

  const addComment = useCallback((blockId: string, content: string) => {
      if (!commentsCollectionRef || !user) return;
      
      const newComment = {
          blockId,
          content,
          authorId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      };

      addDoc(commentsCollectionRef, newComment).catch(serverError => {
          const permissionError = new FirestorePermissionError({
              path: commentsCollectionRef.path,
              operation: 'create',
              requestResourceData: newComment,
          });
          errorEmitter.emit('permission-error', permissionError);
      });

  }, [commentsCollectionRef, user]);
  
  const isScriptLoading = isInitialLoad || isDocLoading;

  const value = { 
    script: localScript,
    document: localDocument,
    setBlocks,
    setScriptTitle,
    setScriptLogline,
    splitScene,
    addComment,
    isScriptLoading,
    characters,
    scenes,
    notes,
    comments,
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
