# Architecture Notes

This document reflects the current application architecture for DevTools Collection after the completed move to Next.js App Router and static export.

## Status

- The active application is the Next.js app in `src/`
- Static export is configured in `next.config.mjs`
- All live tool pages are generated from the typed registry in `src/lib/utils/tool-registry.ts`
- Tool interactions run in browser-side client components
- The production build output is written to `out/`

## Rendering Model

- Route HTML is generated at build time
- Tool pages are statically exported with `generateStaticParams()`
- Client components hydrate after load to power interactive tools
- Browser-only work stays inside client components, effects, and event handlers

The app is a static export with client-side tool execution layered on top. It is not request-time server rendered.

## Key Files

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/tools/[slug]/page.tsx`
- `src/components/ToolPageClient.tsx`
- `src/lib/utils/tool-registry.ts`
- `src/lib/utils/tools-config.ts`
- `src/lib/contexts/*`

## Tool Wiring

Tools are defined in `src/lib/utils/tool-registry.ts`. Each registry entry includes:

- slug
- display metadata
- typed lazy component loader

Current behavior:

- `src/lib/utils/tools-config.ts` derives `TOOLS` from the registry for static routes, search, sitemap, and metadata
- `src/app/tools/[slug]/page.tsx` resolves the selected tool and renders it inside `ToolPageClient`
- `npm run typecheck` catches missing component loaders and invalid component exports

## Static Export Notes

With `output: 'export'`:

- Next generates one HTML file per route at build time
- Dynamic routes like `/tools/[slug]` work through `generateStaticParams()`
- `robots.txt` and `sitemap.xml` are emitted statically
- Tool pages generate metadata from the shared tool config

## Build And Deploy

```bash
npm install
npm run build
```

Output:

```text
out/
```

If deploying with Wrangler, the asset directory should point to `./out`.

## Current Priorities

- Add automated route and tool coverage tests
- Add generated Open Graph images
- Continue reducing shared dynamic-route bundle references where practical
- Expand the roadmap with the next PDF, image, utility, text, developer, design, and calculator tool families, including browser-side compression, PDF text analysis, validation, and accessibility helpers
