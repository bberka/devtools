import { useState, useEffect, useCallback } from 'preact/hooks';

/**
 * Custom hook for managing Command Palette state and keyboard shortcuts
 * Listens for Ctrl+K / Cmd+K and custom events to toggle the palette
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K (Windows/Linux) or Cmd+K (macOS)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };

    // Listen for custom event from Layout.astro or CommandPaletteButton
    const handleCustomOpen = () => toggle();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openCommandPalette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openCommandPalette', handleCustomOpen);
    };
  }, [toggle]);

  return { open, setOpen, toggle };
}
