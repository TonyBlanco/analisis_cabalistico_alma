import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..');
const publicDir = path.join(appDir, 'public');
const source = path.join(appDir, 'app', 'icon.svg');

const sizes = [
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
];

const svg = await readFile(source);
await mkdir(publicDir, { recursive: true });

for (const { name, size } of sizes) {
  const buffer = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(path.join(publicDir, name), buffer);
}

await writeFile(path.join(publicDir, 'icon.svg'), svg);
await writeFile(
  path.join(publicDir, 'favicon.ico'),
  await sharp(svg).resize(32, 32).png().toBuffer(),
);

console.log('Generated favicon assets in public/');