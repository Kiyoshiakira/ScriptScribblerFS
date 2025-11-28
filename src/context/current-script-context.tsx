'use client';

/**
 * =============================================================================
 * TOOL SEPARATION PATTERN - READ THIS BEFORE ADDING NEW TOOLS
 * =============================================================================
 * 
 * Each Scribbler tool (ScriptScribbler, StoryScribbler, and future tools) must
 * have COMPLETE SEPARATION of state and functionality by default.
 * 
 * RULES FOR TOOL SEPARATION:
 * 
 * 1. EACH TOOL GETS ITS OWN HOOK
 *    - ScriptScribbler components → useCurrentScript()
 *    - StoryScribbler components → useCurrentStory()
 *    - Future tools → create useCurrentToolName() hook
 * 
 * 2. NEVER MIX TOOL HOOKS IN SINGLE-TOOL COMPONENTS
 *    - A Chapters component should ONLY use useCurrentStory()
 *    - A Scenes component should ONLY use useCurrentScript()
 *    - This ensures tools work independently
 * 
 * 3. EXCEPTION: MULTI-TOOL VIEWS (like Dashboard)
 *    - Components that host multiple tools (Dashboard, Settings, etc.)
 *    - These MUST import and use ALL relevant hooks
 *    - Example: Dashboard uses both useCurrentScript() AND useCurrentStory()
 * 
 * 4. SCRIBBLER LINK (Shared Mode)
 *    - When projectLinkingMode === 'shared', tools share the same project
 *    - This is handled automatically by the setters - they sync both IDs
 *    - Components don't need to know about linking - just use their tool's hook
 * 
 * 5. ADDING A NEW TOOL (e.g., SonnetScribbler)
 *    a) Add new state: currentSonnetId, setCurrentSonnetIdState
 *    b) Add new localStorage key: SONNET_STORAGE_KEY
 *    c) Create new hook: useCurrentSonnet()
 *    d) Update Dashboard to use the new hook
 *    e) All SonnetScribbler components use ONLY useCurrentSonnet()
 * 
 * =============================================================================
 */

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useSettings } from './settings-context';

const SCRIPT_STORAGE_KEY = 'scriptscribbler-current-script-id';
const STORY_STORAGE_KEY = 'storyscribbler-current-script-id';

interface CurrentScriptContextType {
  // Per-tool project IDs
  currentScriptId: string | null;
  setCurrentScriptId: (id: string | null) => void;
  currentStoryId: string | null;
  setCurrentStoryId: (id: string | null) => void;
  isCurrentScriptLoading: boolean;
}

export const CurrentScriptContext = createContext<CurrentScriptContextType>({
  currentScriptId: null,
  setCurrentScriptId: () => {},
  currentStoryId: null,
  setCurrentStoryId: () => {},
  isCurrentScriptLoading: true,
});

export const CurrentScriptProvider = ({ children }: { children: ReactNode }) => {
  const [currentScriptId, setCurrentScriptIdState] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryIdState] = useState<string | null>(null);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { settings, isSettingsLoading } = useSettings();

  // Get the appropriate storage key and state based on the current mode
  const projectLinkingMode = settings.projectLinkingMode || 'shared';
  const isSharedMode = projectLinkingMode === 'shared';

  // 1. Load from localStorage on initial mount
  useEffect(() => {
    try {
      const scriptId = window.localStorage.getItem(SCRIPT_STORAGE_KEY);
      const storyId = window.localStorage.getItem(STORY_STORAGE_KEY);
      
      if (scriptId) {
        setCurrentScriptIdState(scriptId);
      }
      if (storyId) {
        setCurrentStoryIdState(storyId);
      }
    } catch (error) {
      console.warn(`[CurrentScriptContext] Error reading localStorage:`, error);
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
    if (isLoadedFromStorage && !isUserLoading && !areScriptsLoading && !isSettingsLoading) {
      // In shared mode, only set currentScriptId if it's not set
      if (isSharedMode && !currentScriptId) {
        if (latestScripts && latestScripts.length > 0) {
          setCurrentScriptIdState(latestScripts[0].id);
        } else {
          setCurrentScriptIdState(null);
        }
      }
      // In separate mode, set both if they're not set
      else if (!isSharedMode) {
        if (!currentScriptId) {
          if (latestScripts && latestScripts.length > 0) {
            setCurrentScriptIdState(latestScripts[0].id);
          } else {
            setCurrentScriptIdState(null);
          }
        }
        if (!currentStoryId) {
          if (latestScripts && latestScripts.length > 0) {
            setCurrentStoryIdState(latestScripts[0].id);
          } else {
            setCurrentStoryIdState(null);
          }
        }
      }
    }
  }, [isLoadedFromStorage, currentScriptId, currentStoryId, isUserLoading, areScriptsLoading, latestScripts, isSharedMode, isSettingsLoading]);

  // Helper function to sync a project ID to localStorage
  const syncToLocalStorage = useCallback((key: string, id: string | null) => {
    if (id) {
      window.localStorage.setItem(key, id);
    } else {
      window.localStorage.removeItem(key);
    }
  }, []);

  // Setter for currentScriptId with localStorage sync
  const setCurrentScriptId = useCallback((id: string | null) => {
    try {
      syncToLocalStorage(SCRIPT_STORAGE_KEY, id);
      setCurrentScriptIdState(id);
      // In shared mode, also update currentStoryId
      if (isSharedMode) {
        syncToLocalStorage(STORY_STORAGE_KEY, id);
        setCurrentStoryIdState(id);
      }
    } catch (error) {
      console.warn(`[CurrentScriptContext] Error setting currentScriptId:`, error);
    }
  }, [isSharedMode, syncToLocalStorage]);

  // Setter for currentStoryId with localStorage sync
  const setCurrentStoryId = useCallback((id: string | null) => {
    try {
      syncToLocalStorage(STORY_STORAGE_KEY, id);
      setCurrentStoryIdState(id);
      // In shared mode, also update currentScriptId
      if (isSharedMode) {
        syncToLocalStorage(SCRIPT_STORAGE_KEY, id);
        setCurrentScriptIdState(id);
      }
    } catch (error) {
      console.warn(`[CurrentScriptContext] Error setting currentStoryId:`, error);
    }
  }, [isSharedMode, syncToLocalStorage]);
  
  const isCurrentScriptLoading = !isLoadedFromStorage || isUserLoading || areScriptsLoading || isSettingsLoading;
  
  const value = { 
      currentScriptId,
      setCurrentScriptId,
      currentStoryId,
      setCurrentStoryId,
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

// Dedicated hook for StoryScribbler - provides clean separation from ScriptScribbler
export const useCurrentStory = () => {
    const context = useContext(CurrentScriptContext);
    if (!context) {
        throw new Error('useCurrentStory must be used within a CurrentScriptProvider');
    }
    return {
        currentStoryId: context.currentStoryId,
        setCurrentStoryId: context.setCurrentStoryId,
        isCurrentStoryLoading: context.isCurrentScriptLoading,
    };
}
