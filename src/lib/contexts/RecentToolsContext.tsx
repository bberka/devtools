'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getRecentTools,
  addRecentTool as addRecentToolStorage,
} from '@/lib/utils/storage';

interface RecentToolsContextType {
  recentTools: string[];
  addRecentTool: (toolId: string) => void;
  clearRecentTools: () => void;
}

const RecentToolsContext = createContext<RecentToolsContextType | undefined>(
  undefined
);

export function RecentToolsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return getRecentTools();
  });

  const syncRecentTools = useCallback(() => {
    const nextRecentTools = getRecentTools();
    setRecentTools((currentRecentTools) => {
      if (
        currentRecentTools.length === nextRecentTools.length &&
        currentRecentTools.every((toolId, index) => toolId === nextRecentTools[index])
      ) {
        return currentRecentTools;
      }

      return nextRecentTools;
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:recent') {
        syncRecentTools();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncRecentTools]);

  const addRecentTool = useCallback((toolId: string) => {
    addRecentToolStorage(toolId);
    syncRecentTools();
  }, [syncRecentTools]);

  const clearRecentTools = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev-toolbox:recent');
      setRecentTools([]);
    }
  }, []);

  const value = useMemo(
    () => ({ recentTools, addRecentTool, clearRecentTools }),
    [recentTools, addRecentTool, clearRecentTools]
  );

  return (
    <RecentToolsContext.Provider value={value}>{children}</RecentToolsContext.Provider>
  );
}

export function useRecentTools() {
  const context = useContext(RecentToolsContext);
  if (!context) {
    throw new Error('useRecentTools must be used within RecentToolsProvider');
  }
  return context;
}
