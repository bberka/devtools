'use client';

import Link from 'next/link';
import { CommandPaletteButton } from './CommandPaletteButton';
import { SettingsDialog } from './SettingsDialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-3 sm:h-16">
        <Link
          href="/"
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
