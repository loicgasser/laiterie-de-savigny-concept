# Astro Static Site Template

A batteries-included template for spinning up niche static sites in minutes. Dark theme, SEO-ready with JSON-LD validation, Swiss law compliant legal pages, self-hosted fonts, and a deploy pipeline for AWS S3 + CloudFront.

## Quick Start

```bash
# Create a new repo from this template
gh repo create my-new-site --template your-username/astro-static-template --private --clone
cd my-new-site

# Install dependencies
npm install

# Configure your site
# Edit src/config.ts with your site name, URL, legal info, etc.

# Start developing
npm run dev
```

## Configuration

All site-wide settings live in `src/config.ts`:

| Setting | Description |
|---------|-------------|
| `siteName` | Displayed in header, footer, meta tags |
| `siteUrl` | Used for canonical URLs, OG tags, JSON-LD |
| `description` | Default meta description |
| `language` | HTML lang attribute (`en`, `fr`, `de`) |
| `tagline` | Hero section headline |
| `author` | Author name, email, URL |
| `analytics.gaTrackingId` | Google Analytics 4 ID (optional — omit to disable) |
| `ads` | Carbon Ads / AdSense config (optional) |
| `social` | Social media links for footer |
| `legal` | Company name, address, email for privacy/impressum pages |
| `nav` | Navigation links |
| `i18n` | Internationalization settings |

## Project Structure

```
src/
  config.ts              # Site configuration (single source of truth)
  layouts/Base.astro     # Shared HTML shell
  components/
    Header.astro         # Navigation (transparent/solid)
    Footer.astro         # Footer with legal links + social
    CookieConsent.astro  # GA4 consent banner
    AdSlot.astro         # Ad placeholder (Carbon/AdSense)
    KofiButton.astro     # Ko-fi floating button
    AffiliateLink.astro  # Multi-marketplace affiliate links
    SEO.astro            # JSON-LD helper
  pages/
    index.astro          # Homepage with hero
    404.astro            # 404 page (standalone)
    privacy.astro        # Privacy policy (Swiss law)
    impressum.astro      # Legal notice (Swiss law)
  styles/
    theme.css            # Design tokens + all shared CSS
    fonts.css            # Self-hosted font declarations
  scripts/
    i18n.ts              # Client-side i18n framework
scripts/
  validate-jsonld.mjs    # JSON-LD validation (runs on build)
  deploy.sh              # S3 + CloudFront deploy
  smoke-test.mjs         # Playwright smoke tests
public/
  fonts/                 # Self-hosted Inter + Source Code Pro
  images/                # Site images
```

## Adding Pages

1. Create `src/pages/my-page.astro`
2. Use the `Base` layout with `title`, `description`, and `jsonLd` props
3. Add to `config.ts` nav array
4. Add required schemas to `scripts/validate-jsonld.mjs`

```astro
---
import Base from '../layouts/Base.astro';
import config from '../config';
---

<Base
  title={`My Page — ${config.siteName}`}
  description="Page description for SEO."
  jsonLd={[{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${config.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'My Page', item: `${config.siteUrl}/my-page.html` },
    ],
  }]}
>
  <header class="article-header">
    <div class="container">
      <a href="/" class="back-link">&larr; Home</a>
      <h1>My Page</h1>
    </div>
  </header>
  <div class="article-body">
    <!-- Content here -->
  </div>
</Base>
```

## Adding Components

Create `src/components/MyComponent.astro` with typed props:

```astro
---
interface Props {
  title: string;
  variant?: 'default' | 'featured';
}
const { title, variant = 'default' } = Astro.props;
---
<div class={`my-component ${variant}`}>
  <h3>{title}</h3>
  <slot />
</div>
```

## Deploy

### AWS S3 + CloudFront

```bash
# Configure with your bucket and distribution ID
bash scripts/deploy.sh my-site-bucket E1A2B3C4D5E6F7

# Or run the full pipeline (build + test + deploy)
npm run ship
```

The deploy script sets proper cache headers:
- HTML: 5 min cache, must-revalidate
- Hashed assets (JS/CSS): 1 year, immutable
- Fonts: 1 year, immutable
- Images: 1 week

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build + validate JSON-LD |
| `npm run preview` | Preview built site |
| `npm run validate:schema` | Validate JSON-LD only |
| `npm run test` | Playwright smoke tests |
| `npm run ship` | Build + test + deploy |

## Testing

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Build then test
npm run build
npm run test
```

The smoke test checks:
- All pages return HTTP 200
- Navigation and footer are present
- No JavaScript console errors
- Mobile viewport renders correctly
