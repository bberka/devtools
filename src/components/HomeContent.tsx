'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { CategoryFilter } from './CategoryFilter';
import { FavoriteButton } from './FavoriteButton';
import { SearchBar } from './SearchBar';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CATEGORIES, filterTools, TOOLS } from '@/lib/utils/tools-config';
import { useFavorites } from '@/lib/contexts/FavoritesContext';
import { useSettings } from '@/lib/contexts/SettingsContext';
import { cn } from '@/lib/utils/cn';
import type { Tool, ToolCategory } from '@/lib/types';

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

  const handleFavoritesToggle = () => {
    const nextShowFavorites = !showFavoritesOnly;
    setShowFavoritesOnly(nextShowFavorites);
    if (nextShowFavorites) {
      setSelectedCategory(null);
    }
  };

  const handleCategoryChange = (category: ToolCategory | null) => {
    setSelectedCategory(category);
    if (category) {
      setShowFavoritesOnly(false);
    }
  };

  return (
    <div className={cn(compactMode ? 'space-y-5' : 'space-y-8')}>
      <div className="flex justify-center">
        <SearchBar value={searchQuery} onSearch={setSearchQuery} />
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

      {favoriteTools.length > 0 &&
        !selectedCategory &&
        !showFavoritesOnly &&
        !searchQuery && (
          <section>
            <h2
              className={cn(
                'flex items-center gap-2 font-bold',
                compactMode ? 'mb-3 text-xl' : 'mb-4 text-2xl'
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

      {!showFavoritesOnly && (
        <div className={cn(compactMode ? 'space-y-5' : 'space-y-8')}>
          {(Object.entries(groupedTools) as Array<[ToolCategory, Tool[]]>).map(
            ([categoryId, categoryTools]) => {
            if (categoryTools.length === 0) return null;

            const category = CATEGORIES[categoryId];

            return (
              <section key={categoryId}>
                <h2
                  className={cn(
                    'font-bold',
                    compactMode ? 'mb-3 text-xl' : 'mb-4 text-2xl',
                    category.color
                  )}
                >
                  {category.name}
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

      {showFavoritesOnly && (
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

      {filteredTools.length === 0 && !showFavoritesOnly && (
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
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        compactMode ? 'gap-2' : 'gap-4'
      )}
    >
      {children}
    </div>
  );
}

function ToolCard({ tool, compactMode }: { tool: Tool; compactMode: boolean }) {
  return (
    <Link href={`/tools/${tool.id}`} className="group block h-full">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
        <CardHeader className={cn(compactMode ? 'space-y-0 p-3' : undefined)}>
          <div className="flex items-start justify-between gap-2">
            <CardTitle
              className={cn(
                'transition-colors group-hover:text-primary',
                compactMode ? 'text-base leading-snug' : 'text-lg'
              )}
            >
              {tool.name}
            </CardTitle>
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
