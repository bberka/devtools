'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Lock,
  Sparkles,
  FileCheck,
  Type,
  Wrench,
  ShieldCheck,
  Globe,
  Palette,
  Calculator,
  FileText,
  Image as ImageIcon,
  Star,
  type LucideIcon,
} from 'lucide-react';

import { CategoryFilter } from './CategoryFilter';
import { FavoriteButton } from './FavoriteButton';
import { SearchBar } from './SearchBar';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CATEGORIES, filterTools, TOOLS } from '@/lib/utils/tools-config';
import { useFavorites } from '@/lib/contexts/FavoritesContext';
import { useSettings } from '@/lib/contexts/SettingsContext';
import { cn } from '@/lib/utils/cn';
import type { Tool, ToolCategory } from '@/lib/types';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  RefreshCw,
  Lock,
  Sparkles,
  FileCheck,
  Type,
  Wrench,
  ShieldCheck,
  Globe,
  Palette,
  Calculator,
  FileText,
  Image: ImageIcon,
};

export function HomeContent() {
  const { favorites } = useFavorites();
  const { compactMode } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredTools = useMemo(
    () =>
      filterTools(searchQuery, selectedCategory, showFavoritesOnly, favorites),
    [favorites, searchQuery, selectedCategory, showFavoritesOnly]
  );

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
      calculators: [],
      'pdf-tools': [],
      'image-tools': [],
    };

    filteredTools.forEach((tool) => {
      groups[tool.category].push(tool);
    });

    return groups;
  }, [filteredTools]);

  const favoriteTools = useMemo(
    () => TOOLS.filter((tool) => favorites.includes(tool.id)),
    [favorites]
  );

  const isInitializedRef = useRef(false);
  const hasRestoredScrollRef = useRef(false);
  const savedScrollPositionRef = useRef<number | null>(null);

  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const savedSearch = sessionStorage.getItem('home-search-query');
      const savedCategory = sessionStorage.getItem('home-selected-category');
      const savedFavoritesOnly = sessionStorage.getItem('home-favorites-only');
      const savedScroll = sessionStorage.getItem('home-scroll-y');

      if (savedSearch !== null) setSearchQuery(savedSearch);
      if (savedCategory !== null) {
        setSelectedCategory(savedCategory ? (savedCategory as ToolCategory) : null);
      }
      if (savedFavoritesOnly !== null) {
        setShowFavoritesOnly(savedFavoritesOnly === 'true');
      }

      if (savedScroll !== null) {
        const scrollY = parseInt(savedScroll, 10);
        if (scrollY > 0) {
          savedScrollPositionRef.current = scrollY;
        }
      }
    } catch (e) {
      console.error('Failed to restore home page state:', e);
    } finally {
      isInitializedRef.current = true;
    }
  }, []);

  // Save states to sessionStorage when they change
  useEffect(() => {
    if (!isInitializedRef.current) return;
    try {
      sessionStorage.setItem('home-search-query', searchQuery);
      sessionStorage.setItem('home-selected-category', selectedCategory || '');
      sessionStorage.setItem('home-favorites-only', showFavoritesOnly.toString());
    } catch (e) {}
  }, [searchQuery, selectedCategory, showFavoritesOnly]);

  // Restore scroll position when list is rendered and page height matches
  useEffect(() => {
    if (!isInitializedRef.current || hasRestoredScrollRef.current) return;
    if (savedScrollPositionRef.current === null) {
      hasRestoredScrollRef.current = true;
      return;
    }

    const scrollY = savedScrollPositionRef.current;

    const tryScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= scrollY) {
        window.scrollTo({
          top: scrollY,
          behavior: 'instant' as ScrollBehavior,
        });
        hasRestoredScrollRef.current = true;
        return true;
      }
      return false;
    };

    // Try immediately
    if (tryScroll()) return;

    // If page is not tall enough yet, poll on animation frames for up to 2 seconds (120 frames)
    let frameId: number;
    let frames = 0;
    const loop = () => {
      frames++;
      if (tryScroll() || frames > 120) {
        hasRestoredScrollRef.current = true;
        return;
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [filteredTools]);

  // Track window scroll position (only after scroll has been restored)
  useEffect(() => {
    const handleScroll = () => {
      if (!isInitializedRef.current || !hasRestoredScrollRef.current) return;
      try {
        sessionStorage.setItem('home-scroll-y', window.scrollY.toString());
      } catch (e) {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Listen to reset events (e.g. clicking the main logo)
  useEffect(() => {
    const handleReset = () => {
      setSearchQuery('');
      setSelectedCategory(null);
      setShowFavoritesOnly(false);
      try {
        sessionStorage.setItem('home-scroll-y', '0');
      } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('reset-home-state', handleReset);
    return () => {
      window.removeEventListener('reset-home-state', handleReset);
    };
  }, []);

  const handleFavoritesToggle = () => {
    const nextShowFavorites = !showFavoritesOnly;
    setShowFavoritesOnly(nextShowFavorites);
    if (nextShowFavorites) {
      setSelectedCategory(null);
    }
    try {
      sessionStorage.setItem('home-scroll-y', '0');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleCategoryChange = (category: ToolCategory | null) => {
    setSelectedCategory(category);
    if (category) {
      setShowFavoritesOnly(false);
    }
    try {
      sessionStorage.setItem('home-scroll-y', '0');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    try {
      sessionStorage.setItem('home-scroll-y', '0');
    } catch (e) {}
  };

  return (
    <div className={cn(compactMode ? 'space-y-4 sm:space-y-5' : 'space-y-6 sm:space-y-8')}>
      <div className="flex justify-center">
        <SearchBar value={searchQuery} onSearch={handleSearchChange} />
      </div>

      <div className="flex justify-center">
        <CategoryFilter
          selectedCategory={selectedCategory}
          showFavoritesOnly={showFavoritesOnly}
          favoritesCount={favorites.length}
          onCategoryChange={handleCategoryChange}
          onFavoritesToggle={handleFavoritesToggle}
        />
      </div>

      {searchQuery && (
        <section>
          <h2
            className={cn(
              'mb-3 font-bold sm:mb-4 text-muted-foreground',
              compactMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            )}
          >
            {showFavoritesOnly ? 'Search Results in Favorites' : 'Search Results'} ({filteredTools.length})
          </h2>
          {filteredTools.length > 0 ? (
            <ToolGrid compactMode={compactMode}>
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} compactMode={compactMode} showCategory={true} />
              ))}
            </ToolGrid>
          ) : (
            <EmptyState
              title="No tools matched your search"
              description="Try a different search query."
            />
          )}
        </section>
      )}

      {favoriteTools.length > 0 &&
        !selectedCategory &&
        !showFavoritesOnly &&
        !searchQuery && (
          <section>
            <h2
              className={cn(
                'mb-3 flex items-center gap-2 font-bold sm:mb-4',
                compactMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              )}
            >
              <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              Favorites
            </h2>
            <ToolGrid compactMode={compactMode}>
              {favoriteTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} compactMode={compactMode} />
              ))}
            </ToolGrid>
          </section>
        )}

      {!showFavoritesOnly && !searchQuery && (
        <div className={cn(compactMode ? 'space-y-4 sm:space-y-5' : 'space-y-6 sm:space-y-8')}>
          {(Object.entries(groupedTools) as Array<[ToolCategory, Tool[]]>).map(
            ([categoryId, categoryTools]) => {
            if (categoryTools.length === 0) return null;

            const category = CATEGORIES[categoryId];
            const Icon = CATEGORY_ICONS[category.icon];

            return (
              <section key={categoryId}>
                <h2
                  className={cn(
                    'mb-3 font-bold sm:mb-4 flex items-center gap-2.5',
                    compactMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
                    category.color
                  )}
                >
                  {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />}
                  <span>{category.name}</span>
                </h2>
                <ToolGrid compactMode={compactMode}>
                  {categoryTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      compactMode={compactMode}
                    />
                  ))}
                </ToolGrid>
              </section>
            );
            }
          )}
        </div>
      )}

      {showFavoritesOnly && !searchQuery && (
        <section>
          {filteredTools.length > 0 ? (
            <ToolGrid compactMode={compactMode}>
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} compactMode={compactMode} />
              ))}
            </ToolGrid>
          ) : (
            <EmptyState
              icon={<Star className="mx-auto mb-4 h-12 w-12 opacity-50" />}
              title="No favorite tools yet"
              description="Click the star on any tool to add it to favorites."
            />
          )}
        </section>
      )}

      {filteredTools.length === 0 && !showFavoritesOnly && !searchQuery && (
        <EmptyState
          title="No tools matched your filters"
          description="Try a different search or category."
        />
      )}
    </div>
  );
}

function ToolGrid({
  compactMode,
  children,
}: {
  compactMode: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6',
        compactMode ? 'gap-2' : 'gap-4'
      )}
    >
      {children}
    </div>
  );
}

function ToolCard({
  tool,
  compactMode,
  showCategory = false,
}: {
  tool: Tool;
  compactMode: boolean;
  showCategory?: boolean;
}) {
  const category = CATEGORIES[tool.category];
  const Icon = CATEGORY_ICONS[category.icon];
  return (
    <Link href={`/tools/${tool.id}`} className="group block h-full">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
        <CardHeader
          className={cn(compactMode ? 'space-y-0 p-3' : 'p-4 sm:p-6')}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              {showCategory && (
                <div className="flex items-center flex-wrap gap-1.5 mb-1">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider',
                      category.color
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3 shrink-0" />}
                    <span>{category.name}</span>
                  </span>
                </div>
              )}
              <CardTitle
                className={cn(
                  'transition-colors group-hover:text-primary',
                  compactMode ? 'text-base leading-snug' : 'text-lg'
                )}
              >
                {tool.name}
              </CardTitle>
            </div>
            <FavoriteButton toolId={tool.id} variant="card" />
          </div>
          {!compactMode && <CardDescription>{tool.description}</CardDescription>}
        </CardHeader>
      </Card>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      {icon}
      <p>{title}</p>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}
