/**
 * Genera los íconos binarios a partir de public/favicon.svg, que es la fuente
 * de verdad del logo. Correr con `npm run icons` cada vez que cambie el SVG.
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const SOURCE = 'public/favicon.svg';

/** Fondo del propio logo: iOS rellena cualquier transparencia por su cuenta. */
const BACKGROUND = '#FCF9F2';

const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;

const svg = await readFile(SOURCE);

const render = (size) =>
  sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: BACKGROUND })
    .flatten({ background: BACKGROUND })
    .png({ compressionLevel: 9 })
    .toBuffer();

await sharp(await render(APPLE_SIZE)).toFile('public/apple-touch-icon.png');

const ico = await pngToIco(await Promise.all(ICO_SIZES.map(render)));
await writeFile('public/favicon.ico', ico);

console.log(`apple-touch-icon.png  ${APPLE_SIZE}x${APPLE_SIZE}`);
console.log(`favicon.ico           ${ICO_SIZES.join(', ')}`);
