# Next.js Migration Guide

This document tracks the migration from Astro + Preact to Next.js App Router with static export.

## ✅ Completed

### Phase 1: Foundation & Core Infrastructure
- [x] Created `next.config.mjs` with static export configuration
- [x] Created `app/layout.tsx` root layout with metadata
- [x] Created `app/providers.tsx` Context providers wrapper
- [x] Created `app/page.tsx` home page
- [x] Created `app/not-found.tsx` 404 page
- [x] Copied `src/styles/globals.css` (renamed from global.css)

### Phase 2: Context API (State Management)
- [x] Created `src/lib/contexts/ThemeContext.tsx`
- [x] Created `src/lib/contexts/FavoritesContext.tsx`
- [x] Created `src/lib/contexts/RecentToolsContext.tsx`
- [x] Created `src/lib/contexts/CommandPaletteContext.tsx`

### Phase 3: Core Components
- [x] Migrated `src/components/Header.tsx`
- [x] Migrated `src/components/Footer.tsx`
- [x] Migrated `src/components/ThemeToggle.tsx`
- [x] Migrated `src/components/CommandPaletteButton.tsx`
- [x] Migrated `src/components/CommandPalette.tsx`

### Phase 4: Dynamic Routes & SEO
- [x] Created `app/tools/[slug]/page.tsx` with `generateStaticParams()`
- [x] Added `generateMetadata()` for SEO optimization
- [x] Created `app/sitemap.ts` for XML sitemap
- [x] Created `app/robots.ts` for robots.txt
- [x] Added JSON-LD structured data

## 🚧 In Progress / To Do

### Phase 5: Home Page Components
- [ ] Migrate `src/components/HomeContent.tsx`
- [ ] Migrate `src/components/CategoryFilter.tsx`
- [ ] Migrate `src/components/SearchBar.tsx`
- [ ] Migrate `src/components/FavoriteButton.tsx`
- [ ] Create `src/components/ToolComponentRenderer.tsx`

### Phase 6: UI Components
The project already has shadcn/ui components in `src/components/ui/`. These need:
- [ ] Verify all use React imports (not Preact)
- [ ] Add `'use client'` to interactive components
- [ ] Update `lucide-preact` → `lucide-react` imports
- [ ] Test each component:
  - [ ] button.tsx
  - [ ] card.tsx
  - [ ] input.tsx
  - [ ] textarea.tsx
  - [ ] select.tsx
  - [ ] checkbox.tsx
  - [ ] slider.tsx
  - [ ] badge.tsx
  - [ ] scroll-area.tsx
  - [ ] toaster.tsx (sonner)

### Phase 7: Custom Hooks
- [ ] Migrate `src/hooks/useCopyToClipboard.ts` (from preact/hooks to react)
- [ ] Migrate `src/hooks/useActionButton.ts` (if exists)

### Phase 8: Tool Components (34 Total)

#### Converters (10 tools)
- [ ] `src/components/tools/Base64Converter.tsx`
- [ ] `src/components/tools/UrlEncoder.tsx`
- [ ] `src/components/tools/HtmlEncoder.tsx`
- [ ] `src/components/tools/NumberBaseConverter.tsx`
- [ ] `src/components/tools/TimestampConverter.tsx`
- [ ] `src/components/tools/ColorConverter.tsx`
- [ ] `src/components/tools/CaseConverter.tsx`
- [ ] `src/components/tools/JsonYamlXmlConverter.tsx`
- [ ] `src/components/tools/ImageConverter.tsx`
- [ ] `src/components/tools/MarkdownConverter.tsx`

#### Encoders & Decoders (2 tools)
- [ ] `src/components/tools/JwtDecoder.tsx`
- [ ] `src/components/tools/TextEscape.tsx`

#### Generators (4 tools)
- [ ] `src/components/tools/HashGenerator.tsx`
- [ ] `src/components/tools/UuidGenerator.tsx`
- [ ] `src/components/tools/PasswordGenerator.tsx`
- [ ] `src/components/tools/LoremIpsumGenerator.tsx`

#### Formatters & Validators (4 tools)
- [ ] `src/components/tools/SqlFormatter.tsx`
- [ ] `src/components/tools/JsonFormatter.tsx`
- [ ] `src/components/tools/XmlFormatter.tsx`
- [ ] `src/components/tools/XmlValidator.tsx`

#### Text Tools (3 tools)
- [ ] `src/components/tools/MarkdownPreviewer.tsx`
- [ ] `src/components/tools/TextDiff.tsx`
- [ ] `src/components/tools/RegexTester.tsx`

#### Utilities (1 tool)
- [ ] `src/components/tools/CronParser.tsx`

#### Security (3 tools)
- [ ] `src/components/tools/RsaKeyGenerator.tsx`
- [ ] `src/components/tools/AesEncryption.tsx`
- [ ] `src/components/tools/BcryptHasher.tsx`

#### Networking (4 tools)
- [ ] `src/components/tools/IpLookup.tsx`
- [ ] `src/components/tools/DnsLookup.tsx`
- [ ] `src/components/tools/SubnetCalculator.tsx`
- [ ] `src/components/tools/PortChecker.tsx`

#### Design (2 tools)
- [ ] `src/components/tools/SvgPathEditor.tsx`
- [ ] `src/components/tools/ColorContrastChecker.tsx`

### Phase 9: Dependencies & Configuration
- [ ] Update `package.json` dependencies
  - Remove: astro, @astrojs/preact, @astrojs/tailwind, preact, lucide-preact, prettier-plugin-astro
  - Add: next, react, react-dom, lucide-react, eslint-config-next
- [ ] Update `tsconfig.json` for Next.js
- [ ] Test build: `npm run build`
- [ ] Verify static export in `out/` directory

### Phase 10: Testing & Deployment
- [ ] Test all 34 tools functionality
- [ ] Test theme toggle and persistence
- [ ] Test favorites add/remove/persist
- [ ] Test recent tools tracking
- [ ] Test command palette (Ctrl+K)
- [ ] Test cross-tab synchronization
- [ ] Test mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Deploy to Cloudflare Pages

## 📝 Migration Patterns

### Preact → React Component Migration

**Before (Preact):**
```tsx
import { useState, useEffect } from 'preact/hooks';
import { Icon } from 'lucide-preact';
import { Button } from './ui/button';

export function MyComponent() {
  const [state, setState] = useState('');

  return (
    <Button onInput={(e) => setState(e.target.value)}>
      <Icon className="h-4 w-4" />
      Click me
    </Button>
  );
}
```

**After (React):**
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import { Button } from './ui/button';

export function MyComponent() {
  const [state, setState] = useState('');

  return (
    <Button onChange={(e) => setState(e.target.value)}>
      <Icon className="h-4 w-4" />
      Click me
    </Button>
  );
}
```

**Key Changes:**
1. Add `'use client'` directive at the top
2. Replace `preact/hooks` → `react`
3. Replace `lucide-preact` → `lucide-react`
4. Change `onInput` → `onChange` for form elements
5. Remove custom event listeners, use Context hooks instead

### Using Context API

**Replace custom events:**
```tsx
// ❌ Old way (custom events)
window.dispatchEvent(new CustomEvent('favoriteToggled', { detail: { toolId }}));
window.addEventListener('favoriteToggled', handler);

// ✅ New way (Context)
const { toggleFavorite } = useFavorites();
toggleFavorite(toolId); // Automatically updates all consumers
```

### Tool Component Pattern

Each tool component should follow this pattern:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Trash2 } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export function MyTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // Real-time processing
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    // Process input -> output
    setOutput(processInput(input));
  }, [input]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input..."
        />
        <Textarea
          value={output}
          readOnly
          placeholder="Output appears here..."
        />
        <div className="flex gap-2">
          <Button onClick={() => copyToClipboard(output)}>
            <Copy className="h-4 w-4 mr-2" />
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" onClick={() => setInput('')}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🚀 Next Steps

1. **Install Dependencies:**
   ```bash
   npm install next@latest react@latest react-dom@latest
   npm install lucide-react
   npm install -D eslint-config-next
   npm uninstall astro @astrojs/preact @astrojs/tailwind preact lucide-preact prettier-plugin-astro
   ```

2. **Update package.json scripts:**
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     }
   }
   ```

3. **Update tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "plugins": [{ "name": "next" }],
       "jsx": "preserve"
     }
   }
   ```

4. **Migrate remaining components** following the patterns above

5. **Test build:**
   ```bash
   npm run build
   # Verify out/ directory is created with all pages
   ```

6. **Deploy to Cloudflare Pages:**
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node.js version: `20.x`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Context API](https://react.dev/reference/react/createContext)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

## 🐛 Known Issues / Gotchas

1. **Theme Flash:** Inline script in `app/layout.tsx` prevents FOUC
2. **Hydration Mismatch:** Contexts check `mounted` state before rendering
3. **Cross-tab Sync:** Still uses `storage` event listeners in contexts
4. **Image Optimization:** Disabled via `images: { unoptimized: true }`
5. **Navigation:** Using `next/navigation` router for client-side nav

## 📞 Support

If you encounter issues during migration:
1. Check this guide for patterns and solutions
2. Review the completed components as reference
3. Check Next.js documentation
4. Open an issue on GitHub
