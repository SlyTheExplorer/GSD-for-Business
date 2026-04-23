const { test } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOOK = path.resolve(__dirname, '..', 'hooks/brief-validate-provenance.sh');
const REPO_ROOT = path.resolve(__dirname, '..');

function makeRepo(fixtureFilename, fixtureContent, opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-prov-'));
  execSync('git init --quiet', { cwd: dir });
  execSync('git config user.email test@brief', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  // Seed .planning/config.json with hooks.community: true unless opted out
  if (opts.optedIn !== false) {
    fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, '.planning', 'config.json'),
      JSON.stringify({ hooks: { community: true }, brief: { region: opts.kr ? 'kr' : 'us' } }),
    );
  }
  fs.writeFileSync(path.join(dir, fixtureFilename), fixtureContent);
  execSync(`git add ${fixtureFilename}`, { cwd: dir });
  if (opts.optedIn !== false) execSync('git add .planning/config.json', { cwd: dir });
  return dir;
}

function runHook(cwd) {
  const input = JSON.stringify({ tool_input: { command: 'git commit -m "test"' } });
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

test('valid-en.md passes (all quantitative claims tagged)', () => {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'tests/fixtures/provenance/valid-en.md'), 'utf-8');
  const repo = makeRepo('research.md', src);
  const r = runHook(repo);
  assert.equal(r.exit, 0, `expected exit 0, got ${r.exit}; stdout=${r.stdout}`);
});

test('valid-ko.md passes (Korean quantitative claims tagged)', () => {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'tests/fixtures/provenance/valid-ko.md'), 'utf-8');
  const repo = makeRepo('research.md', src, { kr: true });
  const r = runHook(repo);
  assert.equal(r.exit, 0, `expected exit 0, got ${r.exit}; stdout=${r.stdout}`);
});

test('valid-mixed-proximity.md passes (tags ±1 line away)', () => {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'tests/fixtures/provenance/valid-mixed-proximity.md'), 'utf-8');
  const repo = makeRepo('research.md', src);
  const r = runHook(repo);
  assert.equal(r.exit, 0, `expected exit 0, got ${r.exit}; stdout=${r.stdout}`);
});
