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
import type { Tool, ToolCategory } from '@/lib/types';

export function HomeContent() {
  const { favorites } = useFavorites();
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
    <div className="space-y-8">
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
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              Favorites
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

      {!showFavoritesOnly && (
        <div className="space-y-8">
          {(Object.entries(groupedTools) as Array<[ToolCategory, Tool[]]>).map(
            ([categoryId, categoryTools]) => {
            if (categoryTools.length === 0) return null;

            const category = CATEGORIES[categoryId];

            return (
              <section key={categoryId}>
                <h2 className={`mb-4 text-2xl font-bold ${category.color}`}>
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            );
            }
          )}
        </div>
      )}

      {showFavoritesOnly && (
        <section>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
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

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.id}`} className="group block h-full">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg transition-colors group-hover:text-primary">
              {tool.name}
            </CardTitle>
            <FavoriteButton toolId={tool.id} variant="card" />
          </div>
          <CardDescription>{tool.description}</CardDescription>
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
