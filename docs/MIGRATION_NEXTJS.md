# Next.js Migration Notes

This document tracks the migration from the old Astro + Preact implementation to the current Next.js App Router static export setup.

## Status

The active application now runs on Next.js and builds successfully with static export.

Completed:

- Next.js App Router structure lives in `src/app`
- Static export is configured in `next.config.mjs`
- Root layout, home page, not-found page, sitemap, robots, and dynamic tool pages are implemented
- React context providers cover theme, settings, favorites, recent tools, and command palette state
- shadcn-style UI components have been migrated to React
- Tool components live in `src/components/tools`
- Dynamic tool route uses `generateStaticParams()`
- Per-tool metadata is generated from `src/lib/utils/tools-config.ts`
- Static export is verified with `npm run build`
- Legacy Astro pages, layouts, config, and Preact component tree are no longer in the active app flow

## Current Architecture

### Rendering Model

- Route HTML is generated at build time
- Tool pages are statically exported
- Tool interfaces hydrate on the client for interactivity
- Browser-only work stays inside client components and event handlers

The app is a static export with interactive client-side tools layered on top. It is not server-rendered at request time.

### Key Files

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/tools/[slug]/page.tsx`
- `src/components/ToolPageClient.tsx`
- `src/components/ToolComponentRenderer.tsx`
- `src/lib/utils/tools-config.ts`
- `src/lib/contexts/*`

## Tool Wiring

Tools are defined in `src/lib/utils/tools-config.ts` and rendered through the map in `src/components/ToolComponentRenderer.tsx`.

Current tradeoff:

- The explicit map is simple and type-checks imports at build time
- It is easy for metadata and renderer wiring to drift unless reviewed together
- It imports every tool module into the renderer bundle, so a typed dynamic registry would be a useful next architecture cleanup

## SEO / Static Export Notes

With `output: 'export'`:

- Next generates one HTML file per route at build time
- Dynamic routes like `/tools/[slug]` are supported through `generateStaticParams()`
- `robots.txt` and `sitemap.xml` are emitted statically
- Tool pages generate metadata from the tool config

Relevant docs:

- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/getting-started/server-and-client-components

## Migration Decisions

Chosen:

- Keep the site statically exportable
- Keep tools interactive as client components
- Use React instead of Preact
- Use the App Router instead of Pages Router
- Preserve favorites, recent tools, dark mode, settings, and command palette behavior

Removed:

- Astro pages and layouts
- Preact component tree
- Astro config and build output
- Old duplicated UI and tool source

## Remaining Work

- Replace the hardcoded `TOOL_COMPONENTS` map with a typed registry or dynamic loader
- Add automated route/tool tests
- Add PWA/offline support
- Add generated Open Graph images
- Audit performance and client bundle sizes
- Decide whether password hashing should remain bcrypt-only or gain Argon2 support

## Build / Deploy

```bash
npm install
npm run build
```

Output:

```text
out/
```

If deploying static assets with Wrangler, the asset directory should point to `./out`.

## Gotchas From Migration

- Missing PostCSS config made Tailwind styles render as plain HTML
- Unstable context callbacks caused repeated effects and update loops
- Static export requires metadata routes like `robots.ts` and `sitemap.ts` to be static-safe
- Next static export does not use `next start` as the production serving model; deploy the generated `out/` directory

## Summary

The migration is complete enough that Next.js is now the only active application. Future work should focus on architecture polish, testing, PWA/SEO improvements, and keeping documentation aligned with the current code.
