/**
 * GSD Tools Test Helpers
 */

const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.join(__dirname, '..', 'brief', 'bin', 'brief-tools.cjs');
const TEST_ENV_BASE = {
  GSD_SESSION_KEY: '',
  CODEX_THREAD_ID: '',
  CLAUDE_SESSION_ID: '',
  CLAUDE_CODE_SSE_PORT: '',
  OPENCODE_SESSION_ID: '',
  GEMINI_SESSION_ID: '',
  CURSOR_SESSION_ID: '',
  WINDSURF_SESSION_ID: '',
  TERM_SESSION_ID: '',
  WT_SESSION: '',
  TMUX_PANE: '',
  ZELLIJ_SESSION_NAME: '',
  TTY: '',
  SSH_TTY: '',
};

/**
 * Run brief-tools command.
 *
 * @param {string|string[]} args - Command string (shell-interpreted) or array
 *   of arguments (shell-bypassed via execFileSync, safe for JSON and dollar signs).
 * @param {string} cwd - Working directory.
 * @param {object} [env] - Optional env overrides merged on top of process.env.
 *   Pass { HOME: cwd } to sandbox ~/.gsd/ lookups in tests that assert concrete
 *   config values that could be overridden by a developer's defaults.json.
 */
function runGsdTools(args, cwd = process.cwd(), env = {}) {
  try {
    let result;
    const childEnv = { ...process.env, ...TEST_ENV_BASE, ...env };
    if (Array.isArray(args)) {
      result = execFileSync(process.execPath, [TOOLS_PATH, ...args], {
        cwd,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: childEnv,
      });
    } else {
      // Split shell-style string into argv, stripping surrounding quotes, so we
      // can invoke execFileSync with process.execPath instead of relying on
      // `node` being on PATH (it isn't in Claude Code shell sessions).
      // Apply shell-style quote removal: strip surrounding quotes from quoted
      // sequences anywhere in a token (handles both "foo bar" and --"foo bar").
      const argv = (args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [])
        .map(t => t.replace(/"([^"]*)"/g, '$1').replace(/'([^']*)'/g, '$1'));
      result = execFileSync(process.execPath, [TOOLS_PATH, ...argv], {
        cwd,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: childEnv,
      });
    }
    return { success: true, output: result.trim() };
  } catch (err) {
    return {
      success: false,
      output: err.stdout?.toString().trim() || '',
      error: err.stderr?.toString().trim() || err.message,
    };
  }
}

// Create a bare temp directory (no .planning/ structure)
function createTempDir(prefix = 'gsd-test-') {
  return fs.mkdtempSync(path.join(require('os').tmpdir(), prefix));
}

// Create temp directory structure
function createTempProject(prefix = 'gsd-test-') {
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), prefix));
  fs.mkdirSync(path.join(tmpDir, '.planning', 'phases'), { recursive: true });
  return tmpDir;
}

// Create temp directory with initialized git repo and at least one commit
function createTempGitProject(prefix = 'gsd-test-') {
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), prefix));
  fs.mkdirSync(path.join(tmpDir, '.planning', 'phases'), { recursive: true });

  execSync('git init', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git config user.email "test@test.com"', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git config user.name "Test"', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git config commit.gpgsign false', { cwd: tmpDir, stdio: 'pipe' });

  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'PROJECT.md'),
    '# Project\n\nTest project.\n'
  );

  execSync('git add -A', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git commit -m "initial commit"', { cwd: tmpDir, stdio: 'pipe' });

  return tmpDir;
}

function cleanup(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// Baseline .planning/config.json seed for Phase 3 Plan 04 tests.
// Centralizing this avoids duplication across every beforeEach AND keeps the
// shape consistent across positive and negative test cases so that assertions
// on cfg.model_profile / cfg.workflow / cfg.mode / cfg.granularity do not
// false-red on empty temp dirs (B-2).
const BRIEF_BASELINE_CONFIG = {
  model_profile: 'quality',
  commit_docs: true,
  workflow: {
    nyquist_validation: true,
    text_mode: false,
  },
  mode: 'interactive',
  granularity: 'fine',
};

function createTempProjectWithConfig(prefix = 'gsd-test-') {
  const tmpDir = createTempProject(prefix);
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'config.json'),
    JSON.stringify(BRIEF_BASELINE_CONFIG, null, 2) + '\n',
    'utf-8',
  );
  return tmpDir;
}

function createTempGitProjectWithConfig(prefix = 'gsd-test-') {
  const tmpDir = createTempGitProject(prefix);
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'config.json'),
    JSON.stringify(BRIEF_BASELINE_CONFIG, null, 2) + '\n',
    'utf-8',
  );
  // Re-stage + commit the seeded config so the atomic-commit rollback test
  // starts from a clean HEAD (no pending modifications).
  execSync('git add -A', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git commit -m "seed config"', { cwd: tmpDir, stdio: 'pipe' });
  return tmpDir;
}

module.exports = {
  runGsdTools,
  createTempDir,
  createTempProject,
  createTempGitProject,
  createTempProjectWithConfig,
  createTempGitProjectWithConfig,
  cleanup,
  TOOLS_PATH,
  BRIEF_BASELINE_CONFIG,
};
