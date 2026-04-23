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
  fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, '.planning', 'config.json'),
    JSON.stringify({ hooks: { community: true }, brief: { region: opts.kr ? 'kr' : 'us' } }),
  );
  fs.writeFileSync(path.join(dir, fixtureFilename), fixtureContent);
  execSync(`git add ${fixtureFilename} .planning/config.json`, { cwd: dir });
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

test('invalid-untagged-currency.md blocks with exit 2', () => {
  const src = fs.readFileSync(
    path.join(REPO_ROOT, 'tests/fixtures/provenance/invalid-untagged-currency.md'),
    'utf-8',
  );
  const repo = makeRepo('research.md', src);
  const r = runHook(repo);
  assert.equal(r.exit, 2);
  assert.match(r.stdout, /"decision":\s*"block"/);
  assert.match(r.stdout, /provenance|tag/i);
});

test('invalid-untagged-percent.md blocks', () => {
  const src = fs.readFileSync(
    path.join(REPO_ROOT, 'tests/fixtures/provenance/invalid-untagged-percent.md'),
    'utf-8',
  );
  const repo = makeRepo('research.md', src);
  const r = runHook(repo);
  assert.equal(r.exit, 2);
});

test('invalid-untagged-korean.md blocks with Korean error when region=kr', () => {
  const src = fs.readFileSync(
    path.join(REPO_ROOT, 'tests/fixtures/provenance/invalid-untagged-korean.md'),
    'utf-8',
  );
  const repo = makeRepo('research.md', src, { kr: true });
  const r = runHook(repo);
  assert.equal(r.exit, 2);
  // Korean error message token
  assert.match(r.stdout, /커밋이 차단|출처 태그/);
});

test('edge-malformed-tag.md blocks (VERIFIED without date fails DSC-07)', () => {
  const src = fs.readFileSync(
    path.join(REPO_ROOT, 'tests/fixtures/provenance/edge-malformed-tag.md'),
    'utf-8',
  );
  const repo = makeRepo('research.md', src);
  const r = runHook(repo);
  assert.equal(r.exit, 2);
});
