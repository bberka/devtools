import { useEffect, useState, useMemo, useRef } from 'preact/hooks';
import { Command } from 'cmdk';
import { Search, Clock, Star, ArrowRight } from 'lucide-preact';
import { getRecentTools, getFavorites, addRecentTool } from '@/lib/utils/storage';
import { TOOLS, CATEGORIES } from '@/lib/utils/tools-config';
import type { Tool, ToolCategory } from '@/lib/types';
import { useCommandPalette } from './hooks';
import { getModifierKey, isModifierKey } from '@/lib/utils/keyboard';
import { toast } from 'sonner';
import { ScrollArea } from './ui/scroll-area';
import '@/styles/cmdk.css';

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const [search, setSearch] = useState('');
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [modKey, setModKey] = useState('Ctrl');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect OS on mount
  useEffect(() => {
    setModKey(getModifierKey());
  }, []);

  // Load recent tools and favorites on mount
  useEffect(() => {
    setRecentTools(getRecentTools());
    setFavorites(getFavorites());

    // Listen for favorite toggle events
    const handleFavoriteToggle = () => {
      setFavorites(getFavorites());
    };

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:favorites') {
        setFavorites(getFavorites());
      } else if (e.key === 'dev-toolbox:recent') {
        setRecentTools(getRecentTools());
      }
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggle);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggle);
      window.removeEventListener('storage', handleStorageChange);
    };
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

  // Handle keyboard shortcuts within the palette
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }

      // Ctrl/Cmd+Shift+Delete to clear recents
      if (e.key === 'Delete' && e.shiftKey && isModifierKey(e)) {
        e.preventDefault();
        localStorage.removeItem('dev-toolbox:recent');
        setRecentTools([]);
        toast.success('Recent tools cleared');
        return;
      }

      // Ctrl/Cmd+Shift+C to copy tool link
      if (e.key === 'c' && e.shiftKey && isModifierKey(e) && selectedTool) {
        e.preventDefault();
        const url = `${window.location.origin}/tools/${selectedTool}`;
        navigator.clipboard.writeText(url);
        toast.success('Tool link copied to clipboard');
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
  }, [open, selectedTool, setOpen]);

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
    setRecentTools(getRecentTools());

    if (openInNewTab) {
      // Open in new tab
      window.open(`/tools/${toolId}`, '_blank');
    } else {
      // Navigate in current tab (full page reload)
      window.location.href = `/tools/${toolId}`;
    }

    // Close palette
    setOpen(false);
  };

  // Handle clear recents
  const handleClearRecents = () => {
    localStorage.removeItem('dev-toolbox:recent');
    setRecentTools([]);
    toast.success('Recent tools cleared');
  };

  // Handle copy tool link
  const handleCopyToolLink = (toolId: string) => {
    const url = `${window.location.origin}/tools/${toolId}`;
    navigator.clipboard.writeText(url);
    toast.success('Tool link copied to clipboard');
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={() => setOpen(false)}
    >
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[48%] duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="rounded-lg border bg-popover text-popover-foreground shadow-lg overflow-hidden"
          loop
          value={selectedTool || undefined}
          onValueChange={(value: string) => setSelectedTool(value)}
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
          <ScrollArea className="max-h-[50vh] md:max-h-[400px]">
            <Command.List className="p-2">
            <Command.Empty>
              <div className="py-6 text-center text-sm text-muted-foreground">
                No tools found matching "{search}"
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
            {Object.entries(groupedTools).map(([categoryId, categoryTools]) => {
              if (categoryTools.length === 0) return null;

              const category = CATEGORIES[categoryId as ToolCategory];

              return (
                <Command.Group key={categoryId} heading={category.name}>
                  {categoryTools.map((tool) => (
                    <Command.Item
                      key={tool.id}
                      value={`${tool.id} ${tool.name} ${tool.description} ${(tool.keywords || []).join(' ')}`}
                      onSelect={() => handleNavigate(tool.id)}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    >
                      <span className="flex-1">{tool.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{category.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
            </Command.List>
          </ScrollArea>

          {/* Footer with shortcuts */}
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd> open
                </span>
                <span className="hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{modKey}+↵</kbd> new tab
                </span>
              </div>
              <div className="flex gap-3">
                {recentToolsData.length > 0 && !search && (
                  <button
                    type="button"
                    onClick={handleClearRecents}
                    className="hover:text-foreground transition-colors"
                    title="Clear recent tools"
                  >
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{modKey}+⇧+Del</kbd> clear
                  </button>
                )}
                {selectedTool && (
                  <button
                    type="button"
                    onClick={() => handleCopyToolLink(selectedTool)}
                    className="hover:text-foreground transition-colors"
                    title="Copy tool link"
                  >
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{modKey}+⇧+C</kbd> copy link
                  </button>
                )}
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd> close
                </span>
              </div>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
