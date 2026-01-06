# DevTools Collection

> A modern, fast, and privacy-focused collection of developer tools built with Astro and Preact.

[![Status](https://img.shields.io/badge/status-WIP-yellow)](https://github.com/bberka/devtools)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## About

DevTools Collection is a web-based toolkit providing essential utilities for developers. All processing happens client-side in your browser - your data never leaves your machine.

**Current Status**: Work in Progress (WIP)
This project is actively under development. Some features may be incomplete, and bugs are expected. Contributions and feedback are welcome!

## Features

- **100% Client-Side**: All tools run locally in your browser - no data sent to servers
- **Privacy-First**: Your sensitive data (tokens, keys, passwords) never leaves your device
- **Dark Mode**: Built-in theme switching for comfortable coding at any time
- **Fast & Lightweight**: Optimized bundle sizes with code splitting
- **Mobile-Friendly**: Responsive design works on all devices
- **No Installation**: Just open in your browser and start using

## Available Tools (19 Implemented)

### Converters
- **Base64 Encoder/Decoder** - Convert text to/from Base64 encoding
- **Number Base Converter** - Convert between binary, octal, decimal, and hexadecimal
- **Unix Timestamp Converter** - Convert between Unix timestamps and human-readable dates
- **URL Encoder/Decoder** - Encode/decode URLs and query parameters
- **HTML Encoder/Decoder** - Escape/unescape HTML entities
- **Color Converter** - Convert between HEX, RGB, HSL color formats
- **Case Converter** - Transform text case (camelCase, snake_case, etc.)

### Encoders & Decoders
- **JWT Decoder** - Decode and inspect JSON Web Tokens
- **Text Escape/Unescape** - Escape special characters in strings

### Generators
- **Hash Generator** - Generate MD5, SHA-1, SHA-256, SHA-512 hashes
- **UUID Generator** - Generate UUIDs (v4, v7, Snowflake IDs)
- **Password Generator** - Create secure random passwords
- **Lorem Ipsum Generator** - Generate placeholder text

### Formatters & Validators
- **SQL Formatter** - Format SQL queries (PostgreSQL, MySQL, MSSQL, BigQuery)
- **JSON Formatter** - Format and validate JSON
- **XML Formatter** - Format XML documents
- **XML Validator** - Validate XML structure

### Text Tools
- **Regex Tester** - Test regular expressions with live matching

### Utilities
- **Cron Expression Parser** - Parse and generate cron expressions

## Planned Features

### Upcoming Tools

#### CSS Tools
- Glassmorphism Generator
- Box Shadow Visualizer
- Clamp() Calculator (responsive typography)
- Color Picker

#### Security Tools
- RSA Key Pair Generator (Client-side)
- AES Encryption/Decryption
- Bcrypt/Argon2 Hasher

#### Networking Tools
- IP Address Lookup (via public API)
- DNS Records Lookup
- Subnet Calculator

#### Design Tools
- SVG Path Editor/Optimizer
- Color Contrast Checker (WCAG)
- Icon Font Search

#### Advanced Converters
- Markdown to PDF
- Image Converter (resize, crop, compress, filters)
- JSON ↔ YAML ↔ XML

#### Text Tools
- Markdown Previewer (with math & diagrams support)
- Text Diff Visualizer (side-by-side comparison)

### UX Enhancements
- **Command Palette** (Ctrl+K / Cmd+K) - Quick tool switching with keyboard
- **Drag-and-Drop** - Drop files directly into tools
- **Favorites System** - Mark frequently used tools
- **Recent Tools** - Quick access to recently used tools

### Performance & SEO
- PWA Support - Install as standalone app, offline access
- Dynamic Imports - Faster initial load times
- SEO Optimization - Sitemap, meta tags, Open Graph images
- Performance Optimization - Bundle splitting, lazy loading

## Tech Stack

- **Framework**: [Astro](https://astro.build/) - Fast static site generation
- **UI Library**: [Preact](https://preactjs.com/) - Lightweight React alternative
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Components**: [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
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

## Development

### Project Structure

```
/src
  /pages
    index.astro              # Home page with tool cards
    /tools
      [tool-slug].astro      # Individual tool pages
  /components
    /preact
      /tools                 # Tool implementations
      /ui                    # shadcn/ui components
    ToolCard.astro
    CategoryFilter.astro
    SearchBar.astro
  /lib
    /utils
      storage.ts             # LocalStorage utilities
      tools-config.ts        # Tool metadata & categories
  /styles
    global.css
```

### Development Principles

**Real-time Processing**: Tools that convert input to output (encoders, formatters, etc.) process in real-time as you type - no "Generate" button needed unless the operation is computationally expensive.

**Privacy-First**: All processing happens client-side. No analytics, no tracking, no data collection.

**Accessibility**: Keyboard navigation, ARIA labels, and screen reader support throughout.

## Known Issues & Limitations

- Some tools are still under development
- Mobile experience may have minor UI issues on some devices
- Browser compatibility tested primarily on Chrome/Firefox (latest versions)
- Some advanced features (PWA, command palette) are not yet implemented

## Contributing

Contributions are welcome! This is a WIP project, so there's plenty to improve:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit your changes (`git commit -m 'Add some amazing tool'`)
4. Push to the branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

### Areas to Contribute
- Implement new tools (see [DEV-PLAN.md](docs/DEV-PLAN.md))
- Fix bugs and improve existing tools
- Improve UI/UX
- Add tests
- Improve documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Astro](https://astro.build/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## Roadmap

See [DEV-PLAN.md](docs/DEV-PLAN.md) for detailed development roadmap and implementation phases.

---

**Note**: This is a work-in-progress project and may contain bugs or incomplete features. Use at your own discretion. For production use cases, always verify outputs independently.
