const { test } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOOK = path.resolve(__dirname, '..', 'hooks/brief-validate-provenance.sh');

function setupRepo(hooksCommunityOptIn, region) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-hookint-'));
  execSync('git init --quiet', { cwd: dir });
  execSync('git config user.email test@brief', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  if (hooksCommunityOptIn !== null) {
    fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, '.planning', 'config.json'),
      JSON.stringify({ hooks: { community: hooksCommunityOptIn }, brief: { region } }),
    );
  }
  return dir;
}

function runHookWithCmd(cwd, command) {
  const input = JSON.stringify({ tool_input: { command } });
  try {
    const out = execSync(`bash ${HOOK}`, {
      cwd,
      input,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exit: 0, stdout: out };
  } catch (err) {
    return { exit: err.status, stdout: String(err.stdout || '') };
  }
}

test('Non-git-commit command passes through (exit 0)', () => {
  const repo = setupRepo(true, 'us');
  const r = runHookWithCmd(repo, 'git status');
  assert.equal(r.exit, 0);
});

test('git commit with no staged files exits 0', () => {
  const repo = setupRepo(true, 'us');
  const r = runHookWithCmd(repo, 'git commit -m "empty"');
  assert.equal(r.exit, 0);
});

test('Block response is valid JSON with decision:block and reason', () => {
  const repo = setupRepo(true, 'us');
  fs.writeFileSync(path.join(repo, 'bad.md'), '# bad\n\n- Market: $5B untagged claim.\n');
  execSync('git add bad.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m "test"');
  assert.equal(r.exit, 2);
  // stdout contains {"decision":"block","reason":"..."}
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.decision, 'block');
  assert.equal(typeof parsed.reason, 'string');
  assert.ok(parsed.reason.length > 20);
});

test('Korean error body when brief.region=kr', () => {
  const repo = setupRepo(true, 'kr');
  fs.writeFileSync(path.join(repo, 'bad.md'), '# bad\n\n- 시장 규모 ₩5조\n');
  execSync('git add bad.md .planning/config.json', { cwd: repo });
  const r = runHookWithCmd(repo, 'git commit -m "test"');
  assert.equal(r.exit, 2);
  const parsed = JSON.parse(r.stdout);
  assert.match(parsed.reason, /커밋이 차단|출처 태그/);
});
