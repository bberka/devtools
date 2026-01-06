# Revised Implementation Plan v2 (No History)

## Tech Stack (Final)

- **Framework**: Astro + Preact (client islands)
- **Styling**: Tailwind CSS + shadcn/ui components (adapted for Preact)
- **Deployment**: Cloudflare Pages (free tier)
- **Storage**: LocalStorage for favorites and per-tool settings only

## Project Structure

```
/src
  /pages
    index.astro (home - categorized tool cards)
    /tools
      [tool-slug].astro (individual tool pages)
  /components
    /preact
      /tools (tool implementations)
      /ui (shadcn components - button, card, input, etc.)
    ToolCard.astro
    CategoryFilter.astro
    SearchBar.astro
  /lib
    /utils
      storage.ts (LocalStorage helpers)
      tools-config.ts (tool metadata & categories)
  /styles
    global.css
```

## Core Development Principles

### Real-time Processing Rule

**CRITICAL**: All tools that convert input to output (encoders, formatters, converters, etc.) MUST process input in real-time as the user types. NO "Generate" or "Convert" buttons unless the operation is:

- Computationally expensive (image processing, PDF generation)
- Requires explicit user confirmation
- Involves file uploads

**Goal**: Minimize clicks, maximize immediate feedback, create a fluid user experience.

**Examples**:

- ✅ Base64 encoder updates output as user types
- ✅ JSON formatter auto-formats on input change
- ✅ Hash generator shows all hashes instantly
- ❌ Image converter needs explicit "Convert" (file upload + processing)
- ❌ PDF generation needs explicit "Generate" (heavy operation)

## Tool Categories

### Currently Implemented (19 tools)

1. **Converters**
   - Base64 Encoder/Decoder ✅
   - Number Base Converter ✅
   - Unix Timestamp Converter ✅
   - URL Encoder/Decoder ✅
   - HTML Encoder/Decoder ✅
   - Color Converter ✅
   - Case Converter ✅

2. **Encoders & Decoders**
   - JWT Decoder ✅
   - Text Escape/Unescape ✅

3. **Generators**
   - Hash Generator ✅
   - UUID Generator (v4, v7, Snowflake) ✅
   - Password Generator ✅
   - Lorem Ipsum Generator ✅

4. **Formatters & Validators**
   - SQL Formatter (multi-DB support) ✅
   - JSON Formatter ✅
   - XML Formatter ✅
   - XML Validator ✅

5. **Text Tools**
   - Regex Tester ✅

6. **Utilities**
   - Cron Expression Parser/Generator ✅

### Planned Tools

1. **Converters (Continued)**
   - Markdown to PDF
   - Image Converter
   - JSON ↔ YAML ↔ XML

2. **CSS Tools** (New Category)
   - Glassmorphism Generator
   - Box Shadow Visualizer
   - Clamp() Calculator (responsive typography)
   - Color Picker

3. **Security Tools** (New Category)
   - RSA Key Pair Generator (Client-side)
   - AES Encryption/Decryption
   - Bcrypt/Argon2 Hasher

4. **Networking Tools** (New Category)
   - IP Address Lookup (via public API)
   - DNS Records Lookup
   - Subnet Calculator

5. **Design Tools** (New Category)
   - SVG Path Editor/Optimizer
   - Color Contrast Checker (WCAG)
   - Icon Font Search

6. **Text Tools (Continued)**
   - Markdown Previewer
   - Text Diff Visualizer

## Home Page Design

```
┌─────────────────────────────────────────────┐
│  DevTools  [Search bar...]     [Settings ⚙] │
├─────────────────────────────────────────────┤
│                                             │
│  Filters: [⭐ Favorites] [🔄 Converters]   │
│          [🔐 Encoders] [⚡ Generators]      │
│          [📝 Formatters] [🔧 Text Tools]    │
│          [🛠️ Utilities]                     │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Base64   │ │ JSON     │ │ UUID     │   │
│  │ Convert  │ │ Format   │ │ Generate │   │
│  │ ⭐       │ │          │ │ ⭐       │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  [Category: Converters] (if filtered)       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ MD→PDF   │ │ Image    │ │ Base64   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘
```

### Home Page Features:

- **Card Grid**: Responsive grid (1 col mobile, 2-3 col tablet, 4-5 col desktop)
- **Category Badges**: Small, clickable, with counts
- **Favorites Badge**: Shows "⭐" on favorited tools
- **Search**: Real-time filter by tool name/description
- **No Sidebar**: Clean, card-based navigation only

## Individual Tool Page Design

```
┌─────────────────────────────────────────────┐
│  ← Back to Tools        Base64 Encoder  ⭐  │
├─────────────────────────────────────────────┤
│  [Options ▼]  [Clear]                       │
│  ☐ Auto-convert  ☐ Other tool settings     │
├─────────────────────────────────────────────┤
│  Input:                                     │
│  ┌───────────────────────────────────────┐ │
│  │ [Text area]                           │ │
│  └───────────────────────────────────────┘ │
│                    [Convert ↓]             │
│  Output:                           [Copy]  │
│  ┌───────────────────────────────────────┐ │
│  │ [Result area]                         │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Settings System (No History)

### Global Settings

```typescript
{
  theme: 'light' | 'dark',
  favorites: string[], // tool slugs
  recentTools: string[] // last 5 accessed (for quick access only)
}
```

### Per-Tool Settings

```typescript
{
  autoProcess: boolean, // for real-time tools
  toolSpecificConfig: {
    // Example for MD→PDF:
    method: 'jspdf' | 'print',
    pageSize: 'A4' | 'Letter',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includePageNumbers: boolean,

    // Example for Image Converter:
    outputFormat: 'png' | 'jpeg' | 'webp',
    quality: 0.9,
    resizeWidth: number | null,
    resizeHeight: number | null,
    maintainAspectRatio: boolean
  }
}
```

## Markdown to PDF - Dual Options

### Option 1: jsPDF Method

**Pros:**

- Full programmatic control
- Can inject custom headers/footers
- Page numbers easy to add
- Customizable page breaks

**Cons:**

- Complex layouts can break
- Math/code might not render perfectly
- More configuration needed

**Libraries:**

- `jspdf`
- `html2canvas` (for rendering HTML to canvas)
- `markdown-it` (parse markdown)
- `highlight.js` (code syntax)
- `katex` (math)

### Option 2: Browser Print API

**Pros:**

- Better rendering quality
- Respects CSS print media queries
- Code blocks, math render perfectly
- Simple implementation

**Cons:**

- Less programmatic control
- Page numbers harder to customize
- User must manually save PDF

**Implementation:**

- Parse markdown to HTML
- Apply print-specific CSS
- Trigger `window.print()`

### User Choice UI

```
Markdown to PDF Options:

Export Method: [● jsPDF] [○ Browser Print]

jsPDF Options:
  Page Size: [A4 ▼]
  Margins (mm): Top [20] Right [20] Bottom [20] Left [20]
  ☑ Include page numbers
  ☐ Include header
  ☐ Include footer

Browser Print Options:
  Page Size: [A4 ▼]
  ☑ Syntax highlighting
  ☑ Math rendering
  [Preview] [Print]
```

## Image Converter - Full Feature Set

### Supported Formats

**Input:** PNG, JPEG, JPG, WebP, GIF, BMP
**Output:** PNG, JPEG, WebP

### Features

#### 1. Format Conversion

```
Input: [Upload Image]
Output Format: [PNG ▼] [JPEG] [WebP]
```

#### 2. Resize

```
Resize Options:
  Width: [800] px
  Height: [600] px
  ☑ Maintain aspect ratio
  Mode: [● Scale Down] [○ Exact] [○ Crop to Fit]
```

#### 3. Compression

```
Quality: [80] ━━━●━━━ (0-100)
Preview Size: 245 KB → 89 KB
```

#### 4. Crop

```
Crop Tool: [Interactive Canvas]
  X: [0] Y: [0] Width: [500] Height: [500]
  Presets: [Square] [16:9] [4:3] [Custom]
```

#### 5. Simple Filters

```
Filters:
  ☐ Grayscale
  ☐ Sepia
  ☐ Blur: [5] px
  ☐ Brightness: [100]%
  ☐ Contrast: [100]%
  ☐ Saturation: [100]%
```

### Implementation Strategy

- Use HTML5 Canvas API for all operations
- `browser-image-compression` for quality compression
- Custom canvas manipulation for filters
- Live preview with before/after comparison

### UI Layout

```
┌─────────────────────────────────────────────┐
│  Image Converter                        ⭐  │
├─────────────────────────────────────────────┤
│  [Upload Image] or Drag & Drop              │
│                                             │
│  ┌─────────────┐  ┌─────────────┐         │
│  │   Before    │  │    After    │         │
│  │  [Preview]  │  │  [Preview]  │         │
│  └─────────────┘  └─────────────┘         │
│                                             │
│  Format: [PNG ▼]  Quality: [80] ━●━        │
│                                             │
│  Resize: Width [__] Height [__] ☑ Lock     │
│                                             │
│  Crop: [Enable Crop Tool]                  │
│                                             │
│  Filters: ☐ Grayscale  ☐ Sepia  ☐ Blur    │
│          Brightness: [100]% ━━●━━          │
│                                             │
│  [Reset] [Download]                        │
└─────────────────────────────────────────────┘
```

## Favorite & Filter Logic

### Favorite System

1. Click ⭐ on tool card or tool page
2. Saves to `localStorage.favorites`
3. Favorited tools show at top of home page (separate section)
4. Can favorite entire categories (stored separately)

### Filter Behavior

1. **No filter**: Show all tools grouped by category
2. **Category filter**: Show only that category's tools
3. **Favorites filter**: Show only favorited tools
4. **Search active**: Show matching tools across all categories
5. **Multiple filters**: AND logic (favorites + category)

### UI States

```
[⭐ Favorites] - Toggle (highlight when active)
[🔄 Converters] - Category badge (highlight when filtered)
[Search: "json"] - Shows X tools found

If Favorites active:
  → Show "Favorites" section at top
  → Other sections below (or hidden based on other filters)

If Category active:
  → Show only that category
  → Favorites still visible if also active
```

## shadcn/ui Components to Use

Core components (adapt to Preact):

- **Button** (primary, secondary, outline, ghost variants)
- **Card** (tool cards, category cards)
- **Input** (search, text inputs)
- **Textarea** (tool inputs)
- **Badge** (category tags, favorites)
- **Separator** (visual dividers)
- **Switch** (toggle settings)
- **Select** (dropdowns for configs)
- **Tabs** (for tools with multiple modes)
- **Dialog** (settings modal)
- **Tooltip** (help text on hover)
- **Slider** (quality, brightness, etc.)

## Advanced UI Features

### Command Palette (Ctrl+K / Cmd+K)

**Implementation**: Use `cmdk` library for instant tool switching

**Features**:

- Global keyboard shortcut (Ctrl+K or Cmd+K)
- Fuzzy search across all tools
- Quick navigation without mouse
- Recent tools at the top
- Keyboard-only navigation (↑↓ arrows, Enter to select)
- Refactor existing search to integrate with command palette

**UI Design**:

```
┌─────────────────────────────────────────────┐
│  Quick Open                            ✕    │
├─────────────────────────────────────────────┤
│  Search tools...                            │
│                                             │
│  Recent:                                    │
│  ⏱️  Base64 Encoder                         │
│  ⏱️  JSON Formatter                         │
│                                             │
│  All Tools:                                 │
│  🔄 Base64 Encoder/Decoder                  │
│  📝 JSON Formatter                          │
│  🔐 Hash Generator                          │
└─────────────────────────────────────────────┘
```

### Drag-and-Drop File Support

**Target Tools**:

- JSON/XML/YAML Formatters (drop .json, .xml, .yaml files)
- Image Converter (drop image files)
- Markdown to PDF (drop .md files)
- Text tools (drop .txt files)

**Implementation**:

- Use HTML5 drag-and-drop API
- Visual feedback on drag hover
- Auto-detect file type
- Error handling for unsupported formats

**UI State**:

```
Normal:
┌─────────────────────────────────────────┐
│  Input:                                 │
│  ┌───────────────────────────────────┐ │
│  │ [Text area]                       │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘

Dragging file over:
┌─────────────────────────────────────────┐
│  Input:                                 │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │  📁 Drop your file here           │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## SEO & Performance Optimizations

### SEO Features

1. **Sitemap Generation**
   - Auto-generate sitemap.xml for all tool pages
   - Use Astro's `@astrojs/sitemap` integration
   - Update on build

2. **Robots.txt**
   - Configure crawling rules
   - Allow all tools to be indexed
   - Point to sitemap location

3. **Meta Tags** (per tool page)
   - Unique title: "Tool Name | DevTools"
   - Description from tool metadata
   - Canonical URLs
   - Open Graph tags for social sharing

4. **Open Graph Images**
   - Use `@astrojs/satori` for dynamic OG image generation
   - Generate unique preview images per tool
   - Example: "Base64 Encoder" image when shared on social media

### PWA Support

**Features**:

- Offline access to recently used tools
- Install as standalone app
- App-like experience on mobile
- Service worker for caching

**Implementation**:

- Use `@vite-pwa/astro` or similar
- Cache tool pages and assets
- Offline fallback page
- App manifest (name, icons, colors)

**Manifest Config**:

```json
{
  "name": "DevTools Collection",
  "short_name": "DevTools",
  "description": "Developer tools for encoding, formatting, and more",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "icons": [...]
}
```

### Performance Optimizations

1. **Dynamic Imports**
   - Lazy load tool components
   - Only load active tool's JS
   - Reduce initial bundle size
   - Use Astro's `client:load` strategically

2. **Code Splitting**
   - Split by route (each tool = separate chunk)
   - Shared dependencies in common chunk
   - Preload critical paths

3. **Asset Optimization**
   - Compress images (WebP format)
   - Minify CSS/JS
   - Tree-shake unused code
   - Use Astro's built-in optimizations

## Cloudflare Pages Deployment

### Build Configuration

```json
{
  "build": {
    "command": "npm run build",
    "output": "dist"
  }
}
```

### Deployment Steps

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `/dist`
4. Auto-deploy on push to main
5. Preview deployments on PRs
6. Custom domain support (if needed)

### Why Workers Not Needed

- All processing happens client-side
- No API routes required (except external API calls from browser)
- No server-side rendering needed
- Astro generates pure static HTML + JS

## Implementation Phases

### Phase 1: Foundation ✅ (Completed)

- [x] Astro + Preact + Tailwind setup
- [x] shadcn/ui component library setup (Preact adapters)
- [x] Home page with category grid
- [x] LocalStorage utilities (favorites, settings only)
- [x] Search & filter system
- [x] Responsive layout
- [x] Dark mode toggle

### Phase 2: Basic Tools ✅ (Completed - 19 tools)

- [x] Base64 Encoder/Decoder
- [x] URL Encoder/Decoder
- [x] HTML Encoder/Decoder
- [x] UUID Generator (v4, v7, Snowflake)
- [x] Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- [x] Password Generator
- [x] Lorem Ipsum Generator
- [x] Number Base Converter
- [x] Unix Timestamp Converter
- [x] Color Converter
- [x] Case Converter
- [x] Text Escape/Unescape
- [x] JSON Formatter
- [x] XML Formatter
- [x] XML Validator
- [x] SQL Formatter
- [x] JWT Decoder
- [x] Regex Tester
- [x] Cron Expression Parser/Generator

### Phase 3: Advanced Converters & Text Tools

- [ ] JSON ↔ YAML ↔ XML Converter
- [ ] Markdown Previewer (katex, highlight.js, mermaid support)
- [ ] Text Diff Visualizer (side-by-side + inline modes)
- [ ] **Image Converter** (resize, crop, compress, filters)
- [ ] **Markdown to PDF** (both jsPDF and Print API options)

### Phase 4: CSS Tools (New)

- [ ] Glassmorphism Generator
- [ ] Box Shadow Visualizer
- [ ] Clamp() Calculator (responsive typography)
- [ ] Color Picker

### Phase 5: Security Tools (New)

- [ ] RSA Key Pair Generator (Client-side)
- [ ] AES Encryption/Decryption
- [ ] Bcrypt/Argon2 Hasher

### Phase 6: Networking Tools (New)

- [ ] IP Address Lookup (via public API)
- [ ] DNS Records Lookup
- [ ] Subnet Calculator

### Phase 7: Design Tools (New)

- [ ] SVG Path Editor/Optimizer
- [ ] Color Contrast Checker (WCAG)
- [ ] Icon Font Search

### Phase 8: UX Enhancements

- [ ] Command Palette (Ctrl+K / Cmd+K) with cmdk
- [ ] Drag-and-Drop file support for applicable tools
- [ ] Settings modal (global + per-tool)
- [ ] Export/Import settings
- [ ] Favorites system (fully implemented)
- [ ] Recent tools tracking

### Phase 9: SEO & Performance

- [ ] Sitemap.xml generation (@astrojs/sitemap)
- [ ] Robots.txt configuration
- [ ] Meta tags per tool page (title, description, OG tags)
- [ ] Open Graph image generation (@astrojs/satori)
- [ ] Dynamic imports for code splitting
- [ ] Bundle size optimization
- [ ] Performance audits (Lighthouse)

### Phase 10: PWA Support

- [ ] Service worker setup
- [ ] App manifest configuration
- [ ] Offline support for tools
- [ ] Install prompt
- [ ] Caching strategy
- [ ] Offline fallback page

### Future Enhancements (Later)

- [ ] End-to-End Testing (Playwright/Cypress) for complex tools
- [ ] A11y Audit - keyboard navigation & ARIA labels
- [ ] Analytics integration (privacy-focused)
- [ ] Tool usage statistics (local only)
- [ ] Multi-language support (i18n)

## Storage Structure

```typescript
// localStorage schema

// Global
localStorage.setItem("devtools:theme", "dark");
localStorage.setItem(
  "devtools:favorites",
  JSON.stringify(["base64", "json-format"])
);
localStorage.setItem(
  "devtools:recent",
  JSON.stringify(["uuid", "hash", "base64"])
);

// Per-tool settings
localStorage.setItem(
  "devtools:tool:markdown-pdf",
  JSON.stringify({
    method: "jspdf",
    pageSize: "A4",
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includePageNumbers: true,
  })
);

localStorage.setItem(
  "devtools:tool:image-converter",
  JSON.stringify({
    defaultFormat: "png",
    defaultQuality: 90,
    maintainAspectRatio: true,
  })
);
```
