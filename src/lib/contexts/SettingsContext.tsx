'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import {
  getCompactMode,
  setCompactMode as setCompactModeStorage,
  getFullWidth,
  setFullWidth as setFullWidthStorage,
} from '@/lib/utils/storage';

interface SettingsContextType {
  compactMode: boolean;
  setCompactMode: (compactMode: boolean) => void;
  fullWidth: boolean;
  setFullWidth: (fullWidth: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [compactMode, setCompactModeState] = useState(false);
  const [fullWidth, setFullWidthState] = useState(false);

  useEffect(() => {
    setCompactModeState(getCompactMode());
    setFullWidthState(getFullWidth());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:compact-mode') {
        setCompactModeState(getCompactMode());
      } else if (e.key === 'dev-toolbox:full-width') {
        setFullWidthState(getFullWidth());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setCompactMode = useCallback((nextCompactMode: boolean | ((prev: boolean) => boolean)) => {
    setCompactModeState((prev) => {
      const value = typeof nextCompactMode === 'function' ? nextCompactMode(prev) : nextCompactMode;
      setCompactModeStorage(value);
      return value;
    });
  }, []);

  const setFullWidth = useCallback((nextFullWidth: boolean | ((prev: boolean) => boolean)) => {
    setFullWidthState((prev) => {
      const value = typeof nextFullWidth === 'function' ? nextFullWidth(prev) : nextFullWidth;
      setFullWidthStorage(value);
      return value;
    });
  }, []);

  // Keyboard shortcut listener for Alt + W (Full Width) and Alt + C (Compact Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.altKey &&
        !(
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement ||
          document.activeElement?.getAttribute('contenteditable') === 'true'
        )
      ) {
        const key = e.key.toLowerCase();
        if (key === 'w') {
          e.preventDefault();
          setFullWidth((prev) => {
            const next = !prev;
            toast.success(next ? 'Full width mode enabled' : 'Full width mode disabled', {
              id: 'full-width-toggle',
            });
            return next;
          });
        } else if (key === 'c') {
          e.preventDefault();
          setCompactMode((prev) => {
            const next = !prev;
            toast.success(next ? 'Compact mode enabled' : 'Compact mode disabled', {
              id: 'compact-mode-toggle',
            });
            return next;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setFullWidth, setCompactMode]);

  const value = useMemo(
    () => ({ compactMode, setCompactMode, fullWidth, setFullWidth }),
    [compactMode, setCompactMode, fullWidth, setFullWidth]
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
