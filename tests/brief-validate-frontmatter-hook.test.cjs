// Wave 0 RED→GREEN tests for CC-03 hook (brief-validate-frontmatter.sh)
//   + bin/install.js 4-anchor registration
//   + scripts/build-hooks.js HOOKS_TO_COPY entry
//
// Mirrors tests/brief-provenance-hook.test.cjs harness shape (byte-identity
// inheritance — Phase 5 D-06).
//
// Plan: 08-07. RED gate: hook + install.js mods do not exist yet.

const { test } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOOK = path.resolve(__dirname, '..', 'hooks/brief-validate-frontmatter.sh');
const INSTALL_JS = path.resolve(__dirname, '..', 'bin/install.js');
const BUILD_HOOKS_JS = path.resolve(__dirname, '..', 'scripts/build-hooks.js');

function setupRepo(hooksCommunityOptIn, region) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-frontmatter-hook-'));
  execSync('git init --quiet', { cwd: dir });
  execSync('git config user.email test@brief', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  // Initial commit so `git diff --cached` works against HEAD
  fs.writeFileSync(path.join(dir, 'README.md'), '# init\n');
  execSync('git add README.md', { cwd: dir });
  execSync('git commit --quiet --no-verify -m init', { cwd: dir });

  if (hooksCommunityOptIn !== null) {
    fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
    const cfg = { hooks: { community: hooksCommunityOptIn } };
    if (region !== undefined && region !== null) {
      cfg.brief = { region };
    }
    fs.writeFileSync(
      path.join(dir, '.planning', 'config.json'),
      JSON.stringify(cfg),
    );
  }
  return dir;
}

function runHookWithCmd(cwd, command) {
  const input = JSON.stringify({ tool_input: { command } });
  // Gate: if hook file is missing (RED state), spawn returns ENOENT non-zero exit.
  // Wrap so Tests 1-8 fail predictably during RED.
  if (!fs.existsSync(HOOK)) {
    return { exit: 127, stdout: '', stderr: 'HOOK_MISSING' };
  }
  try {
    const out = execSync(`bash ${HOOK}`, {
      cwd,
      input,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exit: 0, stdout: out, stderr: '' };
  } catch (err) {
    return { exit: err.status, stdout: String(err.stdout || ''), stderr: String(err.stderr || '') };
  }
}

// ---------------------------------------------------------------------------
// Test 1: opt-in gate — hook exits 0 (silent no-op) when config absent
// ---------------------------------------------------------------------------
test('Test 1: hook silent no-op when .planning/config.json missing', () => {
  const repo = setupRepo(null, undefined); // no config.json at all
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 0, 'expected exit 0 when config.json missing');
});

// ---------------------------------------------------------------------------
// Test 1b: opt-in gate — hook exits 0 when hooks.community: false
// ---------------------------------------------------------------------------
test('Test 1b: hook silent no-op when hooks.community: false', () => {
  const repo = setupRepo(false, 'us');
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 0, 'expected exit 0 when hooks.community: false');
});

// ---------------------------------------------------------------------------
// Test 2: git commit filter — hook exits 0 for non-git-commit commands
// ---------------------------------------------------------------------------
test('Test 2: hook exits 0 for non-git-commit commands (git status, npm test)', () => {
  const repo = setupRepo(true, 'us');
  const r1 = runHookWithCmd(repo, 'git status');
  const r2 = runHookWithCmd(repo, 'npm test');
  const r3 = runHookWithCmd(repo, 'ls');
  assert.equal(r1.exit, 0, 'git status should pass');
  assert.equal(r2.exit, 0, 'npm test should pass');
  assert.equal(r3.exit, 0, 'ls should pass');
});

// ---------------------------------------------------------------------------
// Test 3: empty staging — hook exits 0 when no staged .planning/**/*.md files
// ---------------------------------------------------------------------------
test('Test 3: hook exits 0 with empty staging area', () => {
  const repo = setupRepo(true, 'us');
  const r = runHookWithCmd(repo, 'git commit -m empty');
  assert.equal(r.exit, 0, 'expected exit 0 with empty staging area');
});

// ---------------------------------------------------------------------------
// Test 4: missing-field block — exit 2 with JSON containing path + missing field
// ---------------------------------------------------------------------------
test('Test 4: missing audience.type → block with file path + missing field name', () => {
  const repo = setupRepo(true, 'us');
  const f = path.join(repo, '.planning', 'deliverables', 'type-b');
  fs.mkdirSync(f, { recursive: true });
  // Frontmatter missing audience.type
  const content = `---
audience:
  confidentiality: partner
voice:
  tone: formal
  perspective: first-person-plural
business_context:
  model: b2c
---

# Proposal Deck
`;
  fs.writeFileSync(path.join(f, 'proposal-deck.md'), content);
  execSync('git add .planning/deliverables/type-b/proposal-deck.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 2, `expected exit 2, got ${r.exit}; stdout=${r.stdout} stderr=${r.stderr}`);
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.decision, 'block');
  assert.match(parsed.reason, /proposal-deck\.md/, 'reason should contain file path');
  assert.match(parsed.reason, /audience\.type/, 'reason should mention missing field audience.type');
});

// ---------------------------------------------------------------------------
// Test 5a: nested form — all 5 fields present → exit 0
// ---------------------------------------------------------------------------
test('Test 5a: nested form with all 5 fields present passes (exit 0)', () => {
  const repo = setupRepo(true, 'us');
  const dir = path.join(repo, '.planning', 'deliverables', 'type-b');
  fs.mkdirSync(dir, { recursive: true });
  const content = `---
audience:
  type: external
  confidentiality: partner
voice:
  tone: formal
  perspective: first-person-plural
business_context:
  model: b2c
---

# OK
`;
  fs.writeFileSync(path.join(dir, 'ok-nested.md'), content);
  execSync('git add .planning/deliverables/type-b/ok-nested.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 0, `expected exit 0 (nested all fields present); stdout=${r.stdout}`);
});

// ---------------------------------------------------------------------------
// Test 5b: flat-dotted form — all 5 fields present → exit 0
// ---------------------------------------------------------------------------
test('Test 5b: flat-dotted form with all 5 fields present passes (exit 0)', () => {
  const repo = setupRepo(true, 'us');
  const dir = path.join(repo, '.planning', 'deliverables', 'type-b');
  fs.mkdirSync(dir, { recursive: true });
  const content = `---
audience.type: external
audience.confidentiality: partner
voice.tone: formal
voice.perspective: first-person-plural
business_context.model: b2c
---

# OK
`;
  fs.writeFileSync(path.join(dir, 'ok-flat.md'), content);
  execSync('git add .planning/deliverables/type-b/ok-flat.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 0, `expected exit 0 (flat-dotted all fields present); stdout=${r.stdout}`);
});

// ---------------------------------------------------------------------------
// Test 6: Korean error variant when region: kr
// ---------------------------------------------------------------------------
test('Test 6: Korean block reason when brief.region=kr', () => {
  const repo = setupRepo(true, 'kr');
  const dir = path.join(repo, '.planning', 'deliverables', 'type-b');
  fs.mkdirSync(dir, { recursive: true });
  const content = `---
audience:
  type: external
voice:
  tone: formal
---

# Missing fields
`;
  fs.writeFileSync(path.join(dir, 'missing-kr.md'), content);
  execSync('git add .planning/deliverables/type-b/missing-kr.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 2);
  const parsed = JSON.parse(r.stdout);
  assert.match(parsed.reason, /필수 frontmatter 항목 누락/, 'Korean reason expected');
});

test('Test 6b: English block reason when region != kr', () => {
  const repo = setupRepo(true, 'us');
  const dir = path.join(repo, '.planning', 'deliverables', 'type-b');
  fs.mkdirSync(dir, { recursive: true });
  const content = `---
audience:
  type: external
---

# Missing fields
`;
  fs.writeFileSync(path.join(dir, 'missing-en.md'), content);
  execSync('git add .planning/deliverables/type-b/missing-en.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 2);
  const parsed = JSON.parse(r.stdout);
  assert.match(parsed.reason, /Commit blocked: \.planning\/ artifact frontmatter missing mandatory fields/);
});

// ---------------------------------------------------------------------------
// Test 7: NO_FRONTMATTER case — file with no `---/---` block at top
// ---------------------------------------------------------------------------
test('Test 7a: NO_FRONTMATTER (no --- block) → Korean message in kr region', () => {
  const repo = setupRepo(true, 'kr');
  const dir = path.join(repo, '.planning', 'deliverables');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'no-frontmatter.md'), '# Nothing here\n\nbody only\n');
  execSync('git add .planning/deliverables/no-frontmatter.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 2);
  const parsed = JSON.parse(r.stdout);
  assert.match(parsed.reason, /첫 줄에 frontmatter \(---\/---\) 가 없습니다/);
});

test('Test 7b: NO_FRONTMATTER → English message when region != kr', () => {
  const repo = setupRepo(true, 'us');
  const dir = path.join(repo, '.planning', 'deliverables');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'no-frontmatter-en.md'), '# Nothing here\n\nbody only\n');
  execSync('git add .planning/deliverables/no-frontmatter-en.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 2);
  const parsed = JSON.parse(r.stdout);
  assert.match(parsed.reason, /no frontmatter block/);
});

// ---------------------------------------------------------------------------
// Test 8: hook ignores non-.md files in .planning/ (e.g., config.json itself)
// ---------------------------------------------------------------------------
test('Test 8: hook ignores non-.md files in .planning/', () => {
  const repo = setupRepo(true, 'us');
  // Stage only config.json (already a .json, not .md)
  const newCfg = path.join(repo, '.planning', 'extra.json');
  fs.writeFileSync(newCfg, '{"foo": "bar"}');
  execSync('git add .planning/extra.json .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m test');
  assert.equal(r.exit, 0, 'non-.md files should not be validated');
});

// ---------------------------------------------------------------------------
// Test 9: bin/install.js registers brief-validate-frontmatter.sh in briefHooks array
// ---------------------------------------------------------------------------
test('Test 9: bin/install.js briefHooks array includes brief-validate-frontmatter.sh', () => {
  const installJs = fs.readFileSync(INSTALL_JS, 'utf-8');
  // briefHooks array starts at line 4762 — match the array literal
  const arrayMatch = installJs.match(/const briefHooks = \[[^\]]+\];/);
  assert.ok(arrayMatch, 'briefHooks array literal not found in bin/install.js');
  assert.match(
    arrayMatch[0],
    /'brief-validate-frontmatter\.sh'/,
    'briefHooks array should include brief-validate-frontmatter.sh',
  );
  // Also verify expectedShHooks contains it
  const expectedMatch = installJs.match(/const expectedShHooks = \[[^\]]+\];/);
  assert.ok(expectedMatch, 'expectedShHooks array literal not found');
  assert.match(
    expectedMatch[0],
    /'brief-validate-frontmatter\.sh'/,
    'expectedShHooks array should include brief-validate-frontmatter.sh',
  );
  // Verify a register block exists
  assert.match(
    installJs,
    /Configured frontmatter validation hook/,
    'install.js should contain the new install block log message',
  );
  // Verify uninstall chain mentions brief-validate-frontmatter
  assert.match(
    installJs,
    /brief-validate-frontmatter|gsd-validate-frontmatter/,
    'install.js uninstall chain should reference brief-validate-frontmatter',
  );
});

// ---------------------------------------------------------------------------
// Test 10: scripts/build-hooks.js HOOKS_TO_COPY array contains entry
// ---------------------------------------------------------------------------
test('Test 10: scripts/build-hooks.js HOOKS_TO_COPY contains brief-validate-frontmatter.sh', () => {
  const buildHooks = fs.readFileSync(BUILD_HOOKS_JS, 'utf-8');
  const arrayMatch = buildHooks.match(/const HOOKS_TO_COPY = \[[\s\S]+?\];/);
  assert.ok(arrayMatch, 'HOOKS_TO_COPY array not found in scripts/build-hooks.js');
  assert.match(
    arrayMatch[0],
    /'brief-validate-frontmatter\.sh'/,
    'HOOKS_TO_COPY should include brief-validate-frontmatter.sh',
  );
});
