import type { Tool, CategoryInfo, ToolCategory } from '../types';
import { TOOL_REGISTRY } from './tool-registry';

// Category definitions
export const CATEGORIES: Record<ToolCategory, CategoryInfo> = {
  converters: {
    id: 'converters',
    name: 'Converters',
    icon: 'RefreshCw',
    description: 'Convert between different formats',
    color: 'text-blue-500',
  },
  'encoders-decoders': {
    id: 'encoders-decoders',
    name: 'Encoders & Decoders',
    icon: 'Lock',
    description: 'Encode and decode various formats',
    color: 'text-purple-500',
  },
  generators: {
    id: 'generators',
    name: 'Generators',
    icon: 'Sparkles',
    description: 'Generate random data',
    color: 'text-green-500',
  },
  'formatters-validators': {
    id: 'formatters-validators',
    name: 'Formatters & Validators',
    icon: 'FileCheck',
    description: 'Format and validate data',
    color: 'text-orange-500',
  },
  'text-tools': {
    id: 'text-tools',
    name: 'Text Tools',
    icon: 'Type',
    description: 'Text manipulation utilities',
    color: 'text-pink-500',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities',
    icon: 'Wrench',
    description: 'General utilities',
    color: 'text-cyan-500',
  },
  security: {
    id: 'security',
    name: 'Security',
    icon: 'ShieldCheck',
    description: 'Encryption, hashing, and key generation',
    color: 'text-red-500',
  },
  networking: {
    id: 'networking',
    name: 'Networking',
    icon: 'Globe',
    description: 'Network utilities and diagnostics',
    color: 'text-indigo-500',
  },
  design: {
    id: 'design',
    name: 'Design',
    icon: 'Palette',
    description: 'Design and accessibility tools',
    color: 'text-violet-500',
  },
};

// Tool metadata is derived from the typed registry so metadata and component
// wiring cannot drift apart.
export const TOOLS: Tool[] = Object.entries(TOOL_REGISTRY).map(
  ([id, tool]) => ({
    id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    icon: tool.icon,
    keywords: [...(tool.keywords ?? [])],
    featured: 'featured' in tool ? tool.featured : undefined,
  })
);

// Helper functions
export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getAllCategories(): CategoryInfo[] {
  return Object.values(CATEGORIES);
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return TOOLS;

  return TOOLS.filter((tool) => {
    const searchText = [tool.name, tool.description, ...(tool.keywords || [])]
      .join(' ')
      .toLowerCase();

    return searchText.includes(lowerQuery);
  });
}

export function filterTools(
  searchQuery: string,
  category: ToolCategory | null,
  favoritesOnly: boolean,
  favorites: string[]
): Tool[] {
  let filtered = TOOLS;

  // Filter by search
  if (searchQuery) {
    filtered = searchTools(searchQuery);
  }

  // Filter by category
  if (category) {
    filtered = filtered.filter((tool) => tool.category === category);
  }

  // Filter by favorites
  if (favoritesOnly) {
    filtered = filtered.filter((tool) => favorites.includes(tool.id));
  }

  return filtered;
}
