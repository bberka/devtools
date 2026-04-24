'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { useCommandPalette } from '@/lib/contexts/CommandPaletteContext';

export function CommandPaletteButton() {
  const { toggle } = useCommandPalette();
  const [modifierKey, setModifierKey] = useState('Ctrl');

  useEffect(() => {
    // Detect OS to show correct modifier key
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setModifierKey(isMac ? '⌘' : 'Ctrl');
  }, []);

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={toggle}
      aria-label="Open command palette"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">{modifierKey}</span>K
      </kbd>
    </Button>
  );
}
