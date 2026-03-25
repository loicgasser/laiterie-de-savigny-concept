/**
 * Client-side i18n framework.
 * Usage:
 *   import { initI18n } from '../scripts/i18n';
 *   initI18n(translations, { onApply: (lang, t) => { ... } });
 */

type Translations = Record<string, Record<string, string>>;

export function applyLanguage(lang: string, translations: Translations): void {
  const t = translations[lang];
  if (!t) return;

  // Update all data-i18n elements (textContent)
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Update all data-i18n-html elements (innerHTML)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html')!;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Update <html lang>
  document.documentElement.lang = lang;

  // Update <title>
  if (t['page.title']) document.title = t['page.title'];

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && t['page.description']) metaDesc.setAttribute('content', t['page.description']);

  // Update og:title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', t['page.title'] || '');

  // Update og:description
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && t['page.description']) ogDesc.setAttribute('content', t['page.description']);

  // Update toggle button text
  const toggle = document.getElementById('langToggle');
  if (toggle) toggle.textContent = lang === 'fr' ? 'EN' : 'FR';

  // Remove FOUC prevention class
  document.documentElement.classList.remove('i18n-loading');
}

export function getLanguage(): string {
  return (
    localStorage.getItem('lang') ||
    (navigator.language?.startsWith('fr') ? 'fr' : 'en')
  );
}

export function initI18n(
  translations: Translations,
  options?: { onApply?: (lang: string, translations: Translations) => void }
): void {
  let currentLang = getLanguage();

  if (options?.onApply) {
    options.onApply(currentLang, translations);
  }

  applyLanguage(currentLang, translations);

  const toggle = document.getElementById('langToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      currentLang = currentLang === 'fr' ? 'en' : 'fr';
      localStorage.setItem('lang', currentLang);
      if (options?.onApply) {
        options.onApply(currentLang, translations);
      }
      applyLanguage(currentLang, translations);
    });
  }
}
