'use client';

import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { FavoritesProvider } from '@/lib/contexts/FavoritesContext';
import { RecentToolsProvider } from '@/lib/contexts/RecentToolsContext';
import { CommandPaletteProvider } from '@/lib/contexts/CommandPaletteContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <RecentToolsProvider>
          <CommandPaletteProvider>
            {children}
            <Toaster />
          </CommandPaletteProvider>
        </RecentToolsProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
