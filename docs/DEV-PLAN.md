# Development Plan

**Last reviewed**: May 3, 2026

## Current App

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS with shadcn-style components
- Icons: Lucide React
- Deployment model: static export to `out/`
- Storage: localStorage for theme, favorites, recent tools, and settings

## Implemented

- [x] Static export configuration
- [x] Home page with search and category filtering
- [x] Tool routes generated from `TOOLS`
- [x] 35 tool pages wired into the renderer
- [x] Favorites
- [x] Recent tools
- [x] Dark mode
- [x] Compact mode
- [x] Command palette
- [x] Settings dialog
- [x] Sitemap and robots routes
- [x] Per-tool metadata
- [x] Typed tool registry with lazy component loaders
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

### Networking

- [x] IP Address Lookup
- [x] DNS Records Lookup
- [x] Subnet Calculator
- [x] Port Checker

### Design

- [x] SVG Path Editor/Optimizer
- [x] Color Contrast Checker
- [x] Color Picker

## Next Work

### 1. Testing

- [ ] Add route coverage tests that ensure every `TOOLS` entry renders.
- [ ] Add focused tests for pure transform helpers where they exist.
- [ ] Add Playwright smoke tests for homepage search, favorites, command palette, and a representative tool page.

### 2. Tool Registry

- [x] Replace the hardcoded `TOOL_COMPONENTS` map with a typed registry or dynamic loader.
- [x] Make metadata and component wiring share one source of truth.
- [x] Fail build-time checks when a tool is missing a component.

### 3. Performance

- [x] Audit production bundles.
- [x] Split heavy dependencies used by Markdown, image, crypto, and data conversion tools.
- [x] Run Lighthouse on desktop and mobile.
- [x] Fix any obvious accessibility, SEO, or performance regressions.

Latest review: April 24, 2026.

- `npm run analyze` writes bundle reports to `.next/analyze/client.html`, `.next/analyze/nodejs.html`, and `.next/analyze/edge.html`.
- Deferred action-only libraries: `jspdf`, `html2canvas`, `browser-image-compression`, `bcryptjs`, `blueimp-md5`, `js-yaml`, and `xml-js`.
- Lighthouse on the static export home page: mobile 97/100/100/100 and desktop 100/100/100/100 for Performance, Accessibility, Best Practices, and SEO.
- Fixed the command palette button accessible name reported by Lighthouse.
- Residual follow-up: the shared dynamic tool route can still reference many possible tool chunks in its route payload. The heaviest tool libraries are split behind user actions, but a future route architecture pass could reduce cross-tool route references further.

### 4. PWA

- [x] Add app manifest.
- [x] Add service worker.
- [x] Cache static shell and common tool routes.
- [x] Add offline fallback.
- [x] Verify install behavior on desktop and mobile.

### 5. SEO / Sharing

- [ ] Replace placeholder `NEXT_PUBLIC_SITE_URL` fallback before production.
- [ ] Add generated Open Graph images.
- [ ] Confirm canonical URLs for the production domain.

### 6. Tool Expansion Roadmap

Status labels used below:

- `Existing`: already shipped in the current app
- `Expand`: partly covered today, but should become a clearer dedicated tool or a materially broader workflow
- `Planned`: net-new route or feature set

#### PDF

- [ ] `Planned` Edit PDF
- [ ] `Planned` Merge PDF
- [ ] `Planned` Split PDF
- [ ] `Planned` Compress PDF
- [ ] `Planned` PDF to Image
- [ ] `Planned` Image to PDF
- [ ] `Planned` PDF to Word
- [ ] `Planned` Word to PDF
- [ ] `Planned` PDF Watermark

#### Image

- [ ] `Planned` SVG to PNG
- [ ] `Expand` Compress Image
- [ ] `Expand` Convert Image
- [ ] `Expand` Resize Image
- [ ] `Expand` Image Crop
- [ ] `Planned` Image Rotate / Flip
- [ ] `Planned` EXIF Viewer & Remover
- [ ] `Planned` Color Palette Extractor
- [ ] `Planned` Photo to Sketch

#### Utilities

- [ ] `Planned` QR Code Generator
- [x] `Existing` JSON Formatter
- [x] `Existing` Color Converter
- [x] `Existing` Hash Generator
- [x] `Existing` Base64 Converter
- [ ] `Expand` Image to Icon
- [ ] `Planned` Text to Speech
- [ ] `Planned` Speech to Text

#### Text

- [ ] `Planned` Word Counter
- [x] `Existing` Case Converter
- [x] `Existing` Lorem Ipsum Generator
- [ ] `Planned` Find and Replace
- [x] `Existing` Text Diff / Compare
- [ ] `Expand` Markdown Editor

#### Developer

- [x] `Existing` URL Encoder/Decoder
- [x] `Existing` UUID Generator
- [x] `Existing` JWT Decoder
- [x] `Existing` Regex Tester
- [ ] `Expand` Cron Expression Builder
- [x] `Existing` SQL Formatter
- [ ] `Expand` YAML ↔ JSON Converter
- [ ] `Planned` CSV ↔ JSON Converter

#### Calculators

- [ ] `Planned` Unit Converter
- [ ] `Planned` Percentage Calculator
- [ ] `Planned` BMI Calculator
- [ ] `Planned` Age Calculator
- [ ] `Planned` Date Difference Calculator
- [ ] `Planned` Timezone Converter
- [ ] `Planned` Currency Converter

### 7. Lower-Priority Ideas

- [ ] Glassmorphism Generator
- [ ] Box Shadow Visualizer
- [ ] Clamp Calculator
- [ ] Decide whether the password hashing tool should stay bcrypt-only or add Argon2 support

## Development Rules

- Keep all tools static-export compatible.
- Keep user data local unless a tool explicitly performs a browser-side public lookup.
- Prefer real-time processing for lightweight transforms.
- Use explicit action buttons for heavy work, uploads, cryptography, exports, and network calls.
- Run `npm run build` before considering a change complete.
