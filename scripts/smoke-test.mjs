#!/usr/bin/env node
/**
 * Smoke test: launches the Astro preview server, checks all pages return 200,
 * verifies nav + footer are present, tests mobile viewport, checks for JS errors.
 *
 * Usage: node scripts/smoke-test.mjs
 * Requires: npm run build (dist/ must exist), playwright installed
 */
import { execSync, spawn } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Discover all HTML pages from dist/
function findHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...findHtmlFiles(full));
    else if (entry.endsWith('.html')) {
      const rel = full.replace('dist/', '/').replace('.html', '.html');
      files.push(rel);
    }
  }
  return files;
}

if (!existsSync('dist')) {
  console.error('Error: dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

const pages = findHtmlFiles('dist');
console.log(`Found ${pages.length} pages: ${pages.join(', ')}`);

// Start preview server
const server = spawn('npx', ['astro', 'preview', '--port', '4322'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});

// Wait for server to be ready
await new Promise((resolve) => {
  server.stdout.on('data', (data) => {
    if (data.toString().includes('4322')) resolve();
  });
  setTimeout(resolve, 5000); // fallback timeout
});

let errors = 0;
const BASE = 'http://localhost:4322';

try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();

  // Desktop viewport
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const jsErrors = [];
  desktopPage.on('pageerror', (err) => jsErrors.push(err.message));

  for (const path of pages) {
    const url = `${BASE}${path}`;
    const response = await desktopPage.goto(url, { waitUntil: 'domcontentloaded' });
    const status = response?.status();

    if (status !== 200) {
      console.error(`\u274C ${path}: HTTP ${status}`);
      errors++;
    } else {
      console.log(`\u2705 ${path}: HTTP 200`);
    }

    // Check nav + footer on non-404 pages
    if (!path.includes('404')) {
      const hasNav = await desktopPage.$('#navbar');
      const hasFooter = await desktopPage.$('.footer');
      if (!hasNav) { console.error(`\u274C ${path}: missing #navbar`); errors++; }
      if (!hasFooter) { console.error(`\u274C ${path}: missing .footer`); errors++; }
    }
  }

  if (jsErrors.length > 0) {
    console.error(`\u274C JS errors detected:`);
    jsErrors.forEach((e) => console.error(`  - ${e}`));
    errors += jsErrors.length;
  }

  // Mobile viewport check
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const mobileResponse = await mobilePage.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  if (mobileResponse?.status() !== 200) {
    console.error(`\u274C Mobile: index.html not OK`);
    errors++;
  } else {
    const navToggle = await mobilePage.$('.nav-toggle');
    if (!navToggle) {
      console.error(`\u274C Mobile: .nav-toggle not found`);
      errors++;
    } else {
      console.log(`\u2705 Mobile: nav-toggle present`);
    }
  }

  await browser.close();
} catch (err) {
  console.error(`\u274C Test error: ${err.message}`);
  errors++;
}

server.kill();

console.log(`\n${errors === 0 ? '\u2705 All smoke tests passed!' : `\u274C ${errors} error(s) found.`}`);
process.exit(errors > 0 ? 1 : 0);
