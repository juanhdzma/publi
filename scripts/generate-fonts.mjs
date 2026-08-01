/**
 * Genera src/styles/fonts.css quedándose solo con los subsets que un lector en
 * español usa. Correr con `npm run fonts` cuando se actualice fontsource o se
 * cambie una familia.
 *
 * fontsource publica un único CSS por eje con los ocho subsets adentro. El
 * browser baja solo el que necesita gracias a unicode-range, pero los ocho se
 * emiten igual al bundle. Filtrarlos acá los saca del build.
 *
 * El archivo generado se commitea y no se edita a mano: el CI corre este script
 * y falla si el resultado difiere de lo commiteado.
 */
import { readFile, writeFile } from 'node:fs/promises';

const OUTPUT = 'src/styles/fonts.css';

/** Español entra entero en `latin`; `latin-ext` cubre nombres propios. */
const SUBSETS = ['latin', 'latin-ext'];

const SOURCES = [
  { family: 'crimson-pro', axis: 'wght' },
  { family: 'crimson-pro', axis: 'wght-italic' },
  { family: 'inter', axis: 'wght' },
  { family: 'inter', axis: 'wght-italic' },
];

const PACKAGE = (family) => `@fontsource-variable/${family}`;

/** Desde src/styles/ hasta node_modules/. */
const PREFIX = '../../node_modules';

const BLOCK = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;

const blocks = [];

for (const { family, axis } of SOURCES) {
  const path = `node_modules/${PACKAGE(family)}/${axis}.css`;
  const css = await readFile(path, 'utf8');
  const found = new Set();

  for (const [, name, rule] of css.matchAll(BLOCK)) {
    const subset = name.slice(family.length + 1).replace(/-wght-(normal|italic)$/, '');
    if (!SUBSETS.includes(subset)) continue;

    found.add(subset);
    blocks.push(
      `/* ${name} */\n` +
        rule.replace(/url\(\.\/files\//g, `url(${PREFIX}/${PACKAGE(family)}/files/`),
    );
  }

  const missing = SUBSETS.filter((subset) => !found.has(subset));
  if (missing.length > 0) {
    throw new Error(`${path}: no se encontraron los subsets ${missing.join(', ')}`);
  }
}

const header = `/* Generado por scripts/generate-fonts.mjs — no editar a mano.
   Solo los subsets ${SUBSETS.join(' y ')}: ver el script para el porqué. */\n\n`;

await writeFile(OUTPUT, header + blocks.join('\n\n') + '\n');

console.log(`${OUTPUT}  ${blocks.length} @font-face (${SUBSETS.join(', ')})`);
