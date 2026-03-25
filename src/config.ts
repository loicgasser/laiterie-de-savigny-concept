/**
 * Central site configuration — single source of truth.
 * Every component reads from here. No hardcoded site names or URLs elsewhere.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: 'twitter' | 'github' | 'linkedin' | 'mastodon' | 'youtube' | 'instagram';
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
    phone?: string;
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
  siteName: 'Laiterie de Savigny',
  siteUrl: 'https://loicgasser.github.io/laiterie-de-savigny-concept',
  description: 'Commerce de proximité à Savigny — fromages à la coupe, produits laitiers, fruits et légumes de saison, épicerie locale.',
  language: 'fr',
  tagline: 'La laiterie du village',
  ctaText: 'Nous rendre visite',
  ctaUrl: '#contact',

  author: {
    name: 'Laiterie de Savigny',
    email: 'alaiterie@epicerieslocales.ch',
    url: 'https://loicgasser.github.io/laiterie-de-savigny-concept',
  },

  analytics: {
    // gaTrackingId: 'G-XXXXXXXXXX',
  },

  ads: {},

  social: [
    { platform: 'instagram', url: 'https://www.instagram.com/laiterie_savigny', label: 'Instagram' },
  ],

  legal: {
    companyName: 'Laiterie de Savigny',
    address: 'Rte des Miguettes 1',
    locality: 'Savigny',
    postalCode: '1073',
    country: 'Suisse',
    email: 'alaiterie@epicerieslocales.ch',
    phone: '021 781 20 56',
    responsiblePerson: 'Laiterie de Savigny',
  },

  nav: [
    { label: 'Accueil', href: '/' },
    { label: 'Nos produits', href: '/#produits' },
    { label: 'Notre histoire', href: '/#histoire' },
    { label: 'Contact', href: '/#contact' },
  ],

  i18n: {
    enabled: false,
    defaultLang: 'fr',
    languages: ['fr'],
  },
};

export default config;
