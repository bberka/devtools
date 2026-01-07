# DevTools Collection

> A modern, fast, and privacy-focused collection of developer tools built with Astro and Preact.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## About

DevTools Collection is a web-based toolkit providing essential utilities for developers. All processing happens client-side in your browser - your data never leaves your machine.

**Current Status**: ✅ **All Core Tools + Security + Networking + Design Implemented** (34/34 - 100%)

All planned core tools plus Phase 5 security tools, Phase 6 networking tools, and Phase 7 design tools are now implemented and functional! The project is stable and ready for use. We're now focusing on additional tool categories and UX enhancements. Contributions and feedback are welcome!

## Features

- **100% Client-Side**: All tools run locally in your browser - no data sent to servers
- **Privacy-First**: Your sensitive data (tokens, keys, passwords) never leaves your device
- **Instant Conversion**: Real-time output updates as you type - no button clicks needed
- **Dark Mode**: Built-in theme switching with persistent preference across tabs
- **Favorites System**: Star your frequently used tools for quick access
- **Fast & Lightweight**: Optimized bundle sizes with code splitting
- **Mobile-Friendly**: Responsive design works perfectly on all devices
- **No Installation**: Just open in your browser and start using

## Available Tools (34/34 Implemented - 100%)

### Converters (10 tools)

- ✅ **Base64 Encoder/Decoder** - Encode and decode Base64 strings with instant conversion
- ✅ **Number Base Converter** - Convert between binary, octal, decimal, and hexadecimal
- ✅ **Unix Timestamp Converter** - Convert Unix timestamps to readable dates (seconds/milliseconds)
- ✅ **URL Encoder/Decoder** - Encode and decode URL strings
- ✅ **HTML Encoder/Decoder** - Encode and decode HTML entities
- ✅ **Color Converter** - Convert between HEX, RGB, HSL color formats with live preview
- ✅ **Case Converter** - Transform text case (camelCase, snake_case, PascalCase, kebab-case, etc.)
- ✅ **JSON ↔ YAML ↔ XML** - Convert between JSON, YAML, and XML formats
- ✅ **Image Converter** - Convert, resize, crop, and compress images
- ✅ **Markdown Converter** - Convert Markdown to PDF, HTML, TXT, PNG, or JPG

### Encoders & Decoders (2 tools)

- ✅ **JWT Decoder** - Decode and inspect JSON Web Tokens with timestamp formatting
- ✅ **Text Escape/Unescape** - Escape special characters (JavaScript, JSON, HTML, XML, CSV, SQL, Regex)

### Generators (4 tools)

- ✅ **Hash Generator** - Generate MD5, SHA-1, SHA-256, SHA-512 hashes instantly
- ✅ **UUID Generator** - Generate UUIDs (v4, v7, Snowflake IDs) with bulk generation
- ✅ **Password Generator** - Create secure random passwords with customizable options
- ✅ **Lorem Ipsum Generator** - Generate placeholder text (paragraphs, words, sentences)

### Formatters & Validators (4 tools)

- ✅ **SQL Formatter** - Format SQL queries (PostgreSQL, MySQL, MSSQL, BigQuery, SQLite)
- ✅ **JSON Formatter** - Format and validate JSON with syntax highlighting
- ✅ **XML Formatter** - Format XML documents with proper indentation
- ✅ **XML Validator** - Validate XML syntax and structure

### Text Tools (3 tools)

- ✅ **Regex Tester** - Test regular expressions with live matching and capture groups
- ✅ **Markdown Previewer** - Preview Markdown with syntax highlighting, math (KaTeX), and diagrams (Mermaid)
- ✅ **Text Diff Visualizer** - Compare text with side-by-side and inline diff views

### Utilities (1 tool)

- ✅ **Cron Expression Parser** - Parse and explain cron expressions with human-readable output

### Security (3 tools)

- ✅ **RSA Key Pair Generator** - Generate RSA public/private key pairs (2048/3072/4096 bits, PEM/PKCS8/JWK formats)
- ✅ **AES Encryption/Decryption** - Encrypt and decrypt text using AES-256-GCM with PBKDF2 key derivation
- ✅ **Bcrypt Hasher** - Hash and verify passwords with bcrypt (configurable cost factor)

### Networking (4 tools)

- ✅ **IP Address Lookup** - Get detailed geolocation and network information for any IP address
- ✅ **DNS Records Lookup** - Query DNS records (A, AAAA, MX, TXT, NS, CNAME, SOA) using DNS-over-HTTPS
- ✅ **Subnet Calculator** - Calculate subnet masks, CIDR notation, IP ranges, and host information
- ✅ **Port Scanner** - Check common ports and services (browser-compatible with limitations)

### Design (3 tools)

- ✅ **SVG Path Editor/Optimizer** - Edit, visualize, and optimize SVG path data with real-time preview
- ✅ **Color Contrast Checker** - Check color contrast ratios for WCAG 2.1 compliance (AA/AAA levels)

## Implemented Features

### UX Features

- ✅ **Instant Conversion** - Real-time output updates as you type (no button clicks needed)
- ✅ **Dark Mode** - Seamless theme switching with persistent preference
- ✅ **Favorites System** - Star your frequently used tools for quick access
- ✅ **Search & Filter** - Find tools quickly by name, description, or keywords
- ✅ **Category Filters** - Browse tools by category (Converters, Generators, etc.)
- ✅ **Copy to Clipboard** - One-click copy with visual feedback
- ✅ **Clear Buttons** - Reset tool state instantly
- ✅ **Swap Functionality** - Bidirectional conversion tools (encode/decode)
- ✅ **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ✅ **Cross-Tab Sync** - Theme and favorites sync across browser tabs

### Technical Features

- ✅ **100% Client-Side** - All processing happens locally in your browser
- ✅ **SSR Compatible** - Optimized server-side rendering with Astro
- ✅ **Code Splitting** - Fast initial load with on-demand tool loading
- ✅ **LocalStorage** - Persistent favorites and theme preferences
- ✅ **Error Handling** - Clear error messages with visual feedback
- ✅ **Keyboard Accessible** - Full keyboard navigation support

## Planned Features

### UX Enhancements (Phase 8)

- [ ] **Command Palette** (Ctrl+K / Cmd+K) - Quick tool switching with keyboard
- [ ] **Drag-and-Drop** - Drop files directly into applicable tools
- [ ] **Recent Tools** - Quick access to recently used tools
- [ ] **Export/Import Settings** - Backup and restore preferences

### CSS Tools (Phase 4)

- [ ] Glassmorphism Generator
- [ ] Box Shadow Visualizer
- [ ] Clamp() Calculator (responsive typography)
- [ ] Advanced Color Picker with palettes

### Networking Tools (Phase 6) ✅ Completed

- ✅ **IP Address Lookup** - Lookup IP geolocation via ipinfo.io API
- ✅ **DNS Records Lookup** - Query DNS records using Google DNS-over-HTTPS
- ✅ **Subnet Calculator** - Calculate subnets with CIDR notation
- ✅ **Port Scanner** - Check common ports (browser-compatible)

### Design Tools (Phase 7) ✅ Completed

- ✅ **SVG Path Editor/Optimizer** - Edit and optimize SVG paths with live preview
- ✅ **Color Contrast Checker** - WCAG 2.1 compliance checking with AA/AAA levels
- ✅ **Icon Font Search** - Browse Lucide, Heroicons, and Feather icon libraries

### Performance & SEO (Phase 9)

- [ ] PWA Support - Install as standalone app, offline access
- [ ] Sitemap Generation - Better search engine indexing
- [ ] Open Graph Images - Beautiful social media previews
- [ ] Performance Optimization - Further bundle size reduction

## Tech Stack

- **Framework**: [Astro 5.x](https://astro.build/) - Fast static site generation with SSR support
- **UI Library**: [Preact 10.x](https://preactjs.com/) - Lightweight React alternative (3KB)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) - Utility-first CSS framework
- **Components**: [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components (adapted for Preact)
- **Icons**: [Lucide Preact](https://lucide.dev/) - Beautiful, consistent icons
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) - Fast, global CDN

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/bberka/devtools.git
cd devtools

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:4321`

### Build for Production

```bash
npm run build
```

The static site will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Development

### Project Structure

```
/devtools
├── src/
│   ├── components/
│   │   ├── preact/           # Preact components
│   │   │   ├── tools/        # Tool implementations (24 tools)
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── HomeContent.tsx
│   │   └── ToolCard.astro   # Tool card component
│   ├── layouts/
│   │   └── Layout.astro     # Main layout
│   ├── lib/
│   │   ├── types.ts         # TypeScript types
│   │   └── utils/
│   │       ├── cn.ts        # Utility functions
│   │       ├── storage.ts   # LocalStorage utilities
│   │       └── tools-config.ts  # Tool metadata
│   ├── pages/
│   │   ├── index.astro      # Home page
│   │   └── tools/
│   │       └── [slug].astro # Dynamic tool pages
│   └── styles/
│       └── globals.css      # Global styles
├── docs/
│   └── DEV-PLAN.md         # Development roadmap
├── public/                  # Static assets
├── README.md
├── CONTRIBUTING.md
└── package.json
```

### Development Principles

**Real-time Processing**: All conversion tools update instantly as you type - no "Convert" button needed unless the operation is computationally expensive (like image processing or PDF generation). This creates a fluid, responsive user experience.

**Privacy-First**: All processing happens client-side in your browser. No analytics, no tracking, no data collection. Your sensitive data (tokens, keys, passwords) never leaves your device.

**Accessibility**: Full keyboard navigation support, ARIA labels, and semantic HTML throughout. Works with screen readers and assistive technologies.

**SSR Compatible**: All components are Server-Side Rendering compatible, using pure JavaScript implementations where needed (no browser-only APIs during build).

## Known Issues & Limitations

- Advanced features (PWA support, command palette) are not yet implemented
- Browser compatibility tested primarily on Chrome, Firefox, and Edge (latest versions)
- Some complex image operations may be slow on older devices
- PDF generation from Markdown may have limitations with complex layouts

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit your changes (`git commit -m 'feat: add amazing tool'`)
4. Push to the branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

### Areas to Contribute

- **New Tools**: Implement tools from [DEV-PLAN.md](docs/DEV-PLAN.md) (CSS, Security, Networking tools)
- **Bug Fixes**: Check [open issues](https://github.com/bberka/devtools/issues)
- **UI/UX**: Improve responsiveness, accessibility, dark mode consistency
- **Performance**: Optimize bundle sizes, reduce re-renders
- **Documentation**: Improve guides, add examples, write tutorials
- **Testing**: Add automated tests (unit, integration, e2e)

See [CONTRIBUTING.md](CONTRIBUTING.md) for comprehensive contribution guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Astro](https://astro.build/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)
- Math rendering by [KaTeX](https://katex.org/)
- Diagrams by [Mermaid](https://mermaid.js.org/)

## Roadmap

See [DEV-PLAN.md](docs/DEV-PLAN.md) for detailed development roadmap and implementation phases.

---

**Note**: While all core features are implemented and functional, always verify outputs independently for production use cases.
