const { test } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOOK = path.resolve(__dirname, '..', 'hooks/brief-validate-provenance.sh');

function runHook(cwd, command) {
  const input = JSON.stringify({ tool_input: { command } });
  try {
    execSync(`bash ${HOOK}`, {
      cwd,
      input,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exit: 0 };
  } catch (err) {
    return { exit: err.status, stdout: String(err.stdout || '') };
  }
}

function makeRepo(configContent, badContent) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-optin-'));
  execSync('git init --quiet', { cwd: dir });
  execSync('git config user.email test@brief', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  if (configContent !== null) {
    fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.planning', 'config.json'), configContent);
  }
  fs.writeFileSync(path.join(dir, 'bad.md'), badContent);
  execSync('git add .', { cwd: dir });
  return dir;
}

const BAD = '# bad\n- Market size: $5B (untagged)\n';

test('hooks.community: true + untagged claim → blocks (exit 2)', () => {
  const cfg = JSON.stringify({ hooks: { community: true }, brief: { region: 'us' } });
  const repo = makeRepo(cfg, BAD);
  const r = runHook(repo, 'git commit -m "test"');
  assert.equal(r.exit, 2);
});

test('hooks.community: false + untagged claim → passes silently (exit 0)', () => {
  const cfg = JSON.stringify({ hooks: { community: false }, brief: { region: 'us' } });
  const repo = makeRepo(cfg, BAD);
  const r = runHook(repo, 'git commit -m "test"');
  assert.equal(r.exit, 0);
});

test('hooks.community key absent + untagged claim → passes silently (exit 0)', () => {
  const cfg = JSON.stringify({ brief: { region: 'us' } });
  const repo = makeRepo(cfg, BAD);
  const r = runHook(repo, 'git commit -m "test"');
  assert.equal(r.exit, 0);
});

test('no config.json at all + untagged claim → passes silently (exit 0)', () => {
  const repo = makeRepo(null, BAD);
  const r = runHook(repo, 'git commit -m "test"');
  assert.equal(r.exit, 0);
});
