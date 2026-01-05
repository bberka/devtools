import type { GlobalSettings, ToolSettings } from '../types';

const STORAGE_PREFIX = 'dev-toolbox';

// Keys
const KEYS = {
  THEME: `${STORAGE_PREFIX}:theme`,
  FAVORITES: `${STORAGE_PREFIX}:favorites`,
  RECENT: `${STORAGE_PREFIX}:recent`,
  TOOL_SETTINGS: (toolId: string) => `${STORAGE_PREFIX}:tool:${toolId}`,
} as const;

// Default values
const DEFAULT_SETTINGS: GlobalSettings = {
  theme: 'dark',
  favorites: [],
  recentTools: [],
};

// Safe localStorage access (handles SSR)
function getStorage(): Storage | null {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
}

// Theme
export function getTheme(): 'light' | 'dark' {
  const storage = getStorage();
  if (!storage) return DEFAULT_SETTINGS.theme;

  const theme = storage.getItem(KEYS.THEME);
  return theme === 'light' || theme === 'dark' ? theme : DEFAULT_SETTINGS.theme;
}

export function setTheme(theme: 'light' | 'dark'): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(KEYS.THEME, theme);

  // Update DOM
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Favorites
export function getFavorites(): string[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const favorites = storage.getItem(KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
}

export function setFavorites(favorites: string[]): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
}

export function toggleFavorite(toolId: string): void {
  const favorites = getFavorites();
  const index = favorites.indexOf(toolId);

  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(toolId);
  }

  setFavorites(favorites);
}

export function isFavorite(toolId: string): boolean {
  return getFavorites().includes(toolId);
}

// Recent tools
export function getRecentTools(): string[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const recent = storage.getItem(KEYS.RECENT);
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
}

export function addRecentTool(toolId: string): void {
  const storage = getStorage();
  if (!storage) return;

  let recent = getRecentTools();

  // Remove if already exists
  recent = recent.filter((id) => id !== toolId);

  // Add to front
  recent.unshift(toolId);

  // Keep only last 5
  recent = recent.slice(0, 5);

  storage.setItem(KEYS.RECENT, JSON.stringify(recent));
}

// Tool-specific settings
export function getToolSettings<T extends ToolSettings>(
  toolId: string,
  defaults: T
): T {
  const storage = getStorage();
  if (!storage) return defaults;

  try {
    const settings = storage.getItem(KEYS.TOOL_SETTINGS(toolId));
    return settings ? { ...defaults, ...JSON.parse(settings) } : defaults;
  } catch {
    return defaults;
  }
}

export function setToolSettings<T extends ToolSettings>(
  toolId: string,
  settings: T
): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(KEYS.TOOL_SETTINGS(toolId), JSON.stringify(settings));
}

export function updateToolSettings<T extends ToolSettings>(
  toolId: string,
  updates: Partial<T>
): void {
  const current = getToolSettings(toolId, {} as T);
  setToolSettings(toolId, { ...current, ...updates });
}

// Clear all storage (for debugging/reset)
export function clearAllStorage(): void {
  const storage = getStorage();
  if (!storage) return;

  Object.keys(storage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => storage.removeItem(key));
}

// Initialize theme on page load
export function initializeTheme(): void {
  const theme = getTheme();
  setTheme(theme);
}
