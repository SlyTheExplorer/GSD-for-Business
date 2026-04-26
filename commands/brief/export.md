---
name: brief:export
description: BRIEF EXPORT — Render a Type B deck/memo source to PPTX (default), PDF, or HTML via Marp invoked through `npx --yes @marp-team/marp-cli@4.3.1`. Runs the 7-step gate orchestration BEFORE render — cross-artifact leakage diff (TF-IDF), AUDIENCE re-run with NEW export-run-id, COMPLIANCE re-run, 1-step confirmation UI (Korean/English variant), 3-path interrupt on BLOCKING (frontmatter / rewrite / force-accept with audit trail), and a fallback ladder PPTX → PDF → HTML when no Chrome/Edge/Firefox is detected. Layer 1–4 of 4-layer audience defense (filename encoding + watermark + 1-step confirm + frontmatter pre-commit). Phase 8 DLV-08.
argument-hint: "<artifact-name> [--format pptx|pdf|html] [--theme name] [--text]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Write
---
<objective>
Render a single Type B artifact through the 7-step export orchestration:
  1. TEXT_MODE detection (--text flag OR config.workflow.text_mode) — switch AskUserQuestion to numbered-list under non-Claude-Code runtimes (FND-06).
  2. Resolve artifact path (block if missing) — rejects path-traversal via export.cjs Step 0 _resolveSafePath guard (audience.cjs lines 336-351 byte-identity).
  3. Cross-artifact leakage diff — `brief-tools leakage-diff scan --artifact <path>` runs Salton-1988 TF-IDF against all stricter-confidentiality siblings in same folder; ≥3 distinctive-keyword overlap emits a material finding.
  4. AUDIENCE re-run with NEW run-id (`export-${timestamp}-${pid}`) — separate from any DESIGN/DISCOVER run-id so the verdict is freshly evaluated against the current rendered artifact body.
  5. COMPLIANCE re-run with NEW run-id — sequential after AUDIENCE per Phase 7 D-02 (AUDIENCE blocking → fail-fast skip COMPLIANCE).
  6. 1-step confirmation UI displaying 6 fields (Artifact / Audience / Confidentiality / Output / Watermark / 3 gate verdicts) — Korean variant when `state.brief.region: kr`, English otherwise. AskUserQuestion ↔ numbered-list fallback per TEXT_MODE.
  7. BLOCKING branch: 3-path interrupt — Edit frontmatter (Path 1) / Rewrite deck (Path 2) / force-accept with audit trail (Path 3). force-accept FIRST live use of Phase 4 D-07 substrate via `audience.commitAudienceVerdict({override:true, overrideReason})` — sanitized via security.cjs sanitizeForPrompt before STATE.md write.
  8. Marp render via `brief-tools export render --artifact <path> --format <fmt> [--theme <name>]` — env-detect Chrome/Edge/Firefox first; PDF/HTML fallback ladder when no browser; 2-min hard timeout; first-invocation 30-60s download (~50MB) cached thereafter.
  9. Atomic commit (source.md + .audience.md + .compliance.md + .{conf}.{ext} + STATE.md = 5 files in 1 commit).
  10. Update state.brief.last_export_at + deliverable_index entry per Plan 04 PHASE_8_BRIEF_FIELDS allowlist.

Korean is the default UI when state.brief.region == 'kr'; English otherwise. The Marp invocation does NOT add any package to dependencies (A1 zero-runtime-deps preserved).
</objective>

<execution_context>
@~/.claude/brief/workflows/export.md
</execution_context>

<process>
Execute the export workflow per `brief/workflows/export.md`:

  1. Step 0 — TEXT_MODE detection.
  2. Step 1 — Resolve artifact path.
  3. Step 2 — Cross-artifact leakage diff.
  4. Step 3 — AUDIENCE re-run with NEW run-id.
  5. Step 4 — COMPLIANCE re-run with NEW run-id.
  6. Step 5 — 1-step confirmation UI.
  7. Step 6 — BLOCKING branch (3-path interrupt with force-accept audit trail).
  8. Step 7 — Marp render.
  9. Step 8 — Atomic commit (5 files).
  10. Step 9 — STATE.md update (last_export_at + deliverable_index).

See brief/workflows/export.md for the full step-by-step orchestration detail.
</process>
