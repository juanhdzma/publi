import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveAttribution } from './attribution.ts';

test('absent source inherits the entry author', () => {
  assert.equal(resolveAttribution(undefined, 'Marco Aurelio', 'Desconocido'), 'Marco Aurelio');
});

test('named source wins over the entry author', () => {
  assert.equal(resolveAttribution('Will Durant', 'Marco Aurelio', 'Desconocido'), 'Will Durant');
});

test('null source is the unknown author', () => {
  assert.equal(resolveAttribution(null, 'Marco Aurelio', 'Desconocido'), 'Desconocido');
});
