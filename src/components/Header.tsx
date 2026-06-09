'use client';

import Link from 'next/link';
import { CommandPaletteButton } from './CommandPaletteButton';
import { SettingsDialog } from './SettingsDialog';
import { useSettings } from '@/lib/contexts/SettingsContext';
import { cn } from '@/lib/utils';

export function Header() {
  const { fullWidth } = useSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div
        className={cn(
          fullWidth ? 'w-full max-w-none px-4 sm:px-6 lg:px-8' : 'container',
          'flex h-14 items-center justify-between gap-3 sm:h-16'
        )}
      >
        <Link
          href="/"
          onClick={() => {
            try {
              sessionStorage.removeItem('home-search-query');
              sessionStorage.removeItem('home-selected-category');
              sessionStorage.removeItem('home-favorites-only');
              sessionStorage.removeItem('home-scroll-y');
              window.dispatchEvent(new CustomEvent('reset-home-state'));
            } catch (e) {}
          }}
          className="min-w-0 text-lg font-bold transition-opacity hover:opacity-80 sm:text-2xl"
        >
          Dev Tools
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <CommandPaletteButton />
          <SettingsDialog />
        </div>
      </div>
    </header>
  );
}
