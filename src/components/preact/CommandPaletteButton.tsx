import { useState, useEffect } from 'preact/hooks';
import { Button } from './ui/button';
import { Search } from 'lucide-preact';
import { getModifierKey } from '@/lib/utils/keyboard';

/**
 * Button to trigger the Command Palette
 * Shows search icon with "Search" text on desktop and OS-appropriate shortcut badge
 * Mobile shows only the search icon
 */
export function CommandPaletteButton() {
  const [modKey, setModKey] = useState('Ctrl');

  useEffect(() => {
    // Detect OS on mount
    setModKey(getModifierKey());
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('openCommandPalette'));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="gap-2 h-9"
      aria-label="Open command palette"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
        {modKey}+K
      </kbd>
    </Button>
  );
}
