/**
 * Central site configuration — single source of truth.
 * Every component reads from here. No hardcoded site names or URLs elsewhere.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: 'twitter' | 'github' | 'linkedin' | 'mastodon' | 'youtube';
  url: string;
  label?: string;
}

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  description: string;
  language: 'en' | 'fr' | 'de';
  tagline: string;
  ctaText: string;
  ctaUrl: string;

  author: {
    name: string;
    email: string;
    url: string;
    role?: string;
  };

  analytics: {
    gaTrackingId?: string;
  };

  ads: {
    carbon?: { serveId: string };
    adsense?: { clientId: string };
  };

  social: SocialLink[];

  legal: {
    companyName: string;
    address: string;
    locality: string;
    postalCode: string;
    country: string;
    email: string;
    responsiblePerson: string;
    responsibleRole?: string;
  };

  nav: NavLink[];

  i18n: {
    enabled: boolean;
    defaultLang: string;
    languages: string[];
  };
}

const config: SiteConfig = {
  siteName: 'My Static Site',
  siteUrl: 'https://example.com',
  description: 'A fast, dark-themed static site built with Astro.',
  language: 'en',
  tagline: 'Build something great.',
  ctaText: 'Get Started',
  ctaUrl: '#contact',

  author: {
    name: 'Your Name',
    email: 'hello@example.com',
    url: 'https://example.com',
    role: 'Founder',
  },

  analytics: {
    // gaTrackingId: 'G-XXXXXXXXXX',
  },

  ads: {
    // carbon: { serveId: 'CESI...' },
    // adsense: { clientId: 'ca-pub-...' },
  },

  social: [
    { platform: 'github', url: 'https://github.com/your-username', label: 'GitHub' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/your-profile', label: 'LinkedIn' },
  ],

  legal: {
    companyName: 'Your Company',
    address: '123 Street Name',
    locality: 'City',
    postalCode: '00000',
    country: 'Switzerland',
    email: 'hello@example.com',
    responsiblePerson: 'Your Name',
    responsibleRole: 'Founder',
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Privacy', href: '/privacy.html' },
    { label: 'Impressum', href: '/impressum.html' },
  ],

  i18n: {
    enabled: false,
    defaultLang: 'en',
    languages: ['en'],
  },
};

export default config;
