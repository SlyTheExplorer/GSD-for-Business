/**
 * GSD Agent Frontmatter Tests
 *
 * Validates that all agent .md files have correct frontmatter fields:
 * - Anti-heredoc instruction present in file-writing agents
 * - skills: field absent from all agents (breaks Gemini CLI)
 * - Commented hooks: pattern in file-writing agents
 * - Spawn type consistency across workflows
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'agents');
const WORKFLOWS_DIR = path.join(__dirname, '..', 'brief', 'workflows');
const COMMANDS_DIR = path.join(__dirname, '..', 'commands', 'brief');

const ALL_AGENTS = fs.readdirSync(AGENTS_DIR)
  .filter(f => f.startsWith('brief-') && f.endsWith('.md'))
  .map(f => f.replace('.md', ''));

const FILE_WRITING_AGENTS = ALL_AGENTS.filter(name => {
  const content = fs.readFileSync(path.join(AGENTS_DIR, name + '.md'), 'utf-8');
  const toolsMatch = content.match(/^tools:\s*(.+)$/m);
  return toolsMatch && toolsMatch[1].includes('Write');
});

const READ_ONLY_AGENTS = ALL_AGENTS.filter(name => !FILE_WRITING_AGENTS.includes(name));

// ─── Anti-Heredoc Instruction ────────────────────────────────────────────────

describe('HDOC: anti-heredoc instruction', () => {
  for (const agent of FILE_WRITING_AGENTS) {
    test(`${agent} has anti-heredoc instruction`, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      assert.ok(
        content.includes("never use `Bash(cat << 'EOF')` or heredoc"),
        `${agent} missing anti-heredoc instruction`
      );
    });
  }

  test('no active heredoc patterns in any agent file', () => {
    for (const agent of ALL_AGENTS) {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      // Match actual heredoc commands (not references in anti-heredoc instruction)
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip lines that are part of the anti-heredoc instruction or markdown code fences
        if (line.includes('never use') || line.includes('NEVER') || line.trim().startsWith('```')) continue;
        // Check for actual heredoc usage instructions
        if (/^cat\s+<<\s*'?EOF'?\s*>/.test(line.trim())) {
          assert.fail(`${agent}:${i + 1} has active heredoc pattern: ${line.trim()}`);
        }
      }
    }
  });
});

// ─── Skills Frontmatter ──────────────────────────────────────────────────────

describe('SKILL: skills frontmatter absent', () => {
  for (const agent of ALL_AGENTS) {
    test(`${agent} does not have skills: in frontmatter`, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      const frontmatter = content.split('---')[1] || '';
      assert.ok(
        !frontmatter.includes('skills:'),
        `${agent} has skills: in frontmatter — skills: breaks Gemini CLI and must be removed`
      );
    });
  }
});

// ─── Hooks Frontmatter ───────────────────────────────────────────────────────

describe('HOOK: hooks frontmatter pattern', () => {
  for (const agent of FILE_WRITING_AGENTS) {
    test(`${agent} has commented hooks pattern`, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      const frontmatter = content.split('---')[1] || '';
      assert.ok(
        frontmatter.includes('# hooks:'),
        `${agent} missing commented hooks: pattern in frontmatter`
      );
    });
  }

  for (const agent of READ_ONLY_AGENTS) {
    test(`${agent} (read-only) does not need hooks`, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      const frontmatter = content.split('---')[1] || '';
      // Read-only agents may or may not have hooks — just verify they parse
      assert.ok(frontmatter.includes('name:'), `${agent} has valid frontmatter`);
    });
  }
});

// ─── Spawn Type Consistency ──────────────────────────────────────────────────

describe('SPAWN: spawn type consistency', () => {
  test('no "First, read agent .md" workaround pattern remains', () => {
    const dirs = [WORKFLOWS_DIR, COMMANDS_DIR];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const hasWorkaround = content.includes('First, read ~/.claude/agents/brief-');
        assert.ok(
          !hasWorkaround,
          `${file} still has "First, read agent .md" workaround — use named subagent_type instead`
        );
      }
    }
  });

  test('named agent spawns use correct agent names', () => {
    const validAgentTypes = new Set([
      ...ALL_AGENTS,
      'general-purpose',  // Allowed for orchestrator spawns
    ]);

    const dirs = [WORKFLOWS_DIR, COMMANDS_DIR];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const matches = content.matchAll(/subagent_type="([^"]+)"/g);
        for (const match of matches) {
          const agentType = match[1];
          assert.ok(
            validAgentTypes.has(agentType),
            `${file} references unknown agent type: ${agentType}`
          );
        }
      }
    }
  });

  test('workflows spawning named agents have <available_agent_types> listing (#1357)', () => {
    // After /clear, Claude Code re-reads workflow instructions but loses agent
    // context. Without an <available_agent_types> section, the orchestrator may
    // fall back to general-purpose, silently breaking agent capabilities.
    // PR #1139 added this to plan-phase and execute-phase but missed all other
    // workflows that spawn named GSD agents.
    const dirs = [WORKFLOWS_DIR, COMMANDS_DIR];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        // Find all named subagent_type references (excluding general-purpose)
        const matches = [...content.matchAll(/subagent_type="([^"]+)"/g)];
        const namedAgents = matches
          .map(m => m[1])
          .filter(t => t !== 'general-purpose');

        if (namedAgents.length === 0) continue;

        // Workflow spawns named agents — must have <available_agent_types>
        assert.ok(
          content.includes('<available_agent_types>'),
          `${file} spawns named agents (${[...new Set(namedAgents)].join(', ')}) ` +
          `but has no <available_agent_types> section — after /clear, the ` +
          `orchestrator may fall back to general-purpose (#1357)`
        );

        // Every spawned agent type must appear in the listing
        for (const agent of new Set(namedAgents)) {
          const agentTypesMatch = content.match(
            /<available_agent_types>([\s\S]*?)<\/available_agent_types>/
          );
          assert.ok(
            agentTypesMatch,
            `${file} has malformed <available_agent_types> section`
          );
          assert.ok(
            agentTypesMatch[1].includes(agent),
            `${file} spawns ${agent} but does not list it in <available_agent_types>`
          );
        }
      }
    }
  });

  test('execute-phase has Copilot sequential fallback in runtime_compatibility', () => {
    const content = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'execute-phase.md'), 'utf-8'
    );
    assert.ok(
      content.includes('sequential inline execution'),
      'execute-phase must document sequential inline execution as Copilot fallback'
    );
    assert.ok(
      content.includes('spot-check'),
      'execute-phase must have spot-check fallback for completion detection'
    );
  });
});

// ─── Required Frontmatter Fields ─────────────────────────────────────────────

describe('AGENT: required frontmatter fields', () => {
  for (const agent of ALL_AGENTS) {
    test(`${agent} has name, description, tools, color`, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      const frontmatter = content.split('---')[1] || '';
      assert.ok(frontmatter.includes('name:'), `${agent} missing name:`);
      assert.ok(frontmatter.includes('description:'), `${agent} missing description:`);
      assert.ok(frontmatter.includes('tools:'), `${agent} missing tools:`);
      assert.ok(frontmatter.includes('color:'), `${agent} missing color:`);
    });
  }
});

// ─── CLAUDE.md Compliance ───────────────────────────────────────────────────

describe('CLAUDEMD: CLAUDE.md compliance enforcement', () => {
  test('brief-plan-checker has Dimension 10: CLAUDE.md Compliance', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-plan-checker.md'), 'utf-8');
    assert.ok(
      content.includes('Dimension 10: CLAUDE.md Compliance'),
      'brief-plan-checker must have Dimension 10 for CLAUDE.md compliance checking'
    );
    assert.ok(
      content.includes('claude_md_compliance'),
      'brief-plan-checker must use claude_md_compliance as dimension identifier'
    );
  });

  test('brief-phase-researcher has CLAUDE.md enforcement directive', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-phase-researcher.md'), 'utf-8');
    assert.ok(
      content.includes('CLAUDE.md enforcement'),
      'brief-phase-researcher must enforce CLAUDE.md directives during research'
    );
    assert.ok(
      content.includes('Project Constraints (from CLAUDE.md)'),
      'brief-phase-researcher must output a Project Constraints section from CLAUDE.md'
    );
  });

  test('brief-executor has CLAUDE.md enforcement directive', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-executor.md'), 'utf-8');
    assert.ok(
      content.includes('CLAUDE.md enforcement'),
      'brief-executor must enforce CLAUDE.md directives during execution'
    );
    assert.ok(
      content.includes('CLAUDE.md rule — it takes precedence over plan instructions'),
      'brief-executor must specify CLAUDE.md precedence over plan instructions'
    );
  });

  test('all three agents read CLAUDE.md in project_context', () => {
    const agents = ['brief-plan-checker', 'brief-phase-researcher', 'brief-executor'];
    for (const agent of agents) {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      assert.ok(
        content.includes('Read `./CLAUDE.md`'),
        `${agent} must read ./CLAUDE.md in project_context section`
      );
    }
  });
});

// ─── Verification Data-Flow and Environment Audit (#1245) ────────────────────

describe('VERIFY: data-flow trace, environment audit, and behavioral spot-checks', () => {
  test('brief-verifier has Step 4b: Data-Flow Trace', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-verifier.md'), 'utf-8');
    assert.ok(
      content.includes('Step 4b: Data-Flow Trace'),
      'brief-verifier must have Step 4b for data-flow tracing'
    );
    assert.ok(
      content.includes('HOLLOW'),
      'brief-verifier must define HOLLOW status for wired-but-disconnected artifacts'
    );
    assert.ok(
      content.includes('DISCONNECTED'),
      'brief-verifier must define DISCONNECTED status for missing data sources'
    );
  });

  test('brief-verifier has Step 7b: Behavioral Spot-Checks', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-verifier.md'), 'utf-8');
    assert.ok(
      content.includes('Step 7b: Behavioral Spot-Checks'),
      'brief-verifier must have Step 7b for behavioral spot-checks'
    );
    assert.ok(
      content.includes('SKIP'),
      'brief-verifier spot-checks must support SKIP status for untestable items'
    );
  });

  test('brief-verifier VERIFICATION.md template includes data-flow and spot-check sections', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-verifier.md'), 'utf-8');
    assert.ok(
      content.includes('Data-Flow Trace (Level 4)'),
      'VERIFICATION.md template must include Data-Flow Trace section'
    );
    assert.ok(
      content.includes('Behavioral Spot-Checks'),
      'VERIFICATION.md template must include Behavioral Spot-Checks section'
    );
  });

  test('brief-verifier success criteria include data-flow and spot-checks', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-verifier.md'), 'utf-8');
    assert.ok(
      content.includes('Data-flow trace (Level 4)'),
      'success criteria must include data-flow trace step'
    );
    assert.ok(
      content.includes('Behavioral spot-checks run'),
      'success criteria must include behavioral spot-checks step'
    );
  });

  test('brief-phase-researcher has Step 2.6: Environment Availability Audit', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-phase-researcher.md'), 'utf-8');
    assert.ok(
      content.includes('Step 2.6: Environment Availability Audit'),
      'brief-phase-researcher must have Step 2.6 for environment availability auditing'
    );
    assert.ok(
      content.includes('Environment Availability'),
      'brief-phase-researcher must include Environment Availability section in RESEARCH.md template'
    );
  });

  test('brief-phase-researcher success criteria include environment audit', () => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, 'brief-phase-researcher.md'), 'utf-8');
    assert.ok(
      content.includes('Environment availability audited'),
      'success criteria must include environment availability audit step'
    );
  });
});

// ─── Discussion Log ──────────────────────────────────────────────────────────

describe('DISCUSS: discussion log generation', () => {
  test('discuss-phase workflow references DISCUSSION-LOG.md generation', () => {
    const content = fs.readFileSync(
      path.join(WORKFLOWS_DIR, 'discuss-phase.md'), 'utf-8'
    );
    assert.ok(
      content.includes('DISCUSSION-LOG.md'),
      'discuss-phase must reference DISCUSSION-LOG.md generation'
    );
    assert.ok(
      content.includes('Audit trail only'),
      'discuss-phase must mark discussion log as audit-only'
    );
  });

  test('discussion-log template exists', () => {
    const templatePath = path.join(__dirname, '..', 'brief', 'templates', 'discussion-log.md');
    assert.ok(
      fs.existsSync(templatePath),
      'discussion-log.md template must exist'
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    assert.ok(
      content.includes('Do not use as input to planning'),
      'template must contain audit-only notice'
    );
  });
});

// ─── Cross-runtime agent compatibility (#1522) ──────────────────────────────

describe('COMPAT: agents must not use runtime-specific frontmatter keys', () => {
  // permissionMode is Claude Code-specific and breaks Gemini CLI agent loading.
  // It also has no effect on subagent Write permissions in Claude Code (blocked
  // at runtime level regardless). See #1522, #1387.
  const AGENTS_WITH_WRITE = ['brief-executor'];

  for (const agent of AGENTS_WITH_WRITE) {
    test(`${agent} does not have permissionMode (breaks Gemini CLI)`, () => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agent + '.md'), 'utf-8');
      const frontmatter = content.split('---')[1] || '';
      assert.ok(
        !frontmatter.includes('permissionMode'),
        `${agent} must not have permissionMode — it breaks Gemini CLI agent loading (#1522) ` +
        `and has no effect in Claude Code (#1387)`
      );
    });
  }
});
