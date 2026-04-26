<!-- BRIEF:project-start source:PROJECT.md -->
## Project

**BRIEF — Business Research, Insight & Execution Framework**

BRIEF is a meta-prompting framework for business and product strategy planning, hard-forked from GSD (Get Shit Done). It guides a business planner through four phases — DEFINE (extract true intent), DISCOVER (broad domain research), DESIGN (concrete business plan), DELIVER (high-level product/service policy + stakeholder communication artifacts) — all of which occur BEFORE engineering's PRD work begins. The output of BRIEF can hand off cleanly into a PRD that GSD itself can then execute.

**Core Value:** A business planner can transform a fuzzy idea into well-researched, audience-correct, compliance-aware deliverables — without already knowing what they want when they start.

### Constraints

- **Tech stack**: Inherited from GSD. Node.js 22+, CommonJS-only core (`.cjs`), zero external runtime dependencies for the bin layer. TypeScript SDK retained.
- **Architecture**: Must preserve GSD's atomic-commit + STATE.md file lock + agent prompt context engine. No re-architecture of these primitives.
- **Multi-runtime**: Must keep working across Claude Code, OpenAI Codex, Gemini CLI, OpenCode (same as GSD). `INSTRUCTION_FILE` detection and `text_mode` fallback for non-AskUserQuestion runtimes preserved.
- **Backward compatibility**: NONE. Hard fork. The `backup/original-gsd` branch is for reference only — no compatibility shims, aliases, or migration tooling.
- **Naming**: `gsd-*` → `brief-*` is a one-shot global rename. No transitional period.
- **Testing**: `node:test` (not Jest), c8 coverage, cross-platform (Mac/Windows/Linux) — same as GSD.
- **Distribution**: npm package, similar `bin/install.js` pattern. Likely package name `brief-cc` or similar.
- **Marp environment dependency** (Phase 8 DLV-05/06/08): User producing Type B Marp decks via `/brief-export` needs Chrome OR Edge OR Firefox installed (puppeteer-core fallback chain). LibreOffice Impress is OPTIONAL for editable PPTX. See `brief/references/marp-environment.md` for the full environment reference + sandbox notes + Pandoc fallback (manual escape hatch only). First `npx --yes @marp-team/marp-cli@4.3.1` invocation downloads marp-cli + puppeteer-core (~50MB, 30-60s); cached thereafter (~2-5s). The `--local-file-access` flag is NEVER passed (Pitfall 8 mitigation per Plan 04 export.cjs).
<!-- BRIEF:project-end -->

<!-- BRIEF:stack-start source:research/STACK.md -->
## Technology Stack

## Summary
## Architectural Responsibility Map
| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Slash command dispatch | Inherited BRIEF core (`commands/*.md`) | — | BRIEF already routes `/brief-*` prompts; rename to `/brief-*` is a string substitution, not architecture |
| Multi-agent orchestration | Inherited BRIEF core (`agents/*.md`) | — | The orchestrator/researcher/planner/checker pattern is exactly what BRIEF needs; only agent identities change |
| State lock + atomic commits | Inherited BRIEF core (`STATE.md`, `brief-tools.cjs`) | — | Constraint: must not re-architect |
| Runtime detection (Claude/Codex/Gemini/OpenCode) | Inherited BRIEF core (`INSTRUCTION_FILE`, `text_mode`) | — | Constraint: must keep working |
| Audience guard (frontmatter on every artifact) | New BRIEF layer (parser via `gray-matter`) | Inherited BRIEF hooks | Frontmatter parsing is too lightweight to justify a new architecture; piggyback on existing hook system |
| ALIGN gate (objectives match) | New BRIEF agent (`brief-align-checker`) | Inherited BRIEF agent-spawn pattern | Mirrors `brief-plan-checker`: a verifier agent that reads artifacts and writes findings |
| Compliance checker (region+industry-aware) | New BRIEF agent (`brief-compliance-checker`) | Inherited BRIEF agent-spawn pattern | Same shape as ALIGN — verifier agent with reference library |
| Type B deck generation (DELIVER) | New BRIEF skill + `marp-cli` (via `npx`) | Pandoc fallback | Markdown-in/PPTX-out is a single CLI invocation, not a runtime dependency |
| Type A artifact generation (PRODUCT-BRIEF, etc.) | New BRIEF prompts (markdown templates) | Inherited BRIEF planner pattern | Pure prompt engineering; no new tooling needed |
| Compliance reference library (Korea + global) | New BRIEF static data (markdown reference files) | — | Just markdown files in `references/compliance/` — no library, no schema engine |
## Recommended Stack
### Core Technologies (INHERITED — do not change)
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | >=22.0.0 | Runtime | BRIEF constraint. Node 22 LTS is current. `[VERIFIED: package.json engines field]` |
| CommonJS (`.cjs`) | — | Module system for bin layer | BRIEF constraint. ESM is "default in new frameworks" in 2026 per industry trend, but CommonJS remains fully supported (Node 25.8.1 explicitly fixed CJS-in-type:module edge cases in 2026). For a fork, breaking the module convention would invite friction with no payoff. `[CITED: nodejs.org docs, Node 25.8.1 release notes]` |
| `node:test` | built-in | Test runner | BRIEF constraint. Built-in, zero install, ships with Node. `[VERIFIED: BRIEF package.json scripts.test]` |
| `c8` | ^11.0.0 (current 11.0.0) | V8-native coverage | BRIEF constraint. Native V8 coverage is faster and more accurate than Istanbul/nyc. Already used at 70% line threshold. `[VERIFIED: npm view c8 version → 11.0.0]` |
| `esbuild` | ^0.24.0 (current 0.28.0) | Hook bundling | BRIEF constraint. Used only by `scripts/build-hooks.js`. Version drift from 0.24→0.28 is fine; not a breaking change in the hook bundling path. `[VERIFIED: npm view esbuild version → 0.28.0]` |
| `vitest` | ^4.1.2 (current 4.1.4) | TypeScript SDK tests | BRIEF constraint, only for `sdk/`. Test runner split between `node:test` (bin layer) and vitest (TS SDK) is intentional and inherited. `[VERIFIED: npm view vitest version → 4.1.4]` |
### Supporting Libraries (NEW — minimum viable additions)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@marp-team/marp-cli` | ^4.3.1 (released 2026-03-16) | Markdown→PPTX/PDF/HTML for DELIVER Type B decks | Invoke via `npx --yes @marp-team/marp-cli@4.3.1` from a BRIEF skill — do NOT add to `dependencies`. Mirrors BRIEF's `npx --yes ctx7@latest` pattern for Context7 fallback. `[VERIFIED: npm view @marp-team/marp-cli version + time.modified]` |
| `gray-matter` | ^4.0.3 | YAML frontmatter parsing for audience-guard | Audience guard reads `audience:`, `confidentiality:`, `voice:` from artifact frontmatter. `gray-matter` is the de-facto standard (used by Jekyll, Hugo, Astro, Next.js MDX, Gatsby). Zero-config, well-maintained. `[VERIFIED: npm view gray-matter version → 4.0.3]` |
| `js-yaml` | ^4.1.1 | OBJECTIVES.md and reference-library YAML parsing | If `gray-matter` is already pulled in, it transitively provides js-yaml — avoid declaring twice. Use directly only if a non-frontmatter YAML file (e.g., `references/compliance/iso-27001.yaml`) needs parsing. `[VERIFIED: npm view js-yaml version → 4.1.1]` |
| `ajv` | ^8.18.0 | JSON Schema validation for ALIGN/AUDIENCE/COMPLIANCE gate outputs | Gates produce structured findings (severity, location, rule_id). Validating against a schema keeps gate output consumable by downstream agents. `ajv` is the standard JSON Schema validator in Node. `[VERIFIED: npm view ajv version → 8.18.0]` |
### Patterns to Absorb (NO runtime dependency — concept only)
| Source | Pattern | How BRIEF Uses It |
|--------|---------|-------------------|
| gstack `office-hours` | Push Twice (real answer comes after the 2nd or 3rd push); Language Precision (force definition of vague terms); Reframing as Clarification ("Let me restate what I think you're building"); Dream State Mapping (hypothetical vs. real-behavior detection); output saved as design document, never code | Phase 0 DEFINE — `brief-define-intent` agent prompts implement these techniques verbatim. No imports from gstack. `[CITED: github.com/garrytan/gstack/blob/main/office-hours/SKILL.md]` |
| gstack `plan-ceo-review` | Four operating modes (SCOPE EXPANSION / SELECTIVE / HOLD / REDUCTION); Platonic Ideal ("if the best engineer had unlimited time…"); Prime Directives ("Zero silent failures", "Optimize for the 6-month future"); Outside Voice independent second opinion; 11 review sections | Phase 2 DESIGN — `brief-design-review` agent uses the same mode selection + Platonic Ideal framing, adapted from "best engineer" to "best founder/operator/strategist for this audience". Independent voice = the ALIGN/AUDIENCE/COMPLIANCE gate trio. `[CITED: github.com/garrytan/gstack/blob/main/plan-ceo-review/SKILL.md]` |
| Anthropic Superpowers (Jesse Vincent, obra) | 5-phase clarify→design→plan→code→verify discipline; "deletes code written before tests exist" enforcement; mandatory dispatcher routes to relevant skills | BRIEF's 5-phase shape (DEFINE→DISCOVER→DESIGN→DELIVER + continuous ALIGN) is the business-domain analog. Software-development specifics (TDD enforcement, subagent dev, code review) are intentionally dropped — they don't translate. **Rejected as runtime dependency** because superpowers' skills are SWE-coupled. `[CITED: github.com/obra/superpowers]` |
| Sequoia / Y Combinator pitch-deck format | 10-slide structure (Company Purpose / Problem / Solution / Why Now / Market Size / Competition / Product / Business Model / Team / Financials); one-core-idea-per-slide; black-on-white default | DELIVER Type B `INVESTOR-IR` and `EXEC-SUMMARY` artifact templates use this structure as the default schema. Override via frontmatter `audience:` selector. `[CITED: ycombinator.com Library, slideshare/sequoia-capital-pitchdecktemplate]` |
| Strategyzer Business Model Canvas | 9-block canonical structure (Customer Segments / Value Proposition / Channels / Customer Relationships / Revenue Streams / Key Resources / Key Partners / Key Activities / Cost Structure); Creative Commons license | DESIGN workstream `business-model.md` template uses the 9-block structure as section headers. CC license means we can ship the template structure without attribution problems. `[CITED: strategyzer.com/library/the-business-model-canvas]` |
| Lean Canvas (Ash Maurya) | 9-block lean variant of BMC (replaces Key Partners/Activities/Resources/Customer Relationships with Problem / Solution / Key Metrics / Unfair Advantage); markdown templates in active community use (planvas, paper-forms) | Alternative DESIGN template offered via frontmatter `business_model_canvas_variant: lean` toggle. Useful for early-stage / single-founder cases. `[CITED: leanstack.com Lean-Canvas.pdf, github.com/shermanhuman/planvas]` |
### Development Tools (INHERITED + 1 addition)
| Tool | Purpose | Notes |
|------|---------|-------|
| `node scripts/run-tests.cjs` | Test entry | Inherited — extend with BRIEF-specific test files under `tests/brief-*.test.cjs` |
| `c8` (with 70% line threshold) | Coverage | Inherited threshold is appropriate for the new business-layer code paths. Don't lower. |
| `esbuild` | Hook bundling | Inherited — only relevant if BRIEF adds new hooks; existing hooks work as-is after the rename |
| **`marp` (via `npx --yes`)** | Slide deck generation in DELIVER | NEW. Invoke from a BRIEF skill, not a runtime dependency. Use `npx --yes @marp-team/marp-cli@4.3.1 input.md -o output.pptx --pdf --html` |
## Installation
# Marp is invoked via npx; users do NOT need to install it explicitly.
# However, PPTX export with editable contents requires LibreOffice Impress installed.
# Document this in BRIEF's CLAUDE.md as an optional environment dependency.
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Marp CLI** for decks | **Slidev** (`@slidev/cli` 52.14.2) | If BRIEF later adds developer/technical-audience deck templates with live code, charts, or interactive demos. Slidev is Vue-powered and excels at live coding. For business audiences (investor IR, exec summary, internal deck), Slidev is overkill — Marp's PPTX export is what corporate audiences want. `[VERIFIED: npm view @slidev/cli version → 52.14.2]` |
| **Marp CLI** for decks | **Reveal.js** (10.2.3) | If BRIEF needs an HTML-only browser-presented deck with custom plugins. Reveal is the most customizable but doesn't ship native PPTX export. Skip unless a user explicitly requests browser-only delivery. `[VERIFIED: npm view reveal.js version → 10.2.3]` |
| **Marp CLI** for decks | **Spectacle** (6.0.1, React) | Skip. React + JSX is wrong language paradigm for a markdown-driven framework. `[VERIFIED: npm view spectacle version → 6.0.1]` |
| **Marp CLI** for decks | **Pandoc** (`pandoc input.md -o output.pptx`) | Fallback if Marp is unavailable. Pandoc is more universal but produces less polished slides. Document as fallback in DELIVER skill prompt. |
| **Inline frontmatter parsing** (regex) | **gray-matter** library | If frontmatter complexity grows beyond simple key-value (nested objects, arrays, multi-line strings), switch to `gray-matter`. Start inline; promote only if needed. |
| **CommonJS** | **ESM** | ESM is the 2026 default for new Node.js projects, but BRIEF is a fork constrained to BRIEF's CJS core. A future v2 could migrate, but v1 must preserve compatibility with the inherited bin layer. `[CITED: medium.com/@raveenpanditha mastering-modern-node-js-in-2026]` |
| **`node:test`** | **vitest** for everything | vitest is excellent but adds an install. BRIEF already uses vitest only for the TS SDK; replicate that split in BRIEF. |
| **OBJECTIVES.md as markdown** | **YAML-only OKR file** (e.g., openproject schema) | Markdown allows free-form goal narrative + a structured OKR table. A pure YAML file is more machine-parseable but less editable by business planners. The hybrid markdown+frontmatter+optional YAML-block approach (used by Astro, Eleventy) gives both. `[CITED: github.com/oslokommune/okr-tracker, openproject.org/okr-software]` |
| **Custom audience-guard schema** | **JSON Schema + ajv** | If audience/confidentiality vocabulary stays under ~10 enum values per field, a closed-set CJS validator (50 lines) is simpler and dependency-free. Promote to ajv only if vocabulary grows. |
## Korea-Specific Tooling (LOW confidence — verified absent)
- **No dedicated Korean OKR SaaS surfaced as obviously dominant.** Mooncamp/Tability/Asana lead the OKR space globally. Korean teams generally use Notion templates or international SaaS. `[CITED: mooncamp.com, okrstool.com — searches returned international tools only]`
- **No standardized markdown/YAML schema for Korean BMC artifacts exists.** Korean BMC content is largely Notion templates, Miro boards, or PDF case studies (Toss, Kakao analyses). `[CITED: kbizplan.com Toss BMC analysis, kakao page BMC content]`
- **PIPA / ISMS-P amendments (Feb 2026) are major.** ISMS-P certification becomes mandatory for certain data controllers from **July 2027**. CEO is now personally liable for breaches. Penalty ceiling raised to **10% of total turnover**. The 2026 amendment also introduces a probabilistic incident-notification trigger and a CPO-independence requirement. **This is the most actionable Korean-specific finding for BRIEF's compliance reference library.** `[CITED: practiceguides.chambers.com, iapp.org Korea PIPA, captaincompliance.com]`
- **MyData expanded to energy, education, employment, culture, and leisure in 2026.** Beyond the original finance/healthcare/communications scope. Compliance reference library should include MyData domain expansions. `[CITED: practiceguides.chambers.com Data Protection 2026 South Korea]`
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **superpowers as a runtime dependency** | Software-development-coupled. TDD enforcement, subagent code review, browser automation skills don't translate to business planning. Listed as "rejected" in PROJECT.md key decisions. | Absorb the 5-phase concept; build BRIEF's own DEFINE→DISCOVER→DESIGN→DELIVER agents. `[CITED: github.com/obra/superpowers, PROJECT.md Key Decisions]` |
| **gstack as a runtime dependency** | Designed for the "founder-engineer wearing multiple hats" persona. Includes /qa, /ship, /deploy, /benchmark, /browse, /canary, /retro — all software-engineering activities. Pulling in gstack would re-introduce the dev-centric surfaces BRIEF explicitly removes (per PROJECT.md "Out of Scope"). | Absorb `office-hours` and `plan-ceo-review` patterns into BRIEF's own DEFINE and DESIGN agents. Document as "inspiration, not dependency" per PROJECT.md Context. `[CITED: github.com/garrytan/gstack, PROJECT.md Context]` |
| **Adding any package to `dependencies`** without verifying BRIEF's "zero external runtime dependencies" rule first | If BRIEF's bin layer ships with empty `dependencies`, BRIEF must preserve that. Adding even one runtime dep changes the install profile and breaks the lightness promise that lets BRIEF ride into Codex/Gemini/OpenCode without friction. | `npx --yes` for CLIs, inline implementations for trivial parsing/validation. `[ASSUMED — verify by inspecting BRIEF package.json `dependencies` key]` |
| **Backwards-compatibility shims for `gsd-*` → `brief-*` rename** | Aliases create dual-vocabulary confusion in agent prompts. PROJECT.md key decision: "Hard rename, no aliases". | One-shot global rename via grep+sed (or a guarded migration script). Backup branch is the rollback story. `[CITED: PROJECT.md Key Decisions]` |
| **A formal codebase-mapping artifact** of the source BRIEF | PROJECT.md explicitly notes "already analyzed in design conversation; no value in formal mapping artifact". Out of scope. | Trust the design conversation; document only the renames and new files. `[CITED: PROJECT.md Out of Scope]` |
| **Plugin distribution model** (alongside the fork) | Explored and rejected: coupling to BRIEF's release cadence would constrain BRIEF's domain-specific evolution. | Hard fork only. `backup/original-gsd` branch as reference. `[CITED: PROJECT.md Out of Scope]` |
| **Heavy programmatic verification cycle** | BRIEF's verifier loop is dev-cycle-shaped (build/test/lint pass-fail). Business artifacts can't pass-fail the same way. | Replaced by ALIGN + AUDIENCE + COMPLIANCE gates that emit human-reviewable findings. `[CITED: PROJECT.md Out of Scope]` |
| **`/brief-new-milestone` (multi-cycle restart)** in v1 | Single-cycle is enough for v1. Multi-cycle adds complexity without demonstrated demand. | Defer to v2. `[CITED: PROJECT.md Out of Scope]` |
| **Heavy schema validation engines** (e.g., `joi`, `yup` for frontmatter) | Adds dependency weight. Audience-guard frontmatter has ~5 fields with closed enums. | A 30-line CJS validator suffices. Promote to `ajv` only if schema grows. |
| **JSX/React-based slide tools** (Spectacle, mdx-deck) | Wrong paradigm for a markdown-first framework. Adds React + Babel + JSX to the dep tree just for slides. | Marp (markdown-native) or Slidev (Vue, but lighter than React for slide-only use). |
| **Framework-coupled OKR tooling** (e.g., openproject backend, Firebase OKR-tracker) | Adds web-app dependencies. BRIEF is file-and-prompt only. | Markdown OBJECTIVES.md with optional YAML frontmatter for KR scoring. Static; no runtime. `[CITED: github.com/oslokommune/okr-tracker, openproject.org/okr-software]` |
## Stack Patterns by Variant
- Use Marp template `templates/deliver/investor-ir.md` based on the Sequoia 10-slide structure.
- Export PPTX via `npx --yes @marp-team/marp-cli@4.3.1 investor-ir.md -o investor-ir.pptx`.
- Why: Investors expect PPTX for forwarding/comments; HTML decks don't survive corporate email.
- Use Marp template `templates/deliver/internal-deck.md` with `audience: internal`, `confidentiality: internal-only`.
- Audience guard blocks export if `confidentiality: internal-only` and target format is being sent externally.
- Why: Internal decks include strategy detail that must not leak.
- Compliance checker auto-loads `references/compliance/korea-pipa-2026.md`, `references/compliance/korea-isms-p.md`, `references/compliance/korea-mydata-2026.md` based on `region: korea` + `industry: fintech` frontmatter on OBJECTIVES.md.
- Surface the **July 2027 mandatory ISMS-P deadline** and **CEO personal liability** as high-severity findings if controls aren't documented.
- Why: These are 2026 regulatory shifts that smaller startups frequently miss. `[CITED: iapp.org Korea PIPA overhaul, captaincompliance.com Korea CEO liability]`
- B2B/B2C context injector adds the appropriate lens to every spawned agent's system prompt.
- BMC template variant changes: B2B emphasizes Channels (sales motion) and Customer Relationships (account management); B2C emphasizes Customer Segments (personas) and Value Proposition (jobs-to-be-done).
- Why: Same advice means different things in B2B vs B2C — explicit injection prevents drift. `[CITED: PROJECT.md Active Requirements]`
- Frontmatter toggle `business_model_canvas_variant: lean` swaps the template to Ash Maurya's 9-block lean version (Problem / Solution / Key Metrics / Unfair Advantage replace Key Partners/Activities/Resources/Customer Relationships).
- Why: Early-stage and single-founder cases benefit from the lean variant's problem/solution focus. `[CITED: leanstack.com Lean-Canvas.pdf]`
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `node@>=22` | All listed packages | Constraint from BRIEF `package.json engines.node` |
| `@marp-team/marp-cli@4.3.1` | Node 18+ (per Marp docs) | Compatible with Node 22. Editable PPTX requires LibreOffice Impress AND a compatible browser (Chrome/Edge). HTML/PDF/non-editable PPTX work without LibreOffice. `[CITED: github.com/marp-team/marp-cli README]` |
| `gray-matter@4.0.3` | Node 22 | Pulls in `js-yaml` transitively — don't double-declare. |
| `c8@11` + `node:test` | Node 22 | BRIEF already validates this combination at 70% threshold. |
| `vitest@4` | Node 22, TypeScript SDK only | Don't use vitest for the bin layer — keep `node:test`. |
| `esbuild@0.28` | Node 22 | Used only by `scripts/build-hooks.js`. Drift from declared `^0.24` to current `0.28` is non-breaking for hook bundling. |
## What's Already Done For Us (the inherited infrastructure)
- **Slash command dispatcher** — `commands/*.md` already provides the prompt-routing surface. Rename `gsd-*.md` → `brief-*.md`.
- **Multi-agent orchestration** — `agents/*.md` defines specialist agent personas. Dev-specific agents removed in Phase 1; replaced with business agents (brief-define-intent, brief-domain-researcher, brief-align-checker, brief-audience-guard, brief-compliance-checker, brief-deck-generator).
- **State management** — `STATE.md` lock + atomic commit infrastructure works as-is. No business-domain reason to change it.
- **Context engine** — `brief-tools.cjs init` produces the structured context blocks consumed by agents. Same shape, same usage.
- **Runtime detection** — `INSTRUCTION_FILE` env + `text_mode` fallback for non-AskUserQuestion runtimes. Critical for Codex/Gemini/OpenCode support; preserved unchanged.
- **Hooks system** — `hooks/` provides the hook injection points. Audience guard can register as a `PostToolUse` hook on Write tool calls.
- **Test infrastructure** — `node:test` + `c8` + `npm test` scripts. Add `tests/brief-*.test.cjs` files; everything else is already wired.
- **Distribution** — `bin/install.js` pattern. Rename to `bin/install.js` (already there) but change package name to `brief-cc` and update install destinations.
## Sources
### Primary (HIGH confidence)
- **BRIEF codebase** (`/Users/agent/BRIEF-for-Business/package.json`, `.planning/PROJECT.md`, `.planning/config.json`) — verified current dependencies, constraints, naming, decisions.
- **npm registry** (live `npm view` calls) — verified current versions of @marp-team/marp-cli (4.3.1, published 2026-03-16), @slidev/cli (52.14.2), reveal.js (10.2.3), spectacle (6.0.1), gray-matter (4.0.3), js-yaml (4.1.1), ajv (8.18.0), c8 (11.0.0), vitest (4.1.4), esbuild (0.28.0), zod (4.3.6), chalk (5.6.2), commander (14.0.3).
- **github.com/garrytan/gstack** (office-hours/SKILL.md, plan-ceo-review/SKILL.md, README.md) — verified the actual techniques (Push Twice, Language Precision, Reframing, Dream State Mapping, Platonic Ideal, four operating modes, Prime Directives) and skill file structure.
- **github.com/obra/superpowers** — verified the 5-phase discipline and Anthropic marketplace acceptance (Jan 15, 2026).
- **github.com/marp-team/marp-cli** + marp.app — verified Marp's PPTX/PDF/HTML export, frontmatter, themes, LibreOffice editable-PPTX caveat.
- **strategyzer.com/library/the-business-model-canvas** + Wikipedia BMC entry — verified canonical 9-block structure and Creative Commons license.
- **leanstack.com Lean-Canvas.pdf** — verified Ash Maurya's lean variant 9-block structure.
### Secondary (MEDIUM confidence)
- **medium.com/@tentenco "Superpowers, BRIEF, and gstack: What Each Claude Code Framework Actually Constrains"** (April 2026) — independent comparison framing each framework's constraint surface. Aligns with my read of the official READMEs.
- **practiceguides.chambers.com / iapp.org / captaincompliance.com / korea.acclime.com** — Korea PIPA Feb 2026 amendment, ISMS-P 2027 deadline, CEO personal liability, MyData 2026 expansion. Multiple legal sources agree.
- **ycombinator.com Library + slideshare/sequoia-capital-pitchdecktemplate** — pitch deck structures. Well-established conventions; multiple sources agree on slide ordering.
- **dasroot.net + pkgpulse.com Slidev/Marp/Reveal comparison (2026)** — corroborates Marp-for-corporate-PPTX, Slidev-for-developer-decks, Reveal-for-customization split.
### Tertiary (LOW confidence — verified absent rather than verified present)
- **Korean OKR/BMC tooling search** — searched in both English and Korean; found only Notion templates and PDF case studies, no dominant Korean SaaS or open-source tool to depend on or interop with. Marking LOW because absence of evidence is not strong evidence of absence; a Korean-native tool may exist that simply isn't surfaced by general web search.
- **OKR YAML/JSON schema standards search** — no dominant standardized schema; OpenProject's work-package model and Oslo Kommune's okr-tracker Firebase model are the closest to "schemas in use", but neither is an industry standard. Markdown+frontmatter remains the right call for OBJECTIVES.md.
## Assumptions Log
| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | BRIEF's bin layer ships with empty `dependencies` (only `devDependencies`) — i.e., the "zero external runtime dependencies" rule is a verifiable property of the current package.json, not just an aspiration | Supporting Libraries; What NOT to Use | If BRIEF already has runtime deps, the "preserve zero-deps" advice is moot and BRIEF can freely add `gray-matter`/`ajv` to dependencies. **Verify in DESIGN phase by inspecting `package.json` `dependencies` field.** |
| A2 | The frontmatter audience-guard vocabulary will stay small enough (~5 fields, closed enums) that an inline 30-line CJS validator beats `ajv` on cost/benefit | Supporting Libraries | If audience/confidentiality/voice frontmatter grows nested or open-ended, ajv becomes worth the dep. Re-evaluate after writing 3-5 artifact templates. |
| A3 | Existing BRIEF test infrastructure (`node scripts/run-tests.cjs` + `c8` 70% threshold) is appropriate for BRIEF's new business-layer code paths without modification | Development Tools | If business-layer code has fundamentally different testability characteristics (e.g., harder to unit-test prompt outputs), the threshold may need adjustment. Likely fine; prompts are tested via fixture-based snapshot tests. |
| A4 | Marp's `npx --yes` invocation pattern works reliably across Claude Code / Codex / Gemini / OpenCode runtime sandboxes | Stack Patterns by Variant | If a runtime sandbox blocks `npx` network calls, decks can't be generated. Document as known limitation; offer an explicit `npm install -g @marp-team/marp-cli` fallback. |
| A5 | Korean PIPA Feb 2026 amendments and ISMS-P July 2027 deadline are accurate as of research date (2026-04-17) | Korea-Specific Tooling; Stack Patterns by Variant | Regulatory dates shift. Compliance reference library must include "as of" dates and a refresh discipline. Don't hard-code; cite source on every claim. |
| A6 | The audience-guard hook can register as a `PostToolUse` hook on Write tool calls within BRIEF's existing hook system | What's Already Done For Us | If the hook system doesn't support PostToolUse on Write, the audience guard needs a different injection point (e.g., a separate verifier agent run after every milestone). Verify hook surface during DESIGN phase. |
## Open Questions
## Environment Availability
| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Everything | ✓ | (verify locally — must be >=22) | None — hard requirement |
| npm | Install + npx invocations | ✓ | (ships with Node) | None |
| `git` | Atomic-commit infrastructure (inherited) | ✓ (assumed; BRIEF requires) | — | None |
| `npx` | Marp CLI invocation | ✓ (ships with npm) | — | Manual `npm install -g @marp-team/marp-cli` |
| LibreOffice Impress | **Editable** PPTX export from Marp | ✗ (likely missing) | — | Non-editable PPTX (still readable, less editable for end-user) — Marp default mode |
| Chrome/Edge browser | Marp PPTX export (any mode) | likely ✓ | — | None — required for Marp's PPTX renderer |
| Pandoc | Optional fallback if Marp unavailable | likely ✗ | — | Skip; Marp covers the use case |
## Confidence Breakdown
- **Inherited core (Node 22, CJS, node:test, c8, esbuild, vitest):** HIGH — directly verified from BRIEF `package.json` and config.
- **Marp CLI for decks:** HIGH — verified version, recent 2026-03-16 release, multiple comparison sources confirm Marp's PPTX-export advantage for corporate use.
- **gstack and superpowers as patterns-not-deps:** HIGH — verified from PROJECT.md decisions and the actual SKILL.md files of both projects.
- **gray-matter / ajv as supporting libs:** MEDIUM — verified versions, but the "should we add them at all vs. inline" decision depends on assumption A1 (BRIEF's zero-runtime-deps rule).
- **Korean compliance regulatory dates (PIPA Feb 2026, ISMS-P July 2027, CEO liability):** MEDIUM — multiple legal sources agree, but regulatory dates can shift; cite-with-date-stamps in references.
- **Korean tooling absence:** LOW — verified absent in general web search; a Korean-native BMC/OKR tool may exist that wasn't surfaced.

### BRIEF-Specific Stack Notes

- **Runtime dependencies:** Zero (verified via `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0). New supporting libraries (gray-matter, ajv, @marp-team/marp-cli) are invoked via `npx --yes` rather than added to `dependencies` — preserves the GSD-inherited zero-runtime-deps property.
- **Marp CLI:** Invoked via `npx --yes @marp-team/marp-cli@4.3.1` during Phase 8 (DELIVER Type B decks). Users need Chrome/Edge (for rendering) and optionally LibreOffice Impress (for editable PPTX). No npm install.
- **Multi-runtime detection:** Preserved unchanged. The `INSTRUCTION_FILE` env var dispatch lives in `brief/workflows/new-project.md`; the `text_mode` non-AskUserQuestion fallback lives in `brief/bin/lib/core.cjs` / `config.cjs` / `init.cjs`.
- **Business planner workflow:** All workstream artifacts carry `audience:`, `confidentiality:`, and `voice:` frontmatter; the audience guard blocks leakage. OBJECTIVES.md is the single anchor every downstream phase reads.
<!-- BRIEF:stack-end -->

<!-- BRIEF:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- BRIEF:conventions-end -->

<!-- BRIEF:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase. See `docs/ARCHITECTURE.md` for the canonical system architecture documentation.

**Phase 8 architectural responsibility additions** (DELIVER stage — Type A + Type B + Audience Enforcement + Marp):
- 4 NEW lib modules under `brief/bin/lib/`: `deliver.cjs` (Plan 01 Type A synthesis), `voice-fit.cjs` (Plan 02 banned-words density + Korean honorific guard), `leakage-diff.cjs` (Plan 03 Salton-1988 TF-IDF cross-artifact diff), `export.cjs` (Plan 04 7-step orchestration with Marp render via `npx --yes @marp-team/marp-cli@4.3.1`).
- 1 NEW PreToolUse-on-Bash hook: `hooks/brief-validate-frontmatter.sh` (Plan 07 / CC-03 / Layer 4 of 4-layer audience defense). Opt-in via `.planning/config.json hooks.community: true`. Byte-identity inheritance from `brief-validate-provenance.sh`.
- 8 NEW templates under `brief/templates/deliver/`: 4 Type A (`product-brief.md` / `service-policy.md` / `high-level-spec.md` / `feature-map.md`) + 4 Type B (`internal-deck.md` / `proposal-deck.md` / `exec-summary.md` / `decision-memo.md`).
- 3 NEW Marp CSS themes under `brief/templates/deliver/marp-themes/`: `default.css`, `partner.css`, `confidential.css`.
- 2 NEW agents: `agents/brief-deliver-type-a.md` (Plan 05 — parameterized by `{{ARTIFACT}}`) + `agents/brief-deliver-type-b.md` (Plan 06 — Type B internal/proposal/exec/decision artifact set with embedded ban-list + concreteness + Korean honorific rules).
- 2 NEW commands: `commands/brief/deliver.md` + `commands/brief/export.md` (Plan 08 — NET +2 user-facing slash commands).
- 2 NEW workflows: `brief/workflows/deliver.md` + `brief/workflows/export.md` (Plan 08 — orchestration steps).
- 4 NEW brief-tools.cjs case dispatchers: `case 'deliver'` / `case 'export'` / `case 'voice-fit'` / `case 'leakage-diff'` (Plan 08 — mirrors `case 'audience'` byte-identity pattern).
- status.cjs `formatGate` extension: displays Type B force-accept override count + truncated `override_reason` per Pitfall #1 mitigation.
- 2 NEW reference docs: `brief/references/marp-environment.md` (Plan 07) + `brief/references/voice-fit-vocabulary.md` (Plan 02).
<!-- BRIEF:architecture-end -->

<!-- BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE. Preserve across CLAUDE.md template rebuilds. -->

## Surface Caps

BRIEF enforces a minimal command/skill surface for memorability and to prevent bloat (Pitfalls #1 skill bloat and #12 slash-command memorability failure from the inherited GSD pitfall catalog):

- **≤12 user-facing slash commands**
- **≤8 skills**

**Definition of "user-facing":** what `bin/install.js` registers under `commands/<runtime>/brief/` for end-user invocation. Internal helpers, sub-commands routed through a parent command, and template files do NOT count against the cap.

**Rationale:** Command surface memorability degrades rapidly past ~12 items (Miller's Law, applied to CLI surfaces); skill bloat degrades agent selection accuracy as the skill catalog grows. Fixing the cap BEFORE domain features ship in Phase 3-8 prevents the inherited GSD surface from re-expanding.

**Enforcement:** Documentation-only in Phase 2 (per Phase 2 decision D-07). No pre-commit hook, no automated gate in Phase 2 — that would block planner work mid-stream and is out of scope for the stable-seam phase. The audit + pruning runs in **Phase 9 HRD-02** (v1 launch gate).

**Current state:** As of Phase 8 completion (2026-04), BRIEF has the inherited 61 renamed `brief-*` commands plus the per-Phase NET additions: Phase 2 +1 (`/brief-status`), Phase 3 +1 (`/brief-define`), Phase 5 +1 (`/brief-discover`), Phase 6 +0 (return-stack pattern; no new command), Phase 7 +2 (`/brief-design`, `/brief-add-workstream`), and Phase 8 +2 (`/brief-deliver`, `/brief-export`). Total user-facing commands = 68; total agents = 18 inherited + Phase 5 brief-domain-researcher (+1) + Phase 6 brief-gap-detector (+1) + Phase 7 brief-workstream-designer (+1) + Phase 8 brief-deliver-type-a (+1) + brief-deliver-type-b (+1) = 23. Both counts still exceed the cap. The reduction to ≤12 user-facing commands and ≤8 skills is the Phase 9 HRD-02 audit. Subsequent Phases (3-8) MUST NOT add new commands beyond their requirement-mapped set; Phase 8 closure honors this discipline (NET +2 for /brief-deliver and /brief-export only — no audience.md, export-audit.md, voice-fit.md, leakage-diff.md, or other helper commands added).

**Scope clarification:** This cap applies to the *user-facing* command surface defined above. It does NOT constrain:
- Internal `brief/bin/brief-tools.cjs` subcommands (e.g., `brief-tools.cjs state json`, `brief-tools.cjs status`) — these are implementation dispatchers, not user slash commands.
- Workflow markdown files under `brief/workflows/` — these are agent-internal and not user-invocable.
- Reference files under `brief/references/` — these are documentation, not skills.

<!-- BRIEF:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- BRIEF:skills-end -->

<!-- BRIEF:workflow-start source:BRIEF defaults -->
## BRIEF Workflow Enforcement

Before using Edit, Write, or other file-changing tools on planning artifacts, start work through a BRIEF command so the DEFINE → DISCOVER → DESIGN → DELIVER flow stays anchored to OBJECTIVES.md.

Use these entry points (post-Phase-1; the full command surface is populated in subsequent phases):
- `/brief-discuss-phase` for phase-level context capture
- `/brief-plan-phase` for phase planning
- `/brief-execute-phase` for planned phase execution
- `/brief-verify-work` for phase-level verification

Do not make direct repo edits outside a BRIEF workflow unless the user explicitly asks to bypass it.

> Note — Phase 1: The BRIEF domain-specific commands (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`) are not yet implemented. Phase 1 delivers clean fork hygiene; Phases 3–8 add the domain commands.
<!-- BRIEF:workflow-end -->



<!-- BRIEF:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/brief-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- BRIEF:profile-end -->
