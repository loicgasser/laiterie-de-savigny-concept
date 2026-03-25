# Astro Static Site Template

## Project Structure

```
src/
  config.ts          — Single source of truth for all site settings
  layouts/Base.astro — Shared HTML shell (meta, OG, header, footer, cookie consent)
  components/        — Reusable UI components
    Header.astro     — Fixed nav bar (transparent/solid variants)
    Footer.astro     — Site footer with legal links + social icons
    CookieConsent.astro — GA4 cookie consent banner (only renders if GA ID set)
    AdSlot.astro     — Ad placeholder (Carbon/AdSense/none)
    KofiButton.astro — Floating Ko-fi support button
    AffiliateLink.astro — Multi-marketplace affiliate link group
    SEO.astro        — JSON-LD schema helper
  pages/             — Each .astro file = one HTML page
  styles/
    theme.css        — All shared CSS (tokens, nav, footer, hero, cards, cookie banner)
    fonts.css        — @font-face declarations for self-hosted Inter + Source Code Pro
  scripts/
    i18n.ts          — Client-side language switching framework
scripts/
  validate-jsonld.mjs — Post-build JSON-LD validation
  deploy.sh          — S3 + CloudFront deploy script
  smoke-test.mjs     — Playwright-based smoke test
public/
  fonts/             — Self-hosted woff2 font files
  images/            — Site images (favicon, OG image, etc.)
```

## Conventions

- **All pages must have JSON-LD structured data.** Use the `jsonLd` prop on `Base.astro` or the `SEO.astro` component. The build will fail if required schemas are missing (see `scripts/validate-jsonld.mjs` for the schema map).
- **Use `src/config.ts` for site-wide settings.** Never hardcode the site name, URL, or legal info in components or pages. Import from config.
- **Run `npm run build` to validate.** The build script runs `astro build` then `validate-jsonld.mjs`. Both must pass.
- **Dark theme by default.** All CSS uses custom properties defined in `theme.css`. Override via `:root` if needed.
- **Self-hosted fonts only.** No external font requests. Fonts are in `public/fonts/`.

## How to Add a New Page

1. Create `src/pages/my-page.astro`
2. Import `Base` layout and `config`
3. Pass `title`, `description`, and `jsonLd` (at minimum a BreadcrumbList) to `Base`
4. Add the page to `config.ts` nav array if it should appear in navigation
5. Add required schemas to `REQUIRED_SCHEMAS` in `scripts/validate-jsonld.mjs`
6. Run `npm run build` to verify

## How to Add a New Component

1. Create `src/components/MyComponent.astro`
2. Define a TypeScript `interface Props` for type safety
3. Import and use in pages or layouts
4. Add any component-specific CSS to `theme.css` or inline in the component

## Deploy Process

1. `npm run build` — builds site + validates JSON-LD
2. `npm run test` — runs Playwright smoke tests against preview server
3. `bash scripts/deploy.sh <S3_BUCKET> <CF_DISTRIBUTION_ID>` — syncs to S3 with proper cache headers and invalidates CloudFront
4. Or use `npm run ship` to run all three steps

## Testing

- `npm run test` — launches preview server, checks all pages return 200, verifies nav/footer present, tests mobile viewport, checks for JS console errors
- Requires `npm run build` first (needs dist/ directory)
- Requires Playwright browsers: `npx playwright install chromium`
