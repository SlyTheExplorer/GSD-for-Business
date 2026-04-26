'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TYPE_B_DIR = path.join(ROOT, 'brief/templates/deliver/type-b');
const THEMES_DIR = path.join(ROOT, 'brief/templates/deliver/marp-themes');
const AGENT = path.join(ROOT, 'agents/brief-deliver-type-b.md');

const readSafe = (p) => {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
};

test('templates 1: all 4 Type B template files + 3 Marp CSS theme files exist', () => {
  const templates = ['internal-deck.md', 'proposal-deck.md', 'exec-summary.md', 'decision-memo.md'];
  for (const t of templates) {
    assert.ok(fs.existsSync(path.join(TYPE_B_DIR, t)), `missing template: ${t}`);
  }
  for (const th of ['default.css', 'partner.css', 'confidential.css']) {
    assert.ok(fs.existsSync(path.join(THEMES_DIR, th)), `missing theme: ${th}`);
  }
});

test('templates 2: internal-deck.md frontmatter has marp:true + theme:default + paginate:true + footer (literal or watermark placeholder)', () => {
  const body = readSafe(path.join(TYPE_B_DIR, 'internal-deck.md'));
  assert.match(body, /marp:\s*true/, 'missing marp: true');
  assert.match(body, /theme:\s*default/, 'missing theme: default');
  assert.match(body, /paginate:\s*true/, 'missing paginate: true');
  assert.match(body, /footer:\s*['"]?(\{\{watermark_text\}\}|CONFIDENTIAL)/, 'missing footer (watermark or literal)');
});

test('templates 3: internal-deck.md Cover slide has literal watermark content (not only Marp footer directive)', () => {
  const body = readSafe(path.join(TYPE_B_DIR, 'internal-deck.md'));
  assert.match(body, />\s*\*\*\{\{watermark_text\}\}\*\*/, 'Cover slide missing literal watermark > **{{watermark_text}}**');
});

test('templates 4: internal-deck.md has 7-9 slide separators (^---$ between slides)', () => {
  const body = readSafe(path.join(TYPE_B_DIR, 'internal-deck.md'));
  const seps = body.split('\n').filter(l => l.trim() === '---').length;
  assert.ok(seps >= 7, `expected >=7 ^---$ separators (frontmatter + slide breaks), got ${seps}`);
});

test('templates 5: proposal-deck.md frontmatter has theme:partner + footer (placeholder or partner watermark)', () => {
  const body = readSafe(path.join(TYPE_B_DIR, 'proposal-deck.md'));
  assert.match(body, /theme:\s*partner/, 'missing theme: partner');
  assert.match(body, /footer:\s*['"]?(\{\{watermark_text\}\}|Partner-only)/, 'missing footer');
});

test('templates 6: proposal-deck.md has Traction slide (NOT Strategy)', () => {
  const body = readSafe(path.join(TYPE_B_DIR, 'proposal-deck.md'));
  assert.match(body, /^## Traction/m, 'missing ## Traction slide');
  assert.doesNotMatch(body, /^## Strategy/m, 'must NOT have ## Strategy slide (partner-safe)');
});

test('templates 7: exec-summary.md has NO Marp + 5 sections (Context/Problem/Recommendation/Risks/Ask)', () => {
  const body = readSafe(path.join(TYPE_B_DIR, 'exec-summary.md'));
  assert.doesNotMatch(body, /^marp:\s*true/m, 'exec-summary.md must NOT have marp: true (markdown only)');
  for (const s of ['Context', 'Problem', 'Recommendation', 'Risks', 'Ask']) {
    assert.match(body, new RegExp(`^## ${s}$`, 'm'), `missing ## ${s}`);
  }
});

test('templates 8: decision-memo.md has NO Marp + 4 ADR sections', () => {
  const body = readSafe(path.join(TYPE_B_DIR, 'decision-memo.md'));
  assert.doesNotMatch(body, /^marp:\s*true/m, 'decision-memo.md must NOT have marp: true');
  for (const s of ['Context', 'Decision', 'Alternatives Considered', 'Consequences']) {
    assert.match(body, new RegExp(`^## ${s}$`, 'm'), `missing ## ${s}`);
  }
});

test('templates 9: all 4 Type B templates have 5 mandatory frontmatter fields + voice.languages', () => {
  const mandatory = ['audience.type', 'audience.confidentiality', 'voice.tone', 'voice.perspective', 'business_context.model', 'voice.languages'];
  for (const t of ['internal-deck.md', 'proposal-deck.md', 'exec-summary.md', 'decision-memo.md']) {
    const body = readSafe(path.join(TYPE_B_DIR, t));
    for (const field of mandatory) {
      assert.match(body, new RegExp(`${field.replace(/\./g, '\\.')}:`), `${t} missing ${field}`);
    }
  }
});

test('templates 10: 3 Marp CSS themes have section { declarations + brand color comment', () => {
  for (const th of ['default.css', 'partner.css', 'confidential.css']) {
    const body = readSafe(path.join(THEMES_DIR, th));
    assert.match(body, /section\s*\{/, `${th} missing section { declaration`);
    assert.match(body, /brief-(primary|accent|warning)/, `${th} missing --brief-* brand variable`);
  }
});

test('templates 11: agents/brief-deliver-type-b.md has name + tools (no Bash) + color', () => {
  const body = readSafe(AGENT);
  assert.match(body, /name:\s*brief-deliver-type-b/, 'missing name: brief-deliver-type-b');
  assert.match(body, /tools:\s*Read,\s*Grep,\s*Glob,\s*Write/, 'tools must be Read, Grep, Glob, Write (NO Bash)');
  assert.doesNotMatch(body, /tools:.*Bash/, 'tools must NOT include Bash (agent does not invoke Marp directly)');
  assert.match(body, /color:\s*green/, 'missing color: green');
});

test('templates 12: agent body embeds <banned_vocabulary> with all 16 EN + all 8 KO words', () => {
  const body = readSafe(AGENT);
  const en = ['leverage', 'synergize', 'transform', 'holistic', 'delve', 'groundbreaking',
              'best-in-class', 'seamless', 'cutting-edge', 'revolutionary', 'game-changing',
              'landscape', 'unlock', 'empower', 'robust', 'innovative'];
  const ko = ['혁신적인', '차별화된', '게임체인저', '패러다임 시프트', '시너지', '활용', '최적화', '글로벌 스탠더드'];
  assert.match(body, /<banned_vocabulary>/, 'missing <banned_vocabulary> opening tag');
  for (const w of en) {
    assert.ok(body.includes(w), `agent missing EN banned word: ${w}`);
  }
  for (const w of ko) {
    assert.ok(body.includes(w), `agent missing KO banned word: ${w}`);
  }
});

test('templates 13: agent body embeds <concreteness_rule> with "compared to what" rule', () => {
  const body = readSafe(AGENT);
  assert.match(body, /<concreteness_rule>/, 'missing <concreteness_rule> tag');
  assert.match(body, /compared to what.*by how much.*when/i, 'missing "compared to what / by how much / when" rule');
});

test('templates 14: agent body embeds <korean_honorific_rule> with 5 endings + conditional firing', () => {
  const body = readSafe(AGENT);
  assert.match(body, /<korean_honorific_rule>/, 'missing <korean_honorific_rule> tag');
  for (const ending of ['-야', '-지', '-라구요', '-거든요', '-는데요']) {
    assert.ok(body.includes(ending), `missing 반말 ending: ${ending}`);
  }
  assert.match(body, /partner.*public.*external|external.*partner/i, 'missing audience external conditional firing');
});

test('templates 15: agent body has 4 hand-written exemplar H3 headings (INVESTOR-IR / EXEC-SUMMARY / DECISION-MEMO / Korean)', () => {
  const body = readSafe(AGENT);
  const matches = body.match(/^### (INVESTOR-IR|EXEC-SUMMARY|DECISION-MEMO|Korean)/gm) || [];
  assert.equal(matches.length, 4, `expected 4 H3 exemplar headings, got ${matches.length}`);
});
