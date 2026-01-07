import { useEffect, useState } from 'preact/hooks';
import { Moon, Sun } from 'lucide-preact';
import { Button } from './ui/button';
import { getTheme, setTheme } from '@/lib/utils/storage';

export function ThemeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = getTheme();
    setThemeState(savedTheme);

    // Listen for storage changes from other tabs (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:theme') {
        const newTheme = getTheme();
        setThemeState(newTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <Button
      variant="ghost"
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
  );
}
