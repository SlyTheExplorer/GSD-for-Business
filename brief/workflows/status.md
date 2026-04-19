<purpose>
Render a one-screen compact dashboard of BRIEF workflow state — current phase, active workstream, return-stack depth, and the most recent ALIGN / COMPLIANCE gate decisions. Read-only situational awareness before continuing work.
</purpose>

<process>
Invoke `brief-tools.cjs status` and print the compact-dashboard stdout verbatim. Read-only — no writes to STATE.md, no side effects.
</process>
