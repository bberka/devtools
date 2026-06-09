'use client';

import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { FavoritesProvider } from '@/lib/contexts/FavoritesContext';
import { RecentToolsProvider } from '@/lib/contexts/RecentToolsContext';
import { CommandPaletteProvider } from '@/lib/contexts/CommandPaletteContext';
import { SettingsProvider } from '@/lib/contexts/SettingsContext';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <RecentToolsProvider>
          <SettingsProvider>
            <CommandPaletteProvider>
              <TooltipProvider delayDuration={300}>
                {children}
                <Toaster />
              </TooltipProvider>
            </CommandPaletteProvider>
          </SettingsProvider>
        </RecentToolsProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
