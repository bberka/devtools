export type ToolCategory =
  | 'converters'
  | 'encoders-decoders'
  | 'generators'
  | 'formatters-validators'
  | 'text-tools'
  | 'utilities';

export interface Tool {
  id: string; // slug-style: 'base64-encoder'
  name: string; // Display name: 'Base64 Encoder/Decoder'
  description: string; // Short description
  category: ToolCategory;
  icon?: string; // Lucide icon name
  keywords?: string[]; // For search
  featured?: boolean; // Show prominently
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string; // Display name
  icon: string; // Lucide icon name
  description: string;
  color: string; // Tailwind color class
}

export interface GlobalSettings {
  theme: 'light' | 'dark';
  favorites: string[]; // Tool IDs
  recentTools: string[]; // Last 5 accessed
}

export interface ToolSettings {
  autoProcess?: boolean;
  [key: string]: any; // Tool-specific settings
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: ToolCategory | null;
  showFavoritesOnly: boolean;
}
