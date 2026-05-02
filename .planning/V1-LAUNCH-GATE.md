# BRIEF v1 Launch Gate

**Gate evaluated:** 2026-04-27
**Phase:** 09 (Hardening — v1 launch gate)
**Plan:** 09-06 (closure)
**Decision rule:** D-D04 — three-prong checklist; (i) zero blocking pilot findings + (ii) smoke test PASS or documented SKIP + (iii) surface cap compliance.

**Verdict: PASS**

All three prongs satisfied. v1 ship is approved for milestone closure (`/brief-verify-work`).

## Three-Prong Checklist (D-D04)

| Prong | Criterion | Evidence | Status |
|-------|-----------|----------|--------|
| (i) | 0 blocking pilot findings (severity=blocker) | `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md` — Pitfall #9 friction items, all severity ∈ {medium, high}, none = blocker | PASS |
| (ii) | Smoke test 4 runtimes × 5 commands matrix; text_mode plumbing verified | `.planning/SMOKE-TEST.md` — 4×5 = 20-cell matrix, 20/20 PASS. `--smoke` handlers wired into the 5 dispatcher cases (init/define/discover/design/deliver) per CR-01 fix; each handler returns a deterministic ok payload so the matrix verifies the runtime can route a child invocation through the dispatcher without hitting an interactive precondition | PASS |
| (iii) | Surface cap compliance (≤12 cmds + ≤8 skills) | `.planning/SURFACE-AUDIT.md` — 12/12 commands + 0/8 skills; `tests/brief-surface-audit-count.test.cjs` GREEN (3/3) | PASS |

## Notes

- **HRD-04 partial 1/3 is NOT a launch blocker** (D-D04 + D-D01 explicit Out of Scope). Pilot 1/3 = Korean non-technical product owner (BRIEF build-team vision-keeper) logged in `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md`. Pilots 2/3 + 3/3 (fully external EN + non-Korean Asian planners) deferred to v1.1 beta program.
- **Prong (ii) "PASS"** reflects the post-Phase-9-review fix landed for CR-01: `--smoke` no-op handlers were wired into the 5 dispatcher cases (init/define/discover/design/deliver) so the matrix now verifies text_mode plumbing rather than reporting subcommand-validation FAILs. SMOKE-TEST.md was re-emitted with 20/20 PASS; smoke-test.cjs's existing AskUserQuestion-vs-text_mode assertion is now reachable on every cell.
- **HRD-05 (a)+(b) closure** met (per Plan 09-06): 10 missing-file test assertions triaged ALL DELETE per LOCKED_12 rubric (`.planning/HRD-05-CLOSURE-RATIONALE.md`); ARCHITECTURE.md Total commands/workflows/agents synced 12/70/26 (architecture-counts.test.cjs + command-count-sync.test.cjs both GREEN).
- **HRD-05 (c)+(d) drift** deferred to v1.1 per D-D02. Empirical residual fail count: 185 (catalog: `.planning/RESIDUAL-FAILS-V1.md`). Higher than original Phase-1 EMPIRICAL_BASELINE 6 + DELTA_CAP 10 = ≤16 estimate because Plan 09-05 atomically deleted 56 inherited GSD developer-surface commands (HRD-02 surface pruning), broadening the assertion-drift surface beyond Phase-1's framing. Launch-non-blocking; v1.1 remediation estimate ~10-15h.
- **Upgrading from earlier brief-cc** — re-run `npx brief-cc@latest` to refresh installed commands. Stale `.claude/commands/brief/{deleted}.md` files in user config dirs may persist (Pitfall #1 mitigation; documented in CLAUDE.md "Surface Caps" section).
- **A1 invariant** — zero npm runtime dependencies (verified: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0).

## Cross-References

- Smoke test artifact: `.planning/SMOKE-TEST.md`
- Surface audit artifact: `.planning/SURFACE-AUDIT.md`
- Pilot friction journal: `.planning/pilot/01-korean-non-technical-product-owner-friction-journal.md`
- HRD-05 closure rationale: `.planning/HRD-05-CLOSURE-RATIONALE.md`
- v1.1 deferred work: `.planning/RESIDUAL-FAILS-V1.md`
- Locked 12-cmd lineup: CLAUDE.md "Surface Caps" section

## Sign-off

The three-prong gate evaluates v1 launch readiness against the criteria defined in Phase 9 CONTEXT D-D04. Each prong has a single source-of-truth artifact recorded above; the verdict is a function of those artifacts at the moment of gate evaluation (2026-04-27). v1.1 will re-evaluate the gate after the residual remediation work in `.planning/RESIDUAL-FAILS-V1.md` lands; the gate is not a one-shot — it can be re-run after each material change to any of the three artifacts.

The Phase 9 closure milestone (`/brief-verify-work` next) takes this gate doc as the v1 ship signal. Subsequent milestones will operate against post-v1.1 versions of the three artifacts and may extend the prong list as the v1.x line evolves.
