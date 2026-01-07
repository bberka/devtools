import { useState, useEffect } from 'preact/hooks';
import { Star } from 'lucide-preact';
import { toggleFavorite, isFavorite } from '@/lib/utils/storage';
import { Button } from './ui/button';

interface FavoriteButtonProps {
  toolId: string;
  variant?: 'icon' | 'card';
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({ toolId, variant = 'icon', onToggle }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(toolId));

    // Listen for changes from other components
    const handleFavoriteToggle = (e: CustomEvent) => {
      if (e.detail.toolId === toolId) {
        setIsFav(e.detail.isFavorite);
      }
    };

    // Listen for changes from other tabs (localStorage sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev-toolbox:favorites') {
        setIsFav(isFavorite(toolId));
      }
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggle as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggle as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [toolId]);

  const handleToggle = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    toggleFavorite(toolId);
    const newFavState = isFavorite(toolId);
    setIsFav(newFavState);

    if (onToggle) {
      onToggle(newFavState);
    }

    // Dispatch a custom event so other components can react to favorite changes
    window.dispatchEvent(new CustomEvent('favoriteToggled', {
      detail: { toolId, isFavorite: newFavState }
    }));
  };

  if (variant === 'card') {
    // For use in tool cards on home page - just the icon
    return (
      <button
        onClick={handleToggle}
        className="p-1 rounded hover:bg-accent transition-colors group/star"
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star
          className={`size-6 transition-all ${
            isFav
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-muted-foreground group-hover/star:text-yellow-500'
          }`}
        />
      </button>
    );
  }

  // For use in tool pages - full button
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="gap-2"
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={`h-4 w-4 transition-all ${
          isFav
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-muted-foreground'
        }`}
      />
      <span>{isFav ? 'Favorited' : 'Add to Favorites'}</span>
    </Button>
  );
}
