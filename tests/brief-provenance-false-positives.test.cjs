const { test } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOOK = path.resolve(__dirname, '..', 'hooks/brief-validate-provenance.sh');
const REPO_ROOT = path.resolve(__dirname, '..');

function makeRepo(content, opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-fp-'));
  execSync('git init --quiet', { cwd: dir });
  execSync('git config user.email test@brief', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, '.planning', 'config.json'),
    JSON.stringify({ hooks: { community: true }, brief: { region: opts.kr ? 'kr' : 'us' } }),
  );
  fs.writeFileSync(path.join(dir, 'research.md'), content);
  execSync('git add research.md .planning/config.json', { cwd: dir });
  return dir;
}

function runHook(cwd) {
  const input = JSON.stringify({ tool_input: { command: 'git commit -m "test"' } });
  try {
    execSync(`bash ${HOOK}`, {
      cwd,
      input,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exit: 0, stdout: '' };
  } catch (err) {
    return { exit: err.status, stdout: String(err.stdout || '') };
  }
}

function runFixture(fixtureName) {
  const src = fs.readFileSync(
    path.join(REPO_ROOT, 'tests/fixtures/provenance', fixtureName),
    'utf-8',
  );
  const repo = makeRepo(src);
  return runHook(repo);
}

test('false-positive-date.md passes (year mentions are not claims)', () => {
  const r = runFixture('false-positive-date.md');
  assert.equal(r.exit, 0, `false-positive-date.md should pass; got exit ${r.exit}; stdout=${r.stdout}`);
});

test('false-positive-article.md passes (article/section numbers excluded)', () => {
  const r = runFixture('false-positive-article.md');
  assert.equal(r.exit, 0, `false-positive-article.md should pass; got exit ${r.exit}; stdout=${r.stdout}`);
});

test('false-positive-version.md passes (version strings excluded)', () => {
  const r = runFixture('false-positive-version.md');
  assert.equal(r.exit, 0, `false-positive-version.md should pass; got exit ${r.exit}; stdout=${r.stdout}`);
});

test('false-positive-prose-en.md passes (English prose quantifiers excluded)', () => {
  const r = runFixture('false-positive-prose-en.md');
  assert.equal(r.exit, 0, `false-positive-prose-en.md should pass; got exit ${r.exit}; stdout=${r.stdout}`);
});

test('false-positive-prose-ko.md passes (Korean prose quantifiers excluded)', () => {
  const r = runFixture('false-positive-prose-ko.md');
  assert.equal(r.exit, 0, `false-positive-prose-ko.md should pass; got exit ${r.exit}; stdout=${r.stdout}`);
});

test('false-positive-plan-id.md passes (BRIEF plan/task IDs excluded)', () => {
  const r = runFixture('false-positive-plan-id.md');
  assert.equal(r.exit, 0, `false-positive-plan-id.md should pass; got exit ${r.exit}; stdout=${r.stdout}`);
});

test('Allowlisted path (brief/references/compliance/) skips check even with untagged claims', () => {
  const untagged = '# Korea primer\n- Penalty ceiling: 10% of turnover\n- Effective: 2026-09-11';
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-fp-'));
  execSync('git init --quiet', { cwd: dir });
  execSync('git config user.email test@brief', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, '.planning', 'config.json'),
    JSON.stringify({ hooks: { community: true }, brief: { region: 'kr' } }),
  );
  fs.mkdirSync(path.join(dir, 'brief/references/compliance/korea'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'brief/references/compliance/korea/pipa-2026.md'), untagged);
  execSync('git add brief/references/compliance/korea/pipa-2026.md .planning/config.json', {
    cwd: dir,
  });
  const r = runHook(dir);
  assert.equal(r.exit, 0, 'allowlisted path must pass regardless of untagged claims');
});
