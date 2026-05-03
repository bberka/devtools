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
- [x] 37 tool pages wired into the renderer
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

Already covered in the current app and not repeated in the backlog below:

- Utilities: JSON Formatter, Color Converter
- Text: Case Converter, Lorem Ipsum Generator, Text Diff Visualizer
- Developer: URL Encoder/Decoder, UUID Generator, JWT Decoder
- Calculators: Unit Converter, Percentage Calculator

The lists below only show remaining roadmap work:

#### PDF

- [ ] Edit PDF
- [ ] Merge PDF
- [ ] Split PDF
- [ ] Compress PDF
- [ ] PDF to Image
- [ ] Image to PDF
- [ ] PDF to Word
- [ ] Word to PDF
- [ ] PDF Watermark

#### Image

- [ ] SVG to PNG
- [ ] Expand Image Converter into dedicated Compress Image, Convert Image, Resize Image, and Image Crop routes
- [ ] Image Rotate / Flip
- [ ] EXIF Viewer & Remover
- [ ] Color Palette Extractor
- [ ] Photo to Sketch

#### Utilities

- [ ] QR Code Generator
- [ ] Expand Base64 Encoder/Decoder with file upload and image-to-Base64 workflows
- [ ] Expand Hash Generator into a broader Hash / Checksum Generator with text and file inputs
- [ ] Dedicated browser-side GZip Compressor / Decompressor
- [ ] Expand Image Converter with a dedicated Image to Icon route
- [ ] Text to Speech
- [ ] Speech to Text

#### Text

- [ ] Word Counter
- [ ] Find and Replace
- [ ] Expand Markdown Previewer into a fuller Markdown Editor

#### Developer

- [ ] Expand Cron Expression Parser into a fuller Cron Expression Builder
- [ ] Expand SQL Formatter with selectable SQL dialects / database types
- [ ] Add Certificate Decoder / Inspector
- [ ] Expand Regex Tester into a guided Regex Builder
- [ ] Split out a dedicated YAML ↔ JSON Converter from the broader JSON/YAML/XML tool
- [ ] Expand the current JSON/YAML/XML + JSON Formatter + XML Validator coverage into dedicated JSON / YAML / XML validation workflows
- [ ] CSV ↔ JSON Converter

#### Design

- [ ] Add Color Blindness Simulator

#### Calculators

- [ ] BMI Calculator
- [ ] Age Calculator
- [ ] Date Difference Calculator
- [ ] Timezone Converter
- [ ] Currency Converter

### 7. Lower-Priority Ideas

- [ ] Glassmorphism Generator
- [ ] Box Shadow Visualizer
- [ ] Clamp Calculator
- [ ] Decide whether the password hashing tool should stay bcrypt-only or add Argon2 support

## Feature Request Review Notes

The May 3, 2026 review of additional feature requests maps to the current app like this:

- `Already implemented in some form`: Base64 Encoder/Decoder, Hash Generator, Number Base Converter, JSON Formatter, JSON ↔ YAML ↔ XML conversion, XML Validator, Regex Tester, SQL Formatter
- `Better handled as expansions`: SQL dialect support, image/file Base64 workflows, file checksums, dedicated JSON/YAML/XML validation flows, and a regex builder layered on the existing tester
- `Net-new backlog items`: Certificate Decoder, Color Blindness Simulator, and browser-side GZip compression

## Development Rules

- Keep all tools static-export compatible.
- Keep user data local unless a tool explicitly performs a browser-side public lookup.
- Prefer real-time processing for lightweight transforms.
- Use explicit action buttons for heavy work, uploads, cryptography, exports, and network calls.
- Keep tool-page cards dense on mobile: prefer compact insets, avoid repeated nested padding, and collapse complex layouts to one column early.
- Fix layout and responsiveness outside `src/components/ui`; shared UI primitives should stay generated and reusable.
- Run `npm run build` before considering a change complete.
