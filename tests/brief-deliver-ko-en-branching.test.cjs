'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TYPE_B_DIR = path.join(ROOT, 'brief/templates/deliver/type-b');

const FIXTURE_DIR = path.join(ROOT, 'tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams');

let deliver;
try { deliver = require(path.join(ROOT, 'brief/bin/lib/deliver.cjs')); } catch { deliver = null; }

const readJSON = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
};

const writeJSON = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2));

test('ko/en 1: synthesizeTypeA on Korea fixture (region: kr) produces voice.languages: [ko] in frontmatter (no en sibling)', async () => {
  assert.ok(deliver, 'deliver.cjs not loadable — Plan 01 must ship first');
  assert.ok(typeof deliver.synthesizeTypeA === 'function', 'synthesizeTypeA function missing');
  const out = path.join('/tmp', `bdo-${Date.now()}-product-brief.md`);
  await deliver.synthesizeTypeA({
    artifact: 'product-brief',
    fixtureDir: FIXTURE_DIR,
    outPath: out,
    options: {},
  });
  const body = fs.readFileSync(out, 'utf8');
  assert.match(body, /voice\.languages:\s*\[?ko\]?/, `expected voice.languages contains 'ko' for region: kr; got body excerpt:\n${body.slice(0, 800)}`);
  assert.doesNotMatch(body, /voice\.languages:\s*\[ko,\s*en\]/, 'must NOT contain en when --en flag absent');
  fs.unlinkSync(out);
});

test('ko/en 2: synthesizeTypeA with options.en=true produces voice.languages: [ko, en]', async () => {
  assert.ok(deliver, 'deliver.cjs not loadable');
  const out = path.join('/tmp', `bdo-${Date.now()}-product-brief-en.md`);
  await deliver.synthesizeTypeA({
    artifact: 'product-brief',
    fixtureDir: FIXTURE_DIR,
    outPath: out,
    options: { en: true },
  });
  const body = fs.readFileSync(out, 'utf8');
  assert.match(body, /voice\.languages:\s*\[ko,\s*en\]/, 'expected voice.languages: [ko, en] when options.en=true');
  fs.unlinkSync(out);
});

test('ko/en 3: synthesizeTypeA with config.brief.region=us produces voice.languages: [en] (no ko)', async () => {
  assert.ok(deliver, 'deliver.cjs not loadable');
  const cfgPath = path.join(FIXTURE_DIR, 'config.json');
  const original = readJSON(cfgPath);
  assert.ok(original, 'fixture config.json missing');
  const mutated = JSON.parse(JSON.stringify(original));
  if (!mutated.brief) mutated.brief = {};
  mutated.brief.region = 'us';
  writeJSON(cfgPath, mutated);
  try {
    const out = path.join('/tmp', `bdo-${Date.now()}-us.md`);
    await deliver.synthesizeTypeA({
      artifact: 'product-brief',
      fixtureDir: FIXTURE_DIR,
      outPath: out,
      options: {},
    });
    const body = fs.readFileSync(out, 'utf8');
    assert.match(body, /voice\.languages:\s*\[?en\]?/, `expected voice.languages contains en for region: us; got:\n${body.slice(0, 600)}`);
    fs.unlinkSync(out);
  } finally {
    writeJSON(cfgPath, original);
  }
});

test('ko/en 4: Type B template (proposal-deck.md) supports voice.languages frontmatter placeholder', () => {
  const body = fs.readFileSync(path.join(TYPE_B_DIR, 'proposal-deck.md'), 'utf8');
  assert.match(body, /voice\.languages:\s*\{\{languages\}\}/, 'proposal-deck.md missing voice.languages: {{languages}} placeholder');
});
