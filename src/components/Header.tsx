'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { CommandPaletteButton } from './CommandPaletteButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          Dev Tools
        </Link>
        <div className="flex items-center gap-2">
          <CommandPaletteButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
