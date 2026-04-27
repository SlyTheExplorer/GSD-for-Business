# BRIEF Cross-Runtime Smoke Test — v1 Launch

**Run:** 2026-04-27
**Approach:** Stub-driven (B-D01). NEVER invokes real Codex/Gemini/OpenCode CLIs.
**Result format:** PASS / FAIL / SKIP per cell + one-line reason.

| Runtime    | init | define | discover | design | deliver |
|------------|------|--------|----------|--------|---------|
| claude     | FAIL | FAIL | FAIL | FAIL | FAIL |
| codex      | FAIL | FAIL | FAIL | FAIL | FAIL |
| gemini     | FAIL | FAIL | FAIL | FAIL | FAIL |
| opencode   | FAIL | FAIL | FAIL | FAIL | FAIL |

## FAIL/SKIP Detail

- **claude × init** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs init --smoke --text
- **claude × define** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs define --smoke --text
- **claude × discover** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs discover --smoke --text
- **claude × design** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs design --smoke --text
- **claude × deliver** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs deliver --smoke --text
- **codex × init** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs init --smoke --text
- **codex × define** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs define --smoke --text
- **codex × discover** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs discover --smoke --text
- **codex × design** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs design --smoke --text
- **codex × deliver** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs deliver --smoke --text
- **gemini × init** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs init --smoke --text
- **gemini × define** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs define --smoke --text
- **gemini × discover** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs discover --smoke --text
- **gemini × design** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs design --smoke --text
- **gemini × deliver** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs deliver --smoke --text
- **opencode × init** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs init --smoke --text
- **opencode × define** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs define --smoke --text
- **opencode × discover** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs discover --smoke --text
- **opencode × design** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs design --smoke --text
- **opencode × deliver** — FAIL: Command failed: /usr/local/bin/node /Users/agent/GSD-for-Business/.claude/worktrees/agent-a2e317cc0300fcc8f/brief/bin/brief-tools.cjs deliver --smoke --text
