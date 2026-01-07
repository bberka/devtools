import type { Tool, CategoryInfo, ToolCategory } from '../types';

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
};

// Tool definitions (Phase 1 - just metadata, no implementations)
export const TOOLS: Tool[] = [
  // Converters (9)
  {
    id: 'markdown-to-pdf',
    name: 'Markdown Converter',
    description: 'Convert Markdown to PDF, HTML, TXT, PNG, or JPG',
    category: 'converters',
    icon: 'FileText',
    keywords: ['markdown', 'pdf', 'html', 'convert', 'export', 'txt', 'png', 'jpg'],
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert, resize, crop, and compress images',
    category: 'converters',
    icon: 'Image',
    keywords: ['image', 'convert', 'resize', 'crop', 'compress'],
  },
  {
    id: 'base64-converter',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    category: 'converters',
    icon: 'Binary',
    keywords: ['base64', 'encode', 'decode'],
    featured: true,
  },
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert between binary, decimal, hex, and octal',
    category: 'converters',
    icon: 'Hash',
    keywords: ['number', 'binary', 'hex', 'octal', 'decimal'],
  },
  {
    id: 'json-yaml-xml',
    name: 'JSON ↔ YAML ↔ XML',
    description: 'Convert between JSON, YAML, and XML formats',
    category: 'converters',
    icon: 'Code',
    keywords: ['json', 'yaml', 'xml', 'convert'],
  },
  {
    id: 'timestamp-converter',
    name: 'Unix Timestamp Converter',
    description: 'Convert Unix timestamps to readable dates',
    category: 'converters',
    icon: 'Clock',
    keywords: ['timestamp', 'unix', 'date', 'time'],
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URL strings',
    category: 'converters',
    icon: 'Link',
    keywords: ['url', 'encode', 'decode', 'uri'],
  },
  {
    id: 'html-encoder',
    name: 'HTML Encoder/Decoder',
    description: 'Encode and decode HTML entities',
    category: 'converters',
    icon: 'Code2',
    keywords: ['html', 'encode', 'decode', 'entities'],
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL color formats',
    category: 'converters',
    icon: 'Palette',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'convert'],
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Transform text case (camelCase, snake_case, etc.)',
    category: 'converters',
    icon: 'CaseSensitive',
    keywords: ['case', 'camel', 'snake', 'pascal', 'kebab', 'convert'],
  },

  // Encoders & Decoders (5)
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens',
    category: 'encoders-decoders',
    icon: 'KeyRound',
    keywords: ['jwt', 'token', 'decode', 'authentication'],
  },
  {
    id: 'text-escape',
    name: 'Text Escape/Unescape',
    description: 'Escape and unescape special characters',
    category: 'encoders-decoders',
    icon: 'Quote',
    keywords: ['escape', 'unescape', 'text', 'special'],
  },

  // Generators (4)
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    category: 'generators',
    icon: 'Shield',
    keywords: ['hash', 'md5', 'sha', 'checksum'],
    featured: true,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUIDs (v4, v7, Snowflake)',
    category: 'generators',
    icon: 'Fingerprint',
    keywords: ['uuid', 'guid', 'generate', 'unique'],
    featured: true,
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    category: 'generators',
    icon: 'Key',
    keywords: ['password', 'generate', 'random', 'secure'],
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    category: 'generators',
    icon: 'AlignLeft',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text'],
  },

  // Formatters & Validators (4)
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format SQL with multi-database support',
    category: 'formatters-validators',
    icon: 'Database',
    keywords: ['sql', 'format', 'database', 'query'],
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format and validate JSON',
    category: 'formatters-validators',
    icon: 'Braces',
    keywords: ['json', 'format', 'validate', 'pretty'],
    featured: true,
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format XML documents',
    category: 'formatters-validators',
    icon: 'FileCode',
    keywords: ['xml', 'format', 'pretty'],
  },
  {
    id: 'xml-validator',
    name: 'XML Validator',
    description: 'Validate XML syntax',
    category: 'formatters-validators',
    icon: 'CheckCircle',
    keywords: ['xml', 'validate', 'syntax'],
  },

  // Text Tools (3)
  {
    id: 'markdown-preview',
    name: 'Markdown Previewer',
    description: 'Preview Markdown with syntax highlighting',
    category: 'text-tools',
    icon: 'Eye',
    keywords: ['markdown', 'preview', 'render'],
  },
  {
    id: 'text-diff',
    name: 'Text Diff Visualizer',
    description: 'Compare text with side-by-side and inline views',
    category: 'text-tools',
    icon: 'GitCompare',
    keywords: ['diff', 'compare', 'text', 'changes'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions with highlighting',
    category: 'text-tools',
    icon: 'SearchCode',
    keywords: ['regex', 'regexp', 'test', 'pattern'],
  },

  // Utilities (1)
  {
    id: 'cron-parser',
    name: 'Cron Expression Parser',
    description: 'Parse and generate cron expressions',
    category: 'utilities',
    icon: 'Calendar',
    keywords: ['cron', 'schedule', 'parse', 'generate'],
  },

  // Security Tools (3)
  {
    id: 'rsa-key-generator',
    name: 'RSA Key Pair Generator',
    description: 'Generate RSA public/private key pairs (client-side)',
    category: 'security',
    icon: 'KeySquare',
    keywords: ['rsa', 'key', 'pair', 'public', 'private', 'encryption', 'security'],
  },
  {
    id: 'aes-encryption',
    name: 'AES Encryption/Decryption',
    description: 'Encrypt and decrypt text using AES-256-GCM',
    category: 'security',
    icon: 'Lock',
    keywords: ['aes', 'encrypt', 'decrypt', 'security', 'cipher'],
  },
  {
    id: 'bcrypt-hasher',
    name: 'Bcrypt/Argon2 Hasher',
    description: 'Hash and verify passwords with bcrypt or argon2',
    category: 'security',
    icon: 'ShieldCheck',
    keywords: ['bcrypt', 'argon2', 'hash', 'password', 'verify', 'security'],
  },

  // Networking Tools (4)
  {
    id: 'ip-lookup',
    name: 'IP Address Lookup',
    description: 'Get detailed information about an IP address',
    category: 'networking',
    icon: 'MapPin',
    keywords: ['ip', 'address', 'lookup', 'geolocation', 'network'],
  },
  {
    id: 'dns-lookup',
    name: 'DNS Records Lookup',
    description: 'Query DNS records (A, AAAA, MX, TXT, NS, etc.)',
    category: 'networking',
    icon: 'Server',
    keywords: ['dns', 'lookup', 'records', 'domain', 'nameserver'],
  },
  {
    id: 'subnet-calculator',
    name: 'Subnet Calculator',
    description: 'Calculate subnet masks, CIDR, IP ranges',
    category: 'networking',
    icon: 'Network',
    keywords: ['subnet', 'cidr', 'netmask', 'ip', 'calculator'],
  },
  {
    id: 'port-checker',
    name: 'Port Scanner',
    description: 'Check common ports and services (browser-compatible)',
    category: 'networking',
    icon: 'Radar',
    keywords: ['port', 'scanner', 'check', 'services', 'network'],
  },
];

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
    const searchText = [
      tool.name,
      tool.description,
      ...(tool.keywords || []),
    ]
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
