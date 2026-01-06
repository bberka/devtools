import { Star } from 'lucide-preact';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CATEGORIES, getToolsByCategory } from '@/lib/utils/tools-config';
import type { ToolCategory } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface CategoryFilterProps {
  selectedCategory: ToolCategory | null;
  showFavoritesOnly: boolean;
  favoritesCount: number;
  onCategoryChange: (category: ToolCategory | null) => void;
  onFavoritesToggle: () => void;
}

export function CategoryFilter({
  selectedCategory,
  showFavoritesOnly,
  favoritesCount,
  onCategoryChange,
  onFavoritesToggle,
}: CategoryFilterProps) {
  const categories = Object.values(CATEGORIES);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Favorites filter */}
      <Button
        variant={'outline'}
        size="sm"
        onClick={onFavoritesToggle}
        className={cn('gap-1.5', showFavoritesOnly && 'bg-primary/10 border-primary/30')}
      >
        <Star className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')} />
        Favorites
        <Badge variant="secondary" className="ml-1">
          {favoritesCount}
        </Badge>
      </Button>

      {/* Category filters */}
      {categories.map((category) => {
        const toolCount = getToolsByCategory(category.id).length;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant="outline"
            size="sm"
            onClick={() => onCategoryChange(isSelected ? null : category.id)}
            className={cn('gap-1.5', isSelected && 'bg-primary/10 border-primary/30')}
          >
            <span className={category.color}>{category.name}</span>
            <Badge variant="secondary" className="ml-1">
              {toolCount}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
