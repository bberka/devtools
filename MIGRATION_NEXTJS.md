# Next.js Migration Guide

This document tracks the migration from the old Astro + Preact implementation to the current Next.js App Router static export setup.

## Status

The active application now runs on Next.js and builds successfully with static export.

Completed:

- Next.js App Router structure moved into `src/app`
- Static export configured in `next.config.mjs`
- Root layout, home page, not-found page, sitemap, and robots implemented in App Router
- React context providers added for theme, favorites, recent tools, and command palette
- shadcn-style UI layer migrated to React
- All tool components moved into `src/components/tools`
- Dynamic tool route implemented with `generateStaticParams()`
- Static export verified with `npm run build`
- Legacy Astro/Preact source tree removed from active app flow
- Old Astro config and source folders cleaned up

## Current Architecture

### Rendering model

- Route HTML is generated at build time
- Tool pages are statically exported
- Tool interfaces hydrate on the client for interactivity
- Tool bundles are code-split with `next/dynamic`

This means the app is not a pure SPA, and it is not server-rendered at request time either. It is a static export with interactive client-side tools layered on top.

### Key files

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/tools/[slug]/page.tsx`
- `src/components/ToolPageClient.tsx`
- `src/components/ToolComponentRenderer.tsx`
- `src/lib/utils/tools-config.ts`
- `src/lib/contexts/*`

## Why The Tool Renderer Uses `dynamic()`

`dynamic()` is currently used for code-splitting tool modules so each tool page does not eagerly load every tool implementation into the initial client bundle.

Important distinction:

- `dynamic(..., { ssr: false })` would skip prerendering that subtree and weaken SEO
- plain `dynamic(..., { loading })` still allows build-time prerendering when the component is SSR-safe

The current setup keeps static export compatibility while improving bundle loading characteristics.

## SEO / Static Export Notes

With `output: 'export'`:

- Next generates one HTML file per route at build time
- Dynamic routes like `/tools/[slug]` are supported through `generateStaticParams()`
- Route metadata like `robots.txt` and `sitemap.xml` are emitted statically

Relevant docs:

- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/getting-started/server-and-client-components

## Migration Decisions

### Chosen

- Keep the site statically exportable
- Keep tools interactive as client components
- Use React instead of Preact
- Use the App Router instead of Pages Router
- Preserve favorites, recent tools, dark mode, and command palette behavior

### Removed

- Astro pages and layouts
- Preact component tree
- Astro config and build output
- Old duplicated preact-based UI and tool source

## Remaining Work

- Replace the hardcoded `TOOL_COMPONENTS` map with a typed registry
- Refresh documentation in `CONTRIBUTING.md` and any planning docs that still mention Astro/Preact
- Add automated verification for tool routes and UI behavior
- Audit performance and client bundle sizes

## Build / Deploy

### Build

```bash
npm install
npm run build
```

### Output

```text
out/
```

### Cloudflare / Wrangler

If deploying static assets with Wrangler, the asset directory should point to `./out`.

## Gotchas We Hit During Migration

- Missing PostCSS config caused Tailwind styles to appear as plain HTML
- Unstable context callbacks caused repeated effects and update loops
- `ssr: false` on all tools caused unnecessary SEO and prerender tradeoffs
- Static export requires metadata routes like `robots.ts` and `sitemap.ts` to be static-safe

## Summary

The migration is far enough along that the Next.js application is now the real app, not a parallel experiment. Future work should focus on architecture polish, testing, and documentation cleanup rather than basic framework migration.
