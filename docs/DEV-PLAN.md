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

## Tool Categories

1. **Converters** (9 tools)

   - Markdown to PDF
   - Image Converter
   - Base64 Encoder/Decoder
   - Number Base Converter
   - JSON ↔ YAML ↔ XML
   - Unix Timestamp Converter
   - URL Encoder/Decoder
   - HTML Encoder/Decoder

2. **Encoders & Decoders** (5 tools)

   - JWT Decoder
   - Text Escape/Unescape
   - Base64
   - URL
   - HTML

3. **Generators** (4 tools)

   - Hash Generator
   - UUID Generator (v4, v7, Snowflake)
   - Password Generator
   - Lorem Ipsum Generator

4. **Formatters & Validators** (4 tools)

   - SQL Formatter (multi-DB support)
   - JSON Formatter
   - XML Formatter
   - XML Validator

5. **Text Tools** (3 tools)

   - Markdown Previewer
   - Text Diff Visualizer
   - Regex Tester

6. **Utilities** (1 tool)
   - Cron Expression Parser/Generator

## Home Page Design

```
┌─────────────────────────────────────────────┐
│  DevToys  [Search bar...]     [Settings ⚙] │
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
- No API routes required
- No server-side rendering needed
- Astro generates pure static HTML + JS

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Astro + Preact + Tailwind setup
- [ ] shadcn/ui component library setup (Preact adapters)
- [ ] Home page with category grid
- [ ] LocalStorage utilities (favorites, settings only)
- [ ] Search & filter system
- [ ] Responsive layout
- [ ] Dark mode toggle

### Phase 2: Easy Tools (Week 2)

- [ ] Base64 Encoder/Decoder
- [ ] URL Encoder/Decoder
- [ ] HTML Encoder/Decoder
- [ ] UUID Generator (v4, v7, Snowflake)
- [ ] Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- [ ] Password Generator
- [ ] Lorem Ipsum Generator
- [ ] Number Base Converter
- [ ] Unix Timestamp Converter

### Phase 3: Medium Tools (Week 3)

- [ ] JSON Formatter & Validator
- [ ] JSON ↔ YAML ↔ XML Converter
- [ ] XML Formatter
- [ ] XML Validator
- [ ] Text Escape/Unescape
- [ ] Cron Expression Parser/Generator
- [ ] JWT Decoder
- [ ] Regex Tester (with match highlighting)

### Phase 4: Complex Tools (Week 4)

- [ ] Markdown Previewer (katex, highlight.js, mermaid support)
- [ ] SQL Formatter (PostgreSQL, MySQL, MSSQL, BigQuery, etc.)
- [ ] Text Diff Visualizer (side-by-side + inline modes)

### Phase 5: Advanced Features (Week 5)

- [ ] **Image Converter** (resize, crop, compress, filters)
- [ ] **Markdown to PDF** (both jsPDF and Print API options)
- [ ] Settings modal (global + per-tool)
- [ ] Export/Import settings
- [ ] Keyboard shortcuts (Ctrl+K for search, etc.)

## Storage Structure

```typescript
// localStorage schema

// Global
localStorage.setItem("devtoys:theme", "dark");
localStorage.setItem(
  "devtoys:favorites",
  JSON.stringify(["base64", "json-format"])
);
localStorage.setItem(
  "devtoys:recent",
  JSON.stringify(["uuid", "hash", "base64"])
);

// Per-tool settings
localStorage.setItem(
  "devtoys:tool:markdown-pdf",
  JSON.stringify({
    method: "jspdf",
    pageSize: "A4",
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includePageNumbers: true,
  })
);

localStorage.setItem(
  "devtoys:tool:image-converter",
  JSON.stringify({
    defaultFormat: "png",
    defaultQuality: 90,
    maintainAspectRatio: true,
  })
);
```
