#!/usr/bin/env node
// Validates all JSON-LD blocks in HTML files under dist/
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Configure required schemas per page.
// Keys are relative paths from dist/. Values are arrays of required @type values.
const REQUIRED_SCHEMAS = {
  'index.html': ['WebSite', 'Organization', 'LocalBusiness'],
  'privacy.html': ['BreadcrumbList'],
  'impressum.html': ['BreadcrumbList'],
};

function findHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...findHtmlFiles(full));
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

function extractJsonLd(html) {
  const blocks = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch (e) {
      blocks.push({ _parseError: e.message, _raw: match[1].substring(0, 100) });
    }
  }
  return blocks;
}

let errors = 0;
let total = 0;
const distDir = 'dist';

for (const file of findHtmlFiles(distDir)) {
  const rel = file.replace(distDir + '/', '');
  const html = readFileSync(file, 'utf8');
  const schemas = extractJsonLd(html);
  total++;

  // Check for parse errors
  for (const s of schemas) {
    if (s._parseError) {
      console.error(`\u274C ${rel}: JSON-LD parse error: ${s._parseError}`);
      errors++;
    }
  }

  const types = schemas.filter(s => !s._parseError).map(s => s['@type']);

  // Check required schemas
  const required = REQUIRED_SCHEMAS[rel];
  if (required) {
    for (const req of required) {
      if (!types.includes(req)) {
        console.error(`\u274C ${rel}: missing required schema @type="${req}"`);
        errors++;
      }
    }
  }

  // Validate common fields
  for (const s of schemas.filter(s => !s._parseError)) {
    if (!s['@context']) {
      console.error(`\u274C ${rel}: ${s['@type']} missing @context`);
      errors++;
    }
    if (s['@type'] === 'BreadcrumbList') {
      if (!s.itemListElement?.length) { console.error(`\u274C ${rel}: BreadcrumbList empty`); errors++; }
    }
  }

  const status = schemas.length > 0 ? `\u2705 ${types.join(', ')}` : '\u26A0\uFE0F  no schemas';
  console.log(`${rel}: ${status}`);
}

console.log(`\n${total} pages checked, ${errors} errors`);
process.exit(errors > 0 ? 1 : 0);
