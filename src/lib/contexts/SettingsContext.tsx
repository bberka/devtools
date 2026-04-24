'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCompactMode,
  setCompactMode as setCompactModeStorage,
} from '@/lib/utils/storage';

interface SettingsContextType {
  compactMode: boolean;
  setCompactMode: (compactMode: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [compactMode, setCompactModeState] = useState(false);

  useEffect(() => {
    setCompactModeState(getCompactMode());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:compact-mode') {
        setCompactModeState(getCompactMode());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setCompactMode = useCallback((nextCompactMode: boolean) => {
    setCompactModeStorage(nextCompactMode);
    setCompactModeState(nextCompactMode);
  }, []);

  const value = useMemo(
    () => ({ compactMode, setCompactMode }),
    [compactMode, setCompactMode]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
