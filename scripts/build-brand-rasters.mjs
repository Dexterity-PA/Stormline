// Regenerate raster brand assets from the SVG sources in /public/brand.
//
// Usage (sharp + png-to-ico are not project deps; install them transiently):
//   mkdir -p /tmp/sl-brand && cd /tmp/sl-brand && npm init -y >/dev/null \
//     && npm i sharp png-to-ico >/dev/null
//   NODE_PATH=/tmp/sl-brand/node_modules node scripts/build-brand-rasters.mjs
//
// Writes: favicon.ico (16/32/48), icon-192.png, icon-512.png,
// apple-touch-icon.png (180), og-image.png (1200x630).

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = join(root, 'public', 'brand');

async function renderPng(svg, size, outName) {
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await writeFile(join(brandDir, outName), buf);
  console.log(`wrote ${outName} (${size}×${size})`);
  return buf;
}

const iconSvg = await readFile(join(brandDir, 'icon.svg'));

const png16 = await renderPng(iconSvg, 16, 'icon-16.png');
const png32 = await renderPng(iconSvg, 32, 'icon-32.png');
const png48 = await renderPng(iconSvg, 48, 'icon-48.png');
await renderPng(iconSvg, 180, 'apple-touch-icon.png');
await renderPng(iconSvg, 192, 'icon-192.png');
await renderPng(iconSvg, 512, 'icon-512.png');

const ico = await pngToIco([png16, png32, png48]);
await writeFile(join(brandDir, 'favicon.ico'), ico);
console.log('wrote favicon.ico (16,32,48)');

// OG image — 1200×630, dark bg, wordmark top-left, tagline bottom-left,
// accent rule pinned at bottom. The wordmark is rasterized from logo.svg first
// (fallback-font letter widths only stay aligned at its natural 52px/360×72
// geometry), then composited onto a background that carries the tagline + URL.
const logoSvg = await readFile(join(brandDir, 'logo.svg'));
const wordmarkW = 560;
const wordmarkH = 112;
const wordmarkPng = await sharp(logoSvg, { density: 480 })
  .resize(wordmarkW, wordmarkH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const ogBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <style>
    .tag { font-family: "Inter Tight","Inter",system-ui,-apple-system,"Segoe UI",sans-serif; font-weight: 600; letter-spacing: -0.02em; font-size: 60px; fill: #e8ecf1; }
    .tag-accent { fill: #4ea8ff; }
    .url { font-family: "JetBrains Mono",ui-monospace,monospace; font-size: 20px; letter-spacing: 3px; fill: #8a94a3; }
  </style>
  <rect width="1200" height="630" fill="#0a0e13"/>
  <text x="80" y="470" class="tag">Macro intelligence for <tspan class="tag-accent">main street.</tspan></text>
  <text x="80" y="525" class="url">STORMLINE.COM</text>
  <rect x="80" y="585" width="1040" height="3" fill="#4ea8ff"/>
</svg>`;

const ogBuf = await sharp(Buffer.from(ogBgSvg))
  .composite([{ input: wordmarkPng, left: 80, top: 90 }])
  .png()
  .toBuffer();
await writeFile(join(brandDir, 'og-image.png'), ogBuf);
console.log('wrote og-image.png (1200×630)');
