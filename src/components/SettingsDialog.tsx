'use client';

import { Moon, Settings, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Switch } from './ui/switch';
import { useFavorites } from '@/lib/contexts/FavoritesContext';
import { useRecentTools } from '@/lib/contexts/RecentToolsContext';
import { useSettings } from '@/lib/contexts/SettingsContext';
import { useTheme } from '@/lib/contexts/ThemeContext';

export function SettingsDialog() {
  const { theme, toggleTheme } = useTheme();
  const { compactMode, setCompactMode } = useSettings();
  const { favorites, clearFavorites } = useFavorites();
  const { recentTools, clearRecentTools } = useRecentTools();

  const handleClearFavorites = () => {
    clearFavorites();
    toast.success('Favorites cleared');
  };

  const handleClearRecents = () => {
    clearRecentTools();
    toast.success('Recent tools cleared');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings" title="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Adjust the interface and clear local browsing data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium">Appearance</h3>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Compact Mode</p>
                <p className="text-sm text-muted-foreground">
                  Show more tools by trimming descriptions and spacing.
                </p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
                aria-label="Toggle compact mode"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Local Data</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={handleClearFavorites}
                disabled={favorites.length === 0}
              >
                Clear Favorites
              </Button>
              <Button
                variant="outline"
                onClick={handleClearRecents}
                disabled={recentTools.length === 0}
              >
                Clear Recents
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
