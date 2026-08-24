// Build-time only: rasterizes placeholder app icons from an inline SVG.
// Run with: npm run gen:icons
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'static', 'icons');

const flatSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0D6E6E" />
  <text x="256" y="326" font-family="Georgia, serif" font-size="300" font-weight="700" fill="#F6F5F1" text-anchor="middle">L</text>
</svg>`;

// Maskable icons need the visible content inside the safe zone (~40% padding).
const maskableSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0D6E6E" />
  <text x="256" y="300" font-family="Georgia, serif" font-size="200" font-weight="700" fill="#F6F5F1" text-anchor="middle">L</text>
</svg>`;

await mkdir(outDir, { recursive: true });

const targets = [
	{ file: 'icon-192.png', svg: flatSvg(192), size: 192 },
	{ file: 'icon-512.png', svg: flatSvg(512), size: 512 },
	{ file: 'icon-maskable-512.png', svg: maskableSvg(512), size: 512 }
];

for (const t of targets) {
	const png = await sharp(Buffer.from(t.svg)).resize(t.size, t.size).png().toBuffer();
	await writeFile(join(outDir, t.file), png);
	console.log(`wrote ${t.file}`);
}
