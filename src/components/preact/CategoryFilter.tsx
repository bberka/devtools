import { Star } from 'lucide-preact';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CATEGORIES, getToolsByCategory } from '@/lib/utils/tools-config';
import type { ToolCategory } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface CategoryFilterProps {
  selectedCategory: ToolCategory | null;
  showFavoritesOnly: boolean;
  onCategoryChange: (category: ToolCategory | null) => void;
  onFavoritesToggle: () => void;
}

export function CategoryFilter({
  selectedCategory,
  showFavoritesOnly,
  onCategoryChange,
  onFavoritesToggle,
}: CategoryFilterProps) {
  const categories = Object.values(CATEGORIES);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Favorites filter */}
      <Button
        variant={showFavoritesOnly ? 'default' : 'outline'}
        size="sm"
        onClick={onFavoritesToggle}
        className="gap-1.5"
      >
        <Star className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')} />
        Favorites
      </Button>

      {/* Category filters */}
      {categories.map((category) => {
        const toolCount = getToolsByCategory(category.id).length;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(isSelected ? null : category.id)}
            className="gap-1.5"
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
