import { useState, useMemo, useEffect } from 'preact/hooks';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { filterTools, CATEGORIES } from '@/lib/utils/tools-config';
import { getFavorites } from '@/lib/utils/storage';
import type { Tool, ToolCategory, CategoryInfo } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Star } from 'lucide-preact';
import { FavoriteButton } from './FavoriteButton';

interface HomeContentProps {
  tools: Tool[];
  categories: Record<ToolCategory, CategoryInfo>;
}

export function HomeContent({ tools, categories }: HomeContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites on mount and listen for changes
  useEffect(() => {
    setFavorites(getFavorites());

    // Listen for favorite toggle events from FavoriteButton (same tab)
    const handleFavoriteToggle = () => {
      setFavorites(getFavorites());
    };

    // Listen for storage changes from other tabs (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:favorites') {
        setFavorites(getFavorites());
      }
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggle);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggle);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle favorites toggle - clears category when favorites is selected
  const handleFavoritesToggle = () => {
    const newShowFavorites = !showFavoritesOnly;
    setShowFavoritesOnly(newShowFavorites);
    if (newShowFavorites) {
      setSelectedCategory(null); // Clear category when showing favorites
    }
  };

  // Handle category change - clears favorites when category is selected
  const handleCategoryChange = (category: ToolCategory | null) => {
    setSelectedCategory(category);
    if (category !== null) {
      setShowFavoritesOnly(false); // Clear favorites when selecting a category
    }
  };

  // Filtered tools
  const filteredTools = useMemo(() => {
    return filterTools(searchQuery, selectedCategory, showFavoritesOnly, favorites);
  }, [searchQuery, selectedCategory, showFavoritesOnly, favorites]);

  // Group by category
  const groupedTools = useMemo(() => {
    const groups: Record<ToolCategory, Tool[]> = {
      converters: [],
      'encoders-decoders': [],
      generators: [],
      'formatters-validators': [],
      'text-tools': [],
      utilities: [],
    };

    filteredTools.forEach((tool) => {
      groups[tool.category].push(tool);
    });

    return groups;
  }, [filteredTools]);

  const favoriteTools = useMemo(() => {
    return tools.filter((tool) => favorites.includes(tool.id));
  }, [favorites, tools]);

  return (
    <div className="space-y-8">
      {/* Search and filters */}
      <div className="space-y-4">
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
      </div>

     

      {/* Favorites section (always show if has favorites and not filtering) */}
      {favoriteTools.length > 0 && !selectedCategory && !searchQuery && !showFavoritesOnly && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Favorites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteTools.map((tool) => (
              <ToolCardComponent key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Tools by category */}
      {!showFavoritesOnly && (
        <div className="space-y-8">
          {Object.entries(groupedTools).map(([categoryId, categoryTools]) => {
            if (categoryTools.length === 0) return null;

            const category = categories[categoryId as ToolCategory];

            return (
              <section key={categoryId}>
                <h2 className={`text-2xl font-bold mb-4 ${category.color}`}>
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryTools.map((tool) => (
                    <ToolCardComponent
                      key={tool.id}
                      tool={tool}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Favorites only view */}
      {showFavoritesOnly && (
        <section>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool) => (
                <ToolCardComponent key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No favorite tools yet</p>
              <p className="text-sm">Click the star on any tool to add it to favorites</p>
            </div>
          )}
        </section>
      )}

      {/* No results */}
      {filteredTools.length === 0 && (searchQuery || selectedCategory) && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tools found matching your criteria</p>
          <p className="text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

// Tool card component (Preact version)
function ToolCardComponent({ tool }: { tool: Tool }) {
  return (
    <a href={`/tools/${tool.id}`} className="group block h-full">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {tool.name}
            </CardTitle>
            <FavoriteButton toolId={tool.id} variant="card" />
          </div>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
      </Card>
    </a>
  );
}
