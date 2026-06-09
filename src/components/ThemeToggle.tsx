'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { TooltipSimple } from './ui/tooltip';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TooltipSimple content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </TooltipSimple>
  );
}
