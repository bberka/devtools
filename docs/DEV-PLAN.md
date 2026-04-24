# Development Plan

**Last reviewed**: April 24, 2026

## Current App

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS with shadcn-style components
- Icons: Lucide React
- Deployment model: static export to `out/`
- Storage: localStorage for theme, favorites, recent tools, and settings

## Implemented

- [x] Next.js App Router migration
- [x] Static export configuration
- [x] Home page with search and category filtering
- [x] Tool routes generated from `TOOLS`
- [x] 34 tool pages wired into the renderer
- [x] Favorites
- [x] Recent tools
- [x] Dark mode
- [x] Compact mode
- [x] Command palette
- [x] Settings dialog
- [x] Sitemap and robots routes
- [x] Per-tool metadata
- [x] Cloudflare/Wrangler static asset config

## Implemented Tools

### Converters

- [x] Markdown Converter
- [x] HTML Converter
- [x] Image Converter
- [x] Base64 Encoder/Decoder
- [x] Number Base Converter
- [x] JSON/YAML/XML Converter
- [x] Unix Timestamp Converter
- [x] URL Encoder/Decoder
- [x] HTML Encoder/Decoder
- [x] Color Converter
- [x] Case Converter

### Encoders & Decoders

- [x] JWT Decoder
- [x] Text Escape/Unescape

### Generators

- [x] Hash Generator
- [x] UUID Generator
- [x] Password Generator
- [x] Lorem Ipsum Generator

### Formatters & Validators

- [x] SQL Formatter
- [x] JSON Formatter
- [x] XML Formatter
- [x] XML Validator

### Text Tools

- [x] Markdown Previewer
- [x] Text Diff Visualizer
- [x] Regex Tester

### Utilities

- [x] Cron Expression Parser

### Security

- [x] RSA Key Pair Generator
- [x] AES Encryption/Decryption
- [x] Bcrypt Hasher
- [ ] Argon2 hashing support

### Networking

- [x] IP Address Lookup
- [x] DNS Records Lookup
- [x] Subnet Calculator
- [x] Port Checker

### Design

- [x] SVG Path Editor/Optimizer
- [x] Color Contrast Checker

## Next Work

### 1. Testing

- [ ] Add route coverage tests that ensure every `TOOLS` entry renders.
- [ ] Add focused tests for pure transform helpers where they exist.
- [ ] Add Playwright smoke tests for homepage search, favorites, command palette, and a representative tool page.

### 2. Tool Registry

- [ ] Replace the hardcoded `TOOL_COMPONENTS` map with a typed registry or dynamic loader.
- [ ] Make metadata and component wiring share one source of truth.
- [ ] Fail build-time checks when a tool is missing a component.

### 3. Performance

- [ ] Audit production bundles.
- [ ] Split heavy dependencies used by Markdown, image, crypto, and diagram tools.
- [ ] Run Lighthouse on desktop and mobile.
- [ ] Fix any obvious accessibility, SEO, or performance regressions.

### 4. PWA

- [x] Add app manifest.
- [x] Add service worker.
- [x] Cache static shell and common tool routes.
- [x] Add offline fallback.
- [ ] Verify install behavior on desktop and mobile.

### 5. SEO / Sharing

- [ ] Replace placeholder `NEXT_PUBLIC_SITE_URL` fallback before production.
- [ ] Add generated Open Graph images.
- [ ] Confirm canonical URLs for the production domain.

### 6. Planned Tools

- [ ] Glassmorphism Generator
- [ ] Box Shadow Visualizer
- [ ] Clamp Calculator
- [ ] Color Picker
- [ ] Argon2 hashing support, if the password hashing tool should advertise it

## Development Rules

- Keep all tools static-export compatible.
- Keep user data local unless a tool explicitly performs a browser-side public lookup.
- Prefer real-time processing for lightweight transforms.
- Use explicit action buttons for heavy work, uploads, cryptography, exports, and network calls.
- Run `npm run build` before considering a change complete.
