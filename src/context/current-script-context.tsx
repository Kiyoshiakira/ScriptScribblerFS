'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

const SCRIPT_STORAGE_KEY = 'scriptscribbler-current-script-id';

interface CurrentScriptContextType {
  currentScriptId: string | null;
  setCurrentScriptId: (id: string | null) => void;
  isCurrentScriptLoading: boolean;
}

export const CurrentScriptContext = createContext<CurrentScriptContextType>({
  currentScriptId: null,
  setCurrentScriptId: () => {},
  isCurrentScriptLoading: true,
});

export const CurrentScriptProvider = ({ children }: { children: ReactNode }) => {
  const [currentScriptId, setCurrentScriptIdState] = useState<string | null>(null);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // 1. Load from localStorage on initial mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SCRIPT_STORAGE_KEY);
      if (item) {
        setCurrentScriptIdState(item);
      }
    } catch (error) {
      console.warn(`[CurrentScriptContext] Error reading localStorage key “${SCRIPT_STORAGE_KEY}”:`, error);
    } finally {
      setIsLoadedFromStorage(true);
    }
  }, []);

  const scriptsCollection = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'scripts') : null),
    [user, firestore]
  );

  const latestScriptQuery = useMemoFirebase(
      () => (scriptsCollection ? query(scriptsCollection, orderBy('lastModified', 'desc'), limit(1)) : null),
      [scriptsCollection]
  );
  
  const { data: latestScripts, isLoading: areScriptsLoading } = useCollection<{id: string}>(latestScriptQuery);

  // 2. If no script is set, default to the most recent one from Firestore
  useEffect(() => {
    if (isLoadedFromStorage && !currentScriptId && !isUserLoading && !areScriptsLoading) {
      if (latestScripts && latestScripts.length > 0) {
        setCurrentScriptIdState(latestScripts[0].id);
      } else {
        setCurrentScriptIdState(null); // Explicitly set to null if no scripts exist
      }
    }
  }, [isLoadedFromStorage, currentScriptId, isUserLoading, areScriptsLoading, latestScripts]);

  const setCurrentScriptId = useCallback((id: string | null) => {
    try {
      if (id) {
        window.localStorage.setItem(SCRIPT_STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(SCRIPT_STORAGE_KEY);
      }
      setCurrentScriptIdState(id);
    } catch (error) {
      console.warn(`[CurrentScriptContext] Error setting localStorage key “${SCRIPT_STORAGE_KEY}”:`, error);
    }
  }, []);
  
  const isCurrentScriptLoading = !isLoadedFromStorage || isUserLoading || areScriptsLoading;
  
  const value = { 
      currentScriptId,
      setCurrentScriptId,
      isCurrentScriptLoading,
  };

  return (
    <CurrentScriptContext.Provider value={value}>
      {children}
    </CurrentScriptContext.Provider>
  );
};

export const useCurrentScript = () => {
    const context = useContext(CurrentScriptContext);
    if (!context) {
        throw new Error('useCurrentScript must be used within a CurrentScriptProvider');
    }
    return context;
}
