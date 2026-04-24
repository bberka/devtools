'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Clock, Star, ArrowRight } from 'lucide-react';
import { TOOLS, CATEGORIES } from '@/lib/utils/tools-config';
import type { Tool, ToolCategory } from '@/lib/types';
import { useCommandPalette } from '@/lib/contexts/CommandPaletteContext';
import { useFavorites } from '@/lib/contexts/FavoritesContext';
import { useRecentTools } from '@/lib/contexts/RecentToolsContext';
import { getModifierKey, isModifierKey } from '@/lib/utils/keyboard';
import { toast } from 'sonner';
import { Dialog, DialogContent } from './ui/dialog';

export function CommandPalette() {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const { favorites, toggleFavorite } = useFavorites();
  const { recentTools, addRecentTool, clearRecentTools } = useRecentTools();

  const [search, setSearch] = useState('');
  const [modKey, setModKey] = useState('Ctrl');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect OS on mount
  useEffect(() => {
    setModKey(getModifierKey());
  }, []);

  // Auto-focus search input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure dialog is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Clear search when palette closes
  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedTool(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;

    const syncSelectedTool = () => {
      const selectedItem = listRef.current?.querySelector<HTMLElement>(
        '[cmdk-item][data-selected="true"]'
      );

      setSelectedTool(selectedItem?.getAttribute('data-value') ?? null);
    };

    const frame = window.requestAnimationFrame(syncSelectedTool);
    const observer = new MutationObserver(syncSelectedTool);

    observer.observe(listRef.current, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-selected', 'hidden'],
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [open, search, recentTools.length, favorites.length]);

  // Handle keyboard shortcuts within the palette
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }

      // Ctrl/Cmd+Shift+Delete to clear recents
      if (e.key === 'Delete' && e.shiftKey && isModifierKey(e)) {
        e.preventDefault();
        clearRecentTools();
        toast.success('Recent tools cleared');
        return;
      }

      // Ctrl/Cmd+Shift+F to toggle favorite on selected tool
      if (key === 'f' && e.shiftKey && isModifierKey(e) && selectedTool) {
        e.preventDefault();
        handleToggleFavorite(selectedTool);
        return;
      }

      // Ctrl/Cmd+Enter to open in new tab
      if (e.key === 'Enter' && isModifierKey(e) && selectedTool) {
        e.preventDefault();
        addRecentTool(selectedTool);
        window.open(`/tools/${selectedTool}`, '_blank');
        setOpen(false);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    open,
    selectedTool,
    setOpen,
    clearRecentTools,
    addRecentTool,
    favorites,
  ]);

  // Get tool data for recent tools
  const recentToolsData = useMemo(() => {
    return recentTools
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter((tool): tool is Tool => Boolean(tool));
  }, [recentTools]);

  // Get tool data for favorites
  const favoriteToolsData = useMemo(() => {
    return favorites
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter((tool): tool is Tool => Boolean(tool));
  }, [favorites]);

  // Group remaining tools by category
  const groupedTools = useMemo(() => {
    const groups: Record<ToolCategory, Tool[]> = {
      converters: [],
      'encoders-decoders': [],
      generators: [],
      'formatters-validators': [],
      'text-tools': [],
      utilities: [],
      security: [],
      networking: [],
      design: [],
    };

    // Get all tool IDs that are already in recent or favorites
    const displayedIds = new Set([...recentTools, ...favorites]);

    // Add remaining tools to groups
    TOOLS.forEach((tool) => {
      if (!displayedIds.has(tool.id)) {
        groups[tool.category].push(tool);
      }
    });

    return groups;
  }, [recentTools, favorites]);

  // Handle navigation to tool
  const handleNavigate = (toolId: string, openInNewTab: boolean = false) => {
    // Track in recent tools
    addRecentTool(toolId);

    if (openInNewTab) {
      // Open in new tab
      window.open(`/tools/${toolId}`, '_blank');
    } else {
      // Navigate in current tab using Next.js router
      router.push(`/tools/${toolId}`);
    }

    // Close palette
    setOpen(false);
  };

  const handleToggleFavorite = (toolId: string) => {
    const wasFavorite = favorites.includes(toolId);
    toggleFavorite(toolId);
    toast.success(wasFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        hideClose
        className="w-[calc(100%-2rem)] max-w-2xl gap-0 overflow-hidden border bg-popover p-0 text-popover-foreground"
      >
        <Command
          className="flex max-h-[min(80vh,36rem)] min-h-0 flex-col overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="Search tools..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Results */}
          <Command.List
            ref={listRef}
            className="max-h-[50vh] min-h-0 overflow-y-auto p-2 scrollbar-thin md:max-h-[400px]"
            style={{
              height: 'var(--cmdk-list-height)',
              scrollPaddingBlockStart: '0.5rem',
              scrollPaddingBlockEnd: '0.5rem',
            }}
          >
              <Command.Empty>
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No tools found matching &quot;{search}&quot;
                </div>
              </Command.Empty>

              {/* Recent Tools Group */}
              {recentToolsData.length > 0 && !search && (
                <Command.Group heading="Recent">
                  {recentToolsData.map((tool) => (
                    <Command.Item
                      key={tool.id}
                      value={tool.id}
                      onSelect={(value: string) => handleNavigate(value)}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{tool.name}</span>
                      <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Favorites Group */}
              {favoriteToolsData.length > 0 && !search && (
                <Command.Group heading="Favorites">
                  {favoriteToolsData.map((tool) => (
                    <Command.Item
                      key={tool.id}
                      value={tool.id}
                      onSelect={(value: string) => handleNavigate(value)}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    >
                      <Star className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="flex-1">{tool.name}</span>
                      <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* All Tools Grouped by Category */}
              {(Object.entries(groupedTools) as Array<[ToolCategory, Tool[]]>).map(
                ([categoryId, categoryTools]) => {
                  if (categoryTools.length === 0) return null;

                  const category = CATEGORIES[categoryId];

                  return (
                    <Command.Group key={categoryId} heading={category.name}>
                      {categoryTools.map((tool) => (
                        <Command.Item
                          key={tool.id}
                          value={tool.id}
                          keywords={[tool.name, tool.description, ...(tool.keywords || [])]}
                          onSelect={() => handleNavigate(tool.id)}
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                        >
                          <span className="flex-1">{tool.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {category.name}
                          </span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                }
              )}
          </Command.List>

          {/* Footer with shortcuts */}
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                    ↑↓
                  </kbd>{' '}
                  navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                    ↵
                  </kbd>{' '}
                  open
                </span>
                <span className="hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                    {modKey}+↵
                  </kbd>{' '}
                  new tab
                </span>
              </div>
              <div className="flex gap-3">
                {recentToolsData.length > 0 && !search && (
                  <button
                    type="button"
                    onClick={() => {
                      clearRecentTools();
                      toast.success('Recent tools cleared');
                    }}
                    className="hover:text-foreground transition-colors"
                    title="Clear recent tools"
                  >
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                      {modKey}+⇧+Del
                    </kbd>{' '}
                    clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => selectedTool && handleToggleFavorite(selectedTool)}
                  className="hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  title="Toggle favorite for focused tool"
                  disabled={!selectedTool}
                >
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                    {modKey}+⇧+F
                  </kbd>{' '}
                  favorite
                </button>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                    esc
                  </kbd>{' '}
                  close
                </span>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
