# Instructions for BRIEF

- Use the brief skill when the user asks for BRIEF or uses a `gsd-*` command.
- Treat `/brief-...` or `gsd-...` as command invocations and load the matching file from `.github/skills/brief-*`.
- When a command says to spawn a subagent, prefer a matching custom agent from `.github/agents`.
- Do not apply BRIEF workflows unless the user explicitly asks for them.
- After completing any `gsd-*` command (or any deliverable it triggers: feature, bug fix, tests, docs, etc.), ALWAYS: (1) offer the user the next step by prompting via `ask_user`; repeat this feedback loop until the user explicitly indicates they are done.
