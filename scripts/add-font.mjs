#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(ROOT, 'public', 'fonts');
const FONTS_CSS = path.join(ROOT, 'src', 'styles', 'fonts.css');

// Modern browser UA to get woff2 from Google Fonts
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function parseArgs() {
  const args = process.argv.slice(2);
  let fontName = null;
  let weights = [400, 600];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--weights' && args[i + 1]) {
      weights = args[i + 1].split(',').map(Number);
      i++;
    } else if (!args[i].startsWith('--')) {
      fontName = args[i];
    }
  }

  if (!fontName) {
    console.error('Usage: node scripts/add-font.mjs \'Font Name\' [--weights 400,600,700]');
    process.exit(1);
  }

  return { fontName, weights };
}

function fontSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

async function fetchGoogleFontsCSS(fontName, weights) {
  const weightStr = weights.join(';');
  const family = fontName.replace(/\s+/g, '+');
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weightStr}&display=swap`;

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Failed to fetch font CSS (${res.status}): ${url}`);
  }
  return res.text();
}

function parseCSS(css) {
  // Extract each @font-face block
  const blocks = [];
  const regex = /\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    const subset = match[1].trim();
    const body = match[2];

    const weightMatch = body.match(/font-weight:\s*(\d+)/);
    const srcMatch = body.match(/src:\s*url\(([^)]+)\)/);
    const unicodeMatch = body.match(/unicode-range:\s*([^;]+)/);
    const familyMatch = body.match(/font-family:\s*'([^']+)'/);
    const styleMatch = body.match(/font-style:\s*(\w+)/);

    if (srcMatch) {
      blocks.push({
        subset,
        fontFamily: familyMatch ? familyMatch[1] : '',
        fontStyle: styleMatch ? styleMatch[1] : 'normal',
        weight: weightMatch ? parseInt(weightMatch[1]) : 400,
        url: srcMatch[1],
        unicodeRange: unicodeMatch ? unicodeMatch[1].trim() : '',
      });
    }
  }

  return blocks;
}

async function downloadFont(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download font: ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

function buildFontFaceCSS(fontFamily, subset, weight, filename, unicodeRange) {
  let css = `/* ${subset} */\n`;
  css += `@font-face {\n`;
  css += `  font-family: '${fontFamily}';\n`;
  css += `  font-style: normal;\n`;
  css += `  font-weight: ${weight};\n`;
  css += `  font-display: swap;\n`;
  css += `  src: url('/fonts/${filename}') format('woff2');\n`;
  if (unicodeRange) {
    css += `  unicode-range: ${unicodeRange};\n`;
  }
  css += `}\n`;
  return css;
}

function fontAlreadyExists(fontFamily) {
  if (!fs.existsSync(FONTS_CSS)) return false;
  const existing = fs.readFileSync(FONTS_CSS, 'utf-8');
  return existing.includes(`font-family: '${fontFamily}'`);
}

async function main() {
  const { fontName, weights } = parseArgs();
  const slug = fontSlug(fontName);

  console.log(`\nAdding font: ${fontName}`);
  console.log(`Weights: ${weights.join(', ')}`);

  // Check for duplicates
  if (fontAlreadyExists(fontName)) {
    console.error(`\n✗ Font '${fontName}' already exists in fonts.css. Skipping.`);
    process.exit(1);
  }

  // Fetch CSS from Google Fonts
  console.log('\nFetching font CSS from Google Fonts...');
  const css = await fetchGoogleFontsCSS(fontName, weights);
  const blocks = parseCSS(css);

  if (blocks.length === 0) {
    console.error('✗ No font faces found. Check the font name.');
    process.exit(1);
  }

  // Ensure fonts directory exists
  fs.mkdirSync(FONTS_DIR, { recursive: true });

  // Download fonts and build CSS
  const declarations = [];
  const downloaded = [];

  for (const block of blocks) {
    const filename = `${slug}-${block.subset.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}-${block.weight}.woff2`;
    const destPath = path.join(FONTS_DIR, filename);

    console.log(`  Downloading ${filename}...`);
    await downloadFont(block.url, destPath);
    downloaded.push(filename);

    const cssBlock = buildFontFaceCSS(
      block.fontFamily,
      block.subset,
      block.weight,
      filename,
      block.unicodeRange
    );
    declarations.push(cssBlock);
  }

  // Append to fonts.css
  const header = `\n/* ${fontName} — self-hosted, added via add-font script */\n\n`;
  const newCSS = header + declarations.join('') ;

  fs.appendFileSync(FONTS_CSS, newCSS);

  // Summary
  console.log(`\n✓ Font '${fontName}' added successfully!`);
  console.log(`  Files downloaded: ${downloaded.length}`);
  downloaded.forEach((f) => console.log(`    public/fonts/${f}`));
  console.log(`  Declarations appended to src/styles/fonts.css`);
  console.log(`\n  Use it in CSS:  font-family: '${fontName}', sans-serif;\n`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
