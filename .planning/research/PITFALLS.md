# Pitfalls Research

**Domain:** BRIEF — Business Research, Insight & Execution Framework (meta-prompting framework for business strategy planning, hard-forked from GSD)
**Researched:** 2026-04-17
**Confidence:** HIGH (framework pitfalls), MEDIUM (Korea-specific), MEDIUM-HIGH (business deliverable pitfalls)

> Scope: This document catalogs failure modes specific to BRIEF's two unique pressure axes:
> 1. **Meta-prompting framework adoption** — what kills adoption of skills/commands frameworks (lessons from GSD itself, gstack, superpowers, agent-os).
> 2. **Business-planning tool failure modes** — why business-planning AI tools ship slop instead of value.
>
> Generic SaaS/agile pitfalls are out of scope. Every pitfall here is BRIEF-specific.

---

## Critical Pitfalls

### Pitfall 1: Skill/Command Bloat ("More Is Better" Trap)

**What goes wrong:**
BRIEF ships with so many commands/skills/agents that the agent's context fills with irrelevant tool definitions on every spawn. Quality degrades. Hallucinations rise. The framework becomes harder to use the more "complete" it gets.

**Why it happens:**
Each new workstream (BMC, GTM, Financial, Operations, Compliance, Roadmap) feels like it needs its own command, agent, skill, and subagent. Multiplied across 4 phases = 30+ surface artifacts before v1. Each one adds tokens to every Claude Code session even when unused. Documented in agent-os/Claude Code post-mortems: "11 servers configured, several hadn't been used in months, two were duplicative, total tool definitions exposed to Claude were probably 60-80." [CITED: mindstudio.ai/blog/claude-code-skills-common-mistakes-guide]

**How to avoid:**
- Hard cap: max 12 user-facing slash commands at v1 (`/brief-init`, `/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`, `/brief-add-workstream`, `/brief-align`, `/brief-audience-check`, `/brief-compliance-check`, `/brief-status`, `/brief-transition`, `/brief-complete`).
- Agents are spawned by commands (not user-invoked); count toward complexity budget but not slash namespace.
- Skills (auto-invoked) get a separate hard cap: max 8 at v1.
- Every new addition triggers a "what to remove" review.

**Warning signs:**
- A user types `/brief-` and the autocomplete shows >15 entries.
- An agent's spawned context exceeds 30K tokens before doing useful work.
- Two commands sound near-synonymous (`/brief-research-market` and `/brief-market-scan`).
- Claude consistently picks the wrong skill because two skills have overlapping descriptions.

**Phase to address:** **Phase 0 (planning)** — set the cap in CLAUDE.md before writing the first command. **Phase 3 (DELIVER)** verification — surface count audit before v1.

---

### Pitfall 2: Cross-Runtime Prompt Fragility

**What goes wrong:**
BRIEF works in Claude Code (where it's developed and tested) but breaks silently in Codex/Gemini/OpenCode. Users on those runtimes get worse outputs, blame the framework, and abandon it. Worst case: business deliverable is shipped to a client based on a runtime-broken output.

**Why it happens:**
Tool-call format varies across runtimes — Anthropic uses XML `<function_calls>`, OpenAI uses JSON tool_calls, Gemini 3.0 has its own output_schema, some models output Python lists. [CITED: docs.vllm.ai/en/latest/features/tool_calling/, docs.morphllm.com/guides/xml-tool-calls] BRIEF inherits GSD's `INSTRUCTION_FILE` detection and `text_mode` fallback for non-AskUserQuestion runtimes, but **agent prompts** that assume Claude-specific behavior (e.g., XML tool_call examples in prompt text, references to Claude-only features like "thinking blocks", or AskUserQuestion in agent body) leak through that abstraction.

**How to avoid:**
- Enforce runtime-neutral prompt language in agent specs: never use vendor-specific terminology in prompt body (no "AskUserQuestion", no "antml:", no "thinking", no "MCP" assumed available).
- Runtime-specific behavior goes through `runtime detection -> branch` helpers, not inline in prompts.
- For each agent, add a `cross_runtime_test` hook: smoke-run the agent in Codex and Gemini before declaring it shipped.
- Document the lowest-common-denominator capability surface in CLAUDE.md.

**Warning signs:**
- An agent prompt contains `<askuserquestion>` or `<thinking>` tags as instructions.
- A command's example output uses XML tool calls that other runtimes don't render.
- A user reports "this gives different output in Codex" — investigate immediately, not later.
- A test passes in Claude Code but no equivalent test exists for other runtimes.

**Phase to address:** **Phase 1 (DISCOVER architecture research)** — codify the LCD surface. **Phase 2 (DESIGN)** — every agent ships with a cross-runtime smoke test.

---

### Pitfall 3: OBJECTIVES.md Anchor Drift

**What goes wrong:**
OBJECTIVES.md is set in Phase 0 (DEFINE) and intended to anchor every downstream artifact via the ALIGN gate. In practice, by the time a planner reaches DESIGN's third workstream, OBJECTIVES.md has been ignored, mentally amended, or contradicted — but never updated. The ALIGN gate either passes everything (theater) or flags everything (noise). The anchor function fails silently.

**Why it happens:**
Documentation drift is a well-documented anti-pattern: "outdated documentation may refer to features that no longer exist or old ways of using parts of the codebase, causing developers to waste hours trying to use features that no longer exist." [CITED: gaudion.dev/blog/documentation-drift, docsie.io/blog/glossary/documentation-drift] In BRIEF, drift is worse because (a) the document is conversational (intent), not mechanical (spec); (b) every workstream's research surfaces NEW reasons to refine objectives; (c) updating OBJECTIVES.md mid-phase feels like "moving the goalposts."

**How to avoid:**
- ALIGN gate emits **three** outputs, not pass/fail: ALIGNED / DRIFTED-objective-needs-update / DRIFTED-output-needs-revision. Force the user to choose, not just acknowledge.
- Every milestone completion auto-prompts: "Did this workstream surface new objectives? Y/n". Default Y triggers an OBJECTIVES.md amendment workflow.
- OBJECTIVES.md carries a `last_amended` timestamp and a **change log table**. Any amendment >48h old without re-validation against in-flight workstreams triggers a "stale anchor" warning.
- The DEFINE-phase output explicitly distinguishes **immutable intent** (the dream-state) from **mutable hypotheses** (current best guess at how to achieve it). Only the latter is allowed to drift; drift in the former requires explicit user re-confirmation.

**Warning signs:**
- ALIGN gate passes 100% of milestones (gate is theater).
- ALIGN gate fails 100% of milestones (anchor is wrong, but no one's updating it).
- A workstream's recommendation directly contradicts OBJECTIVES.md and no one notices.
- The user describes the project differently in conversation than OBJECTIVES.md says.

**Phase to address:** **Phase 0 (DEFINE)** — design OBJECTIVES.md schema with mutability layers from the start. **Phase 2 (DESIGN)** — implement the three-output ALIGN gate. **Phase 3 (DELIVER)** — final ALIGN gate must reconcile any pending drift before shipping.

---

### Pitfall 4: Compliance Checkbox Theater

**What goes wrong:**
The compliance checker runs on every milestone, lists 47 ISMS-P/PIPA/SOC 2/GDPR checkboxes, marks all green, and the user ships. Six months later: a real audit finds material gaps because the checker was matching keywords ("encryption mentioned ✓") not validating substance ("encryption-at-rest documented with key rotation policy and tested recovery procedure ✓").

**Why it happens:**
PIPA explicitly forbids single-checkbox-covers-all consent: "South Korean law does not allow a single blanket consent checkbox to cover all data processing activities... an additional specific, separate consent is required in respect of each one of several classes of data processing." [CITED: practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea] If BRIEF ships a single "compliance checked ✓" output, it's modeling exactly the failure pattern the regulator banned. AI checkers easily fall into this — pattern-match on keywords, miss the underlying obligation.

The 2026 PIPA amendment ties fines to **CEO accountability** and revenue (up to 10% of total revenue). [CITED: hunton.com/privacy-and-cybersecurity-law-blog/south-korea-amends-privacy-law-to-authorize-fines-of-up-to-10-of-total-revenue, iapp.org/news/a/south-korea-overhauls-pipa-and-ties-fines-to-ceo-accountability] A green-checkbox compliance report from an AI tool, used to brief a CEO, is now an active liability.

**How to avoid:**
- Compliance checker outputs **findings** (with evidence cited from the artifact and the regulation), not green/red flags. Findings format: `{regulation_clause} | {required_evidence} | {found_in_artifact} | {gap}`.
- Hard rule: NO checker output uses the word "compliant" or a green check. Use language like "Documented obligations addressed:" / "Obligations needing further work:" / "Obligations BRIEF cannot verify (requires human counsel):".
- Every BRIEF compliance report carries a mandatory disclaimer: "This is not legal advice. The framework's findings are starting points for review with qualified counsel."
- Maintain a separate, auditable `compliance_evidence_log.md` per project — every claim made by the checker is tied to a specific source clause + artifact line.
- For Korea: include explicit checks against "dark patterns" since PIPC is monitoring for these. [CITED: practiceguides.chambers.com 2026]

**Warning signs:**
- Compliance report has rows of green checkmarks.
- The user is "submitting" BRIEF compliance output as their compliance documentation.
- A regulation cited has no clause-level reference (e.g., "PIPA compliant" — which article?).
- A claim like "GDPR-compliant" appears with no DPIA, no Article 30 register, no Article 28 processor terms cited.

**Phase to address:** **Phase 1 (DISCOVER compliance research)** — build the regulation-clause-level reference library. **Phase 2 (DESIGN compliance workstream)** — design the findings-not-checks output format. **Phase 3 (DELIVER)** — disclaimer + human-review handoff is part of every Type B artifact.

---

### Pitfall 5: Audience Leakage in Type B Artifacts

**What goes wrong:**
The user runs `/brief-deliver` which produces an INVESTOR-IR deck and a DECISION-MEMO in the same session. The DECISION-MEMO contains internal-only language about competitive vulnerabilities, founder doubts, and unproven assumptions. Audience guard catches it on the deck but not the memo. The user attaches the wrong file to an investor email.

**Why it happens:**
The most common confidentiality leak cause is human error: "an employee sending the wrong email attachment, discussing a deal over an unsecured video call, or storing files in a shared folder by mistake." [CITED: imatag.com/blog/types-of-information-leaks-threatening-brands-their-impact-on-business] An audience guard that runs **only at generation time** doesn't prevent the after-generation footgun. Worse: if multiple artifacts coexist in the same `.planning/deliverables/` folder, the user picks by filename and frontmatter is invisible.

**How to avoid:**
- **Filename encoding** of audience: `INVESTOR-IR.external.deck.md` vs `DECISION-MEMO.internal-confidential.memo.md`. Audience is in the filename, not just frontmatter.
- **Watermark**: Every internal/confidential artifact gets a literal first-line banner: `<!-- INTERNAL-CONFIDENTIAL: do NOT distribute outside {organization}. Generated {date} by BRIEF. -->`. The banner is also in the rendered output (not just markdown comment).
- **Cross-artifact leakage check**: When two artifacts of different audiences exist, the audience guard runs a **diff check** — if internal-only language appears in an external artifact, flag.
- **Audience-mismatch confirmation**: A `/brief-export` step is required before any artifact leaves `.planning/deliverables/`. The export step displays audience and asks for confirmation.
- **Voice and audience are separate guards**: voice = tone/register match (e.g., 존댓말 for Korean external), audience = information appropriateness. Both checked, separately.

**Warning signs:**
- Two artifacts in the same folder have different audiences but identical filename stems.
- A confidential artifact has no audience banner in its rendered output.
- The user uses `cp` / drag-and-drop to share artifacts (bypasses any check).
- An external artifact contains the words "we believe", "TBD", "still proving", "concern", "risk we haven't solved" — internal hedging.

**Phase to address:** **Phase 2 (DESIGN audience guard)** — design the filename encoding + watermark + export step. **Phase 3 (DELIVER)** — every Type B artifact passes audience guard before being written; export step is mandatory.

---

### Pitfall 6: Hallucinated Market Data and False Precision

**What goes wrong:**
Phase 1 (DISCOVER) market researcher agent produces a TAM/SAM/SOM analysis with cited numbers ("Korean SaaS market: ₩4.7 trillion in 2025, growing 23.4% YoY"). Numbers go into Phase 3 INVESTOR-IR deck. Investor checks; numbers are wrong or fabricated. Founder's credibility is destroyed.

**Why it happens:**
Documented hallucination rates in financial AI are catastrophic for investor-facing work: "27% hallucination rate in earnings predictions beyond 2 quarters and 18% of AI-generated VaR calculations contain unsupported assumptions." [CITED: baytechconsulting.com/blog/hidden-dangers-of-ai-hallucinations-in-financial-services, biztechmagazine.com/article/2025/08/llm-hallucinations-what-are-implications-financial-institutions] LLMs predict probable word sequences, not truth — when they lack data, they generate statistically likely numbers. False precision compounds the problem: 23.4% sounds rigorous; 23% would be questioned. [CITED: jirav.com/blog/precision-vs-accuracy-financial-modeling, fe.training/free-resources/financial-modeling/financial-modeling-errors] Excel-style models can produce "0.00000000000000123" — meaningless precision.

**How to avoid:**
- **Source-mandatory mode** for any quantitative claim in DISCOVER outputs: the researcher agent MUST cite a URL + access date for every number. No URL = number cannot appear.
- **Confidence bands instead of point estimates**: "₩4–6 trillion (range from 3 sources, 2025)" rather than "₩4.7 trillion". Round aggressively.
- **Number provenance tagging**: every quantitative claim in any BRIEF artifact carries inline provenance — `[VERIFIED:source-url|date]`, `[ASSUMED:reasoning]`, `[FOUNDER-INPUT]`. Same pattern as GSD's claim provenance system.
- **Hard rule**: financial models in Phase 2 use **driver-based bottom-up** approach (leads × conversion × ACV × cycles), not top-down market-share assertions. This is the same advice every modeling guide gives. [CITED: alphaapexgroup.com/blog/financial-modeling-mistakes, forecastr.co/blog/financial-modeling-mistakes]
- **Investor-facing artifact gate**: any number in a Type B external artifact must trace back to a `[VERIFIED:...]` claim or a `[FOUNDER-INPUT]` claim. `[ASSUMED]` claims cannot ship to investors without conversion to one of the others.

**Warning signs:**
- A researcher agent produces a "growing 23.4% YoY" number without a source URL.
- Two BRIEF research outputs cite the same statistic with different numbers.
- A financial model in DESIGN shows revenue projections to 4 decimal places.
- The Phase 3 deck cites "industry research shows..." without a source.

**Phase to address:** **Phase 1 (DISCOVER)** — source-mandatory mode in researcher agents. **Phase 2 (DESIGN)** — driver-based modeling pattern; provenance tags propagate. **Phase 3 (DELIVER)** — investor-facing gate blocks unverified numbers.

---

### Pitfall 7: Bidirectional Phase 1 ↔ Phase 2 Infinite Loop

**What goes wrong:**
The auto gap-detection in DESIGN identifies a missing piece in DISCOVER, triggers return-to-Phase-1, which produces new findings, which surface a new gap in DESIGN, which triggers return-to-Phase-1 again. The user is stuck in a research-design oscillation, paying tokens, never converging on a deliverable.

**Why it happens:**
"Infinite handoff loops occur when Agent A passes to B, B passes to C, and C passes back to A — identified as the number one failure mode in multi-agent systems. Each agent keeps replanning because nobody owns the task." [CITED: beam.ai/agentic-insights/multi-agent-orchestration-patterns-production, learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns] Convergence failure is the canonical multi-agent pitfall. BRIEF's bidirectional flow is designed to be iterative but lacks an iteration cap or a meta-arbiter.

**How to avoid:**
- **Hard iteration cap**: max 3 Phase-1↔Phase-2 round-trips per workstream. After 3, escalate to user with a "decide and proceed with documented gap" prompt.
- **Owner principle**: every gap, when detected, has a single owner — either Phase 1 (research it) or Phase 2 (proceed with documented assumption). The orchestrator decides ownership; not the agents.
- **Gap criticality classification**: gaps tagged `BLOCKING` (cannot proceed without), `MATERIAL` (proceed but document), `NICE-TO-HAVE` (defer to v2). Only BLOCKING gaps trigger return-to-Phase-1.
- **Convergence telemetry**: orchestrator tracks round-trip count per workstream, exposes via `/brief-status`. Visible thrash = forced escalation.
- **Meta-arbiter prompt** at iteration 2: "We've gone back to research twice for {topic}. Is this gap genuinely blocking, or are we polishing? Pick: keep researching / proceed with assumption / cancel workstream."

**Warning signs:**
- A workstream has been "in progress" for >2 days without a milestone completion.
- The same research question appears in multiple Phase-1 reruns.
- Token spend on a single workstream exceeds 100K with no deliverable.
- The user has manually skipped past a gap-detection prompt.

**Phase to address:** **Phase 2 (DESIGN orchestration design)** — iteration cap + owner principle + gap classification. **Phase 0 (planning)** — convergence telemetry must be in MVP.

---

### Pitfall 8: Fork Drift from Upstream GSD

**What goes wrong:**
BRIEF is forked from GSD with `backup/original-gsd` branch retained for reference. Six months later, GSD has shipped 200+ commits including critical bug fixes (e.g., `fix(hooks): check CLAUDECODE env var in read-guard skip` [CITED: visible in current GSD git log]) and new runtime detection improvements. BRIEF needs them but cannot cherry-pick because the codebases have diverged so far that every cherry-pick is a manual conflict resolution.

**Why it happens:**
"Fork drift occurs when your customized codebase diverges so significantly from the upstream project that rebasing becomes increasingly difficult or practically impossible. This leads to increased maintenance burden as cherry picking and rebasing compounds (possibly exponentially) with each change." [CITED: preset.io/blog/stop-forking-around-the-hidden-dangers-of-fork-drift-in-open-source-adoption, nickdesaulniers.github.io/blog/2023/02/01/forking-is-not-free-the-hidden-costs] The hard rename (`gsd-*` → `brief-*`) makes EVERY upstream commit conflict by definition: every changed line touches a renamed identifier.

**How to avoid:**
- **Layered architecture with a stable seam**: GSD core primitives (state lock, multi-agent orchestration, context engine, runtime detection) live in `core/` with no `brief-` rename. Only the user-facing layer (commands, agents, prompts, CLAUDE.md) is renamed. This isolates rename damage to the layer that doesn't change often upstream.
- **Upstream-watch process**: weekly cron / manual `git fetch upstream main && git log HEAD..upstream/main --oneline | grep -E 'fix|security'` review. Cherry-pick critical fixes promptly while the diff is small.
- **Mapping table**: maintain `docs/upstream-mapping.md` documenting which BRIEF files correspond to which GSD files, so a future merge knows where to apply.
- **Atomic commits**: each BRIEF commit is single-purpose so reverts/cherry-picks are clean. [CITED: joaquimrocha.com/2024/09/22/how-to-fork/]
- **Quarterly upstream sync milestone**: explicit milestone in BRIEF roadmap, every 3 months, just to ingest upstream improvements. Budget time for it.
- **Document explicit non-pull patterns**: list which GSD subsystems BRIEF will NEVER pull from (e.g., GSD's UI checker, code review, AI eval). Don't waste cycles considering them.

**Warning signs:**
- It's been >60 days since the last upstream-watch review.
- A user reports a bug that was fixed in GSD weeks ago.
- A cherry-pick attempt produces 20+ conflicts.
- The `core/` layer has been modified (smell — should be untouched).

**Phase to address:** **Phase 0 (planning)** — design the layered architecture with stable seam BEFORE the rename. **Phase 1 (DISCOVER architecture)** — codify upstream-watch process. **Cross-cutting** — quarterly sync milestone in roadmap.

---

### Pitfall 9: Non-Developer User Friction (Terminal Fear)

**What goes wrong:**
BRIEF's target users are business planners, PMs, founders, strategy consultants. Most of them have never opened a terminal. They install Claude Code, run `/brief-init`, see a wall of text and a JSON config file, and never come back. The framework is technically excellent but unused.

**Why it happens:**
"The terminal interface is what stops many people from trying Claude Code... users have a real fear that one wrong command might nuke their system." [CITED: makeuseof.com/i-was-scared-of-the-terminal-until-i-tried-claude-code, producttalk.org/claude-code-what-it-is-and-how-its-different] BRIEF inherits all of GSD's developer-tool ergonomics: file paths, JSON config, git commits, shell commands. Even the documentation pattern (CLAUDE.md, slash commands, frontmatter) is developer-mental-model.

**How to avoid:**
- **Conversational `/brief-init`**: ask 3 questions in plain language ("What are you trying to figure out?", "Who's this for?", "When do you need it?"), generate everything else. Never ask the user to edit JSON.
- **Plain-language artifact names**: `business-plan.md` not `BMC.workstream.artifact.md`. Keep BRIEF's internal taxonomy hidden from artifact filenames the user sees.
- **Banner help in every output**: "Next: run `/brief-discover` to research your market. Or type `help`."
- **Forbidden vocabulary** in user-facing output: no "agent", "subagent", "spawn", "orchestrator", "runtime", "context window". Translate to "researcher", "analyst", "step".
- **README.md targets the business user, not the developer**: lead with "What you can do" + 3 example sessions. Move installation to an appendix.
- **Watch for `/brief-help` usage**: if usage is high, the framework is too intimidating. If usage is zero, no one's bothering.
- **Sample-project bootstrap**: `/brief-init --example fintech-mydata` generates a worked example the user can read before starting their own.

**Warning signs:**
- A real user gets stuck in the first 5 minutes (watch a session if possible).
- Documentation needs the word "configure" or "edit the JSON".
- A planner asks "what does spawn mean?".
- Adoption stalls at install — users install, never return.
- User-facing error messages contain stack traces or file paths.

**Phase to address:** **Phase 0 (DEFINE)** — establish "non-developer first" as a CLAUDE.md constraint. **Phase 2 (DESIGN UX)** — every command's first-time UX is conversational. **Phase 3 (DELIVER)** — README.md is rewritten for the business user. Pre-launch usability test with at least 3 non-developer planners.

---

### Pitfall 10: AI Slop in Business Deliverables (Corporate Speak)

**What goes wrong:**
BRIEF's Type B artifacts (INVESTOR-IR, EXEC-SUMMARY, PROPOSAL-DECK) come back full of "leverage", "synergize", "transform", "delve", "groundbreaking", "holistic", "robust", "best-in-class", "innovative". The reader's eye glazes. The artifact is immediately recognizable as AI-generated. Credibility damage.

**Why it happens:**
"AI tools like ChatGPT are trained on large volumes of poorly written marketing and technical content filled with jargon, which is why AI writing is filled with meaningless babble like 'groundbreaking,' 'game-changing,' 'landscape,' 'delve,' and 'holistic'... AI models are built on a statistical model of past language use, and since much business writing is saturated with words like 'leverage,' 'optimize,' 'transform,' and 'facilitate,' the AI naturally gravitates toward these overused terms." [CITED: storytellingedge.substack.com/p/the-corporate-jargon-flywheel-from, finnpartners.com/news-insights/i-asked-ai-to-kill-business-jargon-heres-what-happened] "Slop" was Merriam-Webster's 2025 Word of the Year. [CITED: fisherphillips.com/en/news-insights/how-employers-can-get-smarter-about-ai-use-in-2026] Trust impact: "31% of office employees think managers using corporate jargon appear insincere." [CITED: storytellingedge.substack.com]

**How to avoid:**
- **Banned-words list** baked into Type B artifact agents: `leverage`, `synergize`, `transform`, `holistic`, `delve`, `groundbreaking`, `best-in-class`, `seamless`, `cutting-edge`, `revolutionary`, `game-changing`, `landscape`, `unlock`, `empower` (when verbed), `robust`, `innovative` (when adjectival modifier without specifics). Agent generation post-processes; if banned word appears, regenerate that sentence with constraint.
- **Concreteness check**: every claim in a Type B artifact must answer "compared to what?" / "by how much?" / "when?". A sentence like "we deliver innovative solutions" fails. "We reduce 15-person legal review cycles from 3 weeks to 4 days" passes.
- **Voice-fit guard already in audience guard**: extend it to detect "generic-AI-sounding" patterns (high word count, low specific-number density, abstract verbs).
- **Style examples mandatory**: each Type B artifact agent ships with 2-3 hand-written exemplars of good writing in its prompt context. Models match style of recent context.
- **Korean-language gotcha**: Korean business writing has its own AI-slop pattern — overuse of "혁신적인", "최고의", "세계 최초의", "차별화된" without specifics. Same banned-words principle applies in Korean. (See Pitfall 11.)

**Warning signs:**
- An artifact has >2 banned words per page.
- Sentences with 0 specific numbers, dates, or named entities.
- The artifact reads identically whether the company is a fintech or a bakery — generic.
- A reviewer says "this sounds like AI" or "this could be about anything."

**Phase to address:** **Phase 2 (DESIGN — Type B artifact agent design)** — banned-words list + concreteness check are in agent prompt. **Phase 3 (DELIVER)** — every Type B output passes voice-fit guard before being written. Manual user review of the first artifact in each new project, before automation is trusted.

---

### Pitfall 11: Korean-Market and Non-English Cultural Gotchas

**What goes wrong:**
BRIEF generates a Korean-language pitch deck for a Korean planner. The deck addresses the senior investor (회장님) using 반말 because the agent didn't internalize honorific systems. The team slide is buried at the end (Western pitch order) when Korean investors weight team-trust earliest. The English version says "10x growth" with no equivalent Korean idiom; the Korean version literally translates to "10배 성장" which is jargon-y. The investor reads condescension.

**Why it happens:**
Korean business culture: "Recognizing the importance of hierarchy in Korean business culture, a negotiator might address the most senior person in the room first to show respect." [CITED: linkedin.com/pulse/pitching-korean-investors-business-culture-tips-etiquette-kocken] Pitch order: "in collectivist cultures like South Korea, the team slide should be presented earlier and given more weight, as trust in the people behind the business is paramount." [CITED: masterrvdesigners.com/guides/ultimate-guide-to-pitch-deck-design-trends/localized-market-specific-deck] Bilingual decks expected: "produce your slide deck in both languages." [CITED: seoulz.com/korean-startups-need-to-perfect-their-pitches-to-get-funded] The MyData regulatory regime, ISMS-P certification, and 2026 PIPA amendment all create Korea-specific compliance vocabulary that doesn't translate cleanly. [CITED: lexology.com/library/detail.aspx?g=885e19c7-55aa-4da4-9a7d-c1bcbb3bb9d3, iapp.org/news/a/south-korea-overhauls-pipa-and-ties-fines-to-ceo-accountability]

**How to avoid:**
- **Region context injection**: every spawned agent inherits `{region: KR-or-other, business_register: 존댓말-or-반말}` as context. Same pattern as B2B/B2C injection.
- **Korean honorific guard**: when generating Korean text for external/investor audiences, default to 하십시오체 (formal). For internal docs, allow 해요체 (polite-informal). Reject 해체/반말 in any external artifact.
- **Pitch-order awareness**: deck templates include `region: KR` variant where team slide is positioned at slide 3-4, not 8-10. Western variant keeps team late.
- **Bilingual artifact pairs**: when target audience is Korean, generate both `.ko.md` and `.en.md` pair, with explicit translation step (not just literal — idiomatic equivalents).
- **Korea-specific compliance reference library**: ISMS-P, PIPA (with 2026 amendments), e-금융거래법 / 전자금융거래법, 의료기기법, MyData / 신용정보법, 정보통신망법 — all stored as clause-level reference data, not just keyword lists. Korea-first per PROJECT.md context.
- **Idiom-substitution table**: "10x growth" → "비약적 성장" or "두 자릿수 배수 성장" (idiomatic) rather than "10배 성장" (literal). Maintain a curated business-idiom translation table for high-frequency phrases.
- **Jonior investor culture note in Type B agent prompts**: "Korean investors weight founder reliability and long-term relationship signals heavily. Trust is built before terms are discussed."

**Warning signs:**
- A Korean external artifact uses 반말 anywhere.
- Korean investor deck has team slide after slide 6.
- A Korean translation reads like literal English (e.g., "우리는 솔루션을 제공합니다" — direct translation, sounds like AI).
- A Korean compliance section uses English regulation names without 한글 equivalents (PIPA without 개인정보보호법).
- A bilingual deck has different content in EN vs KO (translation drift).

**Phase to address:** **Phase 1 (DISCOVER region research)** — build Korea reference library. **Phase 2 (DESIGN region-aware agents)** — region context injection + honorific guard + pitch-order awareness. **Phase 3 (DELIVER)** — bilingual artifact pairs + idiom-substitution applied.

---

### Pitfall 12: Slash Command Memorability Failure

**What goes wrong:**
BRIEF ships 12 commands. After a week away, the user remembers only `/brief-init`. They try `/brief-research` (doesn't exist — it's `/brief-discover`), `/brief-plan` (doesn't exist — it's `/brief-design`), `/brief-finalize` (doesn't exist — it's `/brief-deliver`). They give up and ask Claude Code in plain language, missing all the orchestration value.

**Why it happens:**
"A poorly designed DSL can be too hard to adopt by its domain users... the more elements you add to a naming convention, the harder it is to gain adoption and to use them consistently." [CITED: dl.acm.org/doi/10.1145/3136014.3136027, valoremreply.com/resources/insights/blog/2021/november/cloud-naming-convention] BRIEF's 4D naming (DEFINE/DISCOVER/DESIGN/DELIVER) is mnemonic for the framework author but not for users — research, plan, finalize are more intuitive verbs. Conversely, switching to intuitive verbs loses the framework structure that makes BRIEF a "framework."

**How to avoid:**
- **Verb aliases**: `/brief-research` → `/brief-discover`, `/brief-plan` → `/brief-design`, `/brief-finalize` → `/brief-deliver`. Both work; canonical is the 4D name. Aliases listed in `/brief-help`.
- **`/brief-help` is rich**: not just a list, but "What are you trying to do?" with mappings: "I want to figure out what I'm building" → `/brief-define`. "I want to research my market" → `/brief-discover`.
- **Suggestion on miss**: if user types `/brief-foo`, suggest the closest 3 commands (Levenshtein distance) with one-line descriptions.
- **Status-aware suggestions**: `/brief-status` shows next likely command based on phase. If in DEFINE-complete state, top suggestion is "Next: /brief-discover".
- **Command count cap = memorability cap**: 12 is at the upper limit of what someone can recall. Stay under it. (See Pitfall 1.)
- **Mnemonic tests**: before shipping a command, pilot with 3 non-author users. Can they recall the name 24 hours later? If <50%, rename.

**Warning signs:**
- Bug reports / questions where user typed a command that doesn't exist.
- `/brief-help` usage is the #1 invoked command (means people forget the others).
- A user reports completing work without using any BRIEF commands ("I just chatted with Claude").
- The author needs to consult `/brief-help` to remember a command.

**Phase to address:** **Phase 0 (planning)** — define the 4D naming + alias scheme. **Phase 2 (DESIGN UX)** — `/brief-help`, suggestion-on-miss, status-aware suggestions all built. **Phase 3 (DELIVER)** — pre-ship pilot test for memorability.

---

### Pitfall 13: Framework Specialization Lock-In (vs. General-Purpose GSD)

**What goes wrong:**
BRIEF over-specializes for business planning. Six months in, a user wants to add a new research dimension (e.g., "supply chain analysis") that doesn't fit BRIEF's 4D model. They have to fork BRIEF, modify the orchestrator, navigate region/B2B/B2C injection plumbing. The user gives up. Or worse: BRIEF becomes a library of 47 special-purpose subagents, none reusable, all needing maintenance.

**Why it happens:**
General-purpose tools like GSD survive because their primitives (state lock, orchestration, context engine) work for any domain. Specialized tools die because they encode domain assumptions deep in the architecture. "Treating more as automatically better — more tools, more instructions, more in one place." [CITED: mindstudio.ai/blog/claude-code-skills-common-mistakes-guide] The BRIEF design dynamic (`/brief-add-workstream` reusing gsd-new-milestone pattern) is good, but the workstreams themselves are first-class, not configurable.

**How to avoid:**
- **Workstream-as-configuration**: every built-in workstream (BMC, GTM, Financial, Operations, Compliance, Roadmap) is defined as a `workstream-spec.yaml` file. New workstreams are added by writing a yaml, not by writing code or new agents.
- **Five-line `workstream-spec.yaml` minimum**: name, description, research-prompts, design-prompts, output-artifact-template. If it requires more than that, the workstream is too coupled.
- **Generic researcher agent**: ONE researcher agent, parameterized by workstream-spec, not 8 different researcher agents.
- **Generic designer agent**: ONE designer agent, parameterized.
- **Region/B2B-C as orthogonal dimensions**: not encoded into workstream specs; injected from project config at runtime.
- **`/brief-add-workstream` produces a yaml stub the user edits, not a code generator**. Lower the bar to extension.

**Warning signs:**
- A new workstream requires a new agent file.
- A new region or compliance regime requires editing the orchestrator.
- The codebase has `if business_model == "B2B"` checks scattered across files.
- Users ask for features that "would be easy in GSD."

**Phase to address:** **Phase 0 (planning)** — workstream-as-yaml architecture must be the v1 design. **Phase 1 (DISCOVER architecture)** — define the workstream-spec schema before building any built-in workstream. **Phase 2 (DESIGN)** — built-in workstreams ship as exemplars of the yaml pattern, not as bespoke code.

---

### Pitfall 14: Dogfooding Trap (Building BRIEF With GSD)

**What goes wrong:**
PROJECT.md states: "this project itself is being built using GSD, so the .planning/ directory will document where GSD breaks for business-domain work — feeding BRIEF's design." Excellent intent. Practical risk: GSD is optimized for code projects. BRIEF is a code project (it ships as a Node.js package), so the dogfooding looks fine. But the dogfooding misses the actual gap: how would a BUSINESS PLANNER use BRIEF, when their work is not code? The team builds BRIEF with confidence it works, ships, and discovers the actual users hit walls the dogfooding never surfaced.

**Why it happens:**
Selection bias in user research. The team building BRIEF is comfortable in a terminal, knows GSD's conventions, and reads error messages. Real BRIEF users may not. "If teams build what they think developers need rather than what developers actually struggle with, adoption stays at zero while you burn millions." [CITED: platformengineering.org/blog/what-does-a-platform-product-manager-do]

**How to avoid:**
- **Two-track dogfooding**:
  - Track A — code-project dogfooding (current plan): build BRIEF with GSD, capture friction. This is the dev-experience signal.
  - Track B — business-project dogfooding: pick a real business-planning problem (not BRIEF itself), use BRIEF (even mid-build) to plan it. This is the user-experience signal.
- **Friction journal**: keep a running `dogfooding-friction.md` log. Every "ugh, this is awkward" moment becomes a backlog item.
- **External pilot before v1**: at least 2 real planners (not on the build team) use BRIEF for a real project, observed. Before any public launch.
- **Distinguish framework bugs from domain bugs**: when something goes wrong, is it because GSD-the-engine has an issue, or because BRIEF-the-business-layer doesn't yet model the business need? Different fix locations.

**Warning signs:**
- The only people who've used BRIEF end-to-end work on the BRIEF team.
- Track B (business dogfooding) keeps being deferred for "after we ship the next workstream."
- Friction journal entries are all about CLI quirks, none about business-domain misfits.
- Internal demos look great, external pilots stall.

**Phase to address:** **Phase 0 (planning)** — establish the two-track dogfooding rhythm. **Phase 1 onwards** — Track B begins as soon as `/brief-init` and one workstream are minimally functional.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode workstream agents (one per workstream) instead of yaml-driven | Ship faster; fewer abstraction layers | Adding any new workstream requires a developer; user can't extend; each agent drifts independently | Never for v1 — locks in Pitfall 13. Acceptable as a stopgap for ONE new workstream while yaml schema is being designed. |
| Skip cross-runtime testing; rely on Claude Code only | 4x faster test loop; no Codex/Gemini setup | Silent breakage on other runtimes; user trust collapse on first cross-runtime bug report; reputation damage | Acceptable for v0.x experimental builds NOT marketed as cross-runtime. Never for shipped versions. |
| Use single audience flag (internal/external) instead of granular (internal-confidential / internal-team / external-partner / external-public / external-regulator) | Simpler frontmatter; faster to author | Audience leakage — confidential mistaken for team, partner mistaken for public; audience guard misses real misclassifications | Acceptable for v1 IF accompanied by a roadmap commitment to granularize in v1.x. Document the limitation visibly. |
| Compliance checker uses keyword matching instead of clause-level evidence | Compliance checker ships in 1 week instead of 6 | Pitfall 4 — checkbox theater; user submits BRIEF output as compliance evidence; CEO liability under 2026 PIPA amendments | NEVER. Even v0.x should output "findings, not checks" wording. |
| Skip the `[VERIFIED|ASSUMED|FOUNDER-INPUT]` provenance tagging on quantitative claims | Researcher outputs are cleaner-looking | Pitfall 6 — hallucinated numbers ship to investors; founder credibility destroyed | Never for any quantitative claim. Acceptable for qualitative claims only. |
| Single-language (English-only) at v1, defer Korean | Faster v1 ship | Korea-first is in PROJECT.md; English-only contradicts the documented core value; loses primary market | Never. Korean parity is v1 launch criterion per PROJECT.md. |
| Skip iteration cap on Phase 1↔Phase 2 loops | Simpler orchestrator | Pitfall 7 — infinite loop, token burn, user abandonment | Never. Cap is mandatory v1 feature. |
| Maintain GSD compatibility shims for backwards-compat with `gsd-*` commands | Lower migration friction for GSD users | Permanent dual-vocabulary confusion; PROJECT.md explicitly rejects this | Never per PROJECT.md "no aliases" decision. Honor that decision. |
| Skip upstream-watch process; treat fork as fully independent | No process overhead | Pitfall 8 — miss critical GSD bug fixes; security exposure; eventually re-fork required | Acceptable only if BRIEF formally declares independence from GSD core (e.g., a hard rewrite milestone). Until then, watch is mandatory. |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Claude Code skills system** | Skill descriptions overlap, so Claude inconsistently picks the wrong one (e.g., `audience-guard` and `voice-check` both fire on Type B output). | Each skill's description must list explicit invocation triggers AND explicit non-triggers. Test skill selection on 10 sample prompts before shipping. |
| **Codex / Gemini / OpenCode runtime** | Assuming `AskUserQuestion` works everywhere. It doesn't. Falling back to `text_mode` silently degrades the experience. | Detect runtime up front (existing GSD pattern); for non-AskUserQuestion runtimes, the conversational flow uses `INSTRUCTION_FILE` exchanges. Document the UX difference; do not pretend it's identical. |
| **Atomic commits (gsd-tools.cjs commit)** | Mass renames + content changes in a single commit during the GSD→BRIEF transformation; impossible to bisect or cherry-pick. | Stage 1: pure rename commit (only `gsd-*` → `brief-*`, no content change). Stage 2: content/behavior commits, each scoped to one capability. This pattern also helps Pitfall 8 (cherry-picking from upstream). |
| **GSD STATE.md file lock** | Adding business-domain fields to STATE.md schema without versioning; breaks any tooling that reads STATE.md. | STATE.md gets a `schema_version` field at the BRIEF transformation. Any added field is in a `brief_extensions:` block, isolated from core. |
| **Korean encoding (UTF-8)** | Generating Korean output in environments that default to non-UTF-8 (Windows cmd.exe, some CI runners) — characters become mojibake. | Force UTF-8 in BRIEF's Node.js process startup. Test on Windows specifically. Display a runtime warning if locale is not UTF-8. |
| **PIPA / GDPR / SOC 2 reference library** | Embedding regulation text directly in agent prompts (each agent carries 50KB of regulation text in every spawn). | Reference library lives in `.claude/skills/compliance-{region}/`. Agents request specific clauses via a tool call, not by carrying the full text. |
| **MyData operator vocabulary** | English BRIEF output uses "MyData operator" loosely without distinguishing from "MyData business" (licensed term). | Compliance vocabulary glossary; checker enforces canonical Korean terms (마이데이터 사업자) when context is Korean financial. |
| **Investor deck export** | Exporting markdown to PDF without a polish pass; output looks like documentation, not a deck. | The export step is a separate command (`/brief-export deck`) that runs a polish pass: typography check, banned-words check, audience banner verification, page-break heuristics. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Spawning 6-8 parallel research agents (per Phase 1 spec)** | Token spike on Phase 1 entry; Claude Code rate limits; spawn errors. | Cap concurrent agent spawns at 3-4 (per Anthropic best practice on agent teams [CITED: claudefa.st/blog/guide/agents/agent-teams]). Stage research in waves. Use a job queue, not raw `Task` calls. | Breaks at first run on Free/Pro tier; breaks at 6+ workstreams on Team tier. |
| **OBJECTIVES.md grows unbounded as planner amends it** | OBJECTIVES.md hits 50KB; every agent that loads it bloats. | Hard cap: OBJECTIVES.md max 5KB. Amendments replace, not append. Old versions go to `OBJECTIVES.history.md` (not loaded by agents). | Breaks on long projects (>2 weeks) where intent has been refined many times. |
| **Compliance reference library loaded into every agent spawn** | Agent spawn time creeps from 2s to 15s as library grows. | Reference library is on-demand fetch (skill + tool call), not auto-loaded. See Integration Gotchas. | Breaks once library covers 5+ regulations or 100+ clauses. |
| **Token cost per Phase 1 wave** | A single Phase 1 run costs $5-15; user runs it twice in a day, hits API budget. | Display estimated token cost before invoking Phase 1. Offer "lite mode" (3 researchers, narrower scope). | Breaks at first paying user with metered API access. |
| **Frequent Phase 1↔Phase 2 round-trips burning tokens** | Per Pitfall 7. Token spend on a single workstream exceeds 100K. | Iteration cap (per Pitfall 7) is the hard fix. Telemetry exposes spend. | Breaks at first complex workstream (e.g., Compliance with multi-region). |
| **Bilingual artifact generation doubles output token count** | Token cost ~2x for Korean projects. | Generate the canonical language first; translate as a separate post-process step (cheaper) using a smaller model where available. | Breaks at first Korean-market user. |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| **OBJECTIVES.md or DECISION-MEMO contents echoed in user-facing error messages** | Leaks confidential strategy to anyone with terminal access (e.g., screenshare during demo). | Error messages reference filenames + line numbers, never content. Sanitize stack traces before display. |
| **Compliance checker output used as compliance evidence** | Per Pitfall 4. CEO liability under 2026 PIPA up to 10% of revenue. | Mandatory disclaimer in every compliance output. Filename suffix `.checker-finding.md` to distinguish from formal documentation. |
| **Audience-leaked external artifacts** | Per Pitfall 5. Strategy leak to investor / competitor. | Filename audience encoding + watermark + export gate. |
| **Hallucinated regulation citations** | "GDPR Article 32 requires X" when Article 32 says Y. Founder reports false claim to regulator or board. | Regulation citations carry inline `[VERIFIED:source-url|date]` tag. Compliance checker refuses to cite without a clause-level reference. |
| **Hardcoded Korean PII (e.g., 주민등록번호) sample data in tests** | Test data accidentally gets committed; KIP/PIPC enforcement risk even on test data per PIPA. [CITED: securiti.ai/south-korea-personal-information-protection-act] | Sample PII in tests is synthetic and clearly marked (`'주민등록번호': '000000-0000000'` style). Pre-commit hook scans for real-format PII. |
| **API keys / SOPS keys exposed in BRIEF config files committed to user repos** | User runs `/brief-init`, BRIEF creates `.brief/config.json` with API key in plaintext, user `git add .` commits it. | BRIEF never writes secrets to repo files. Use OS keyring or environment variables. `.gitignore` updated by `/brief-init` to exclude any secrets paths. |
| **Customer / interview data stored unencrypted in `.planning/research/`** | If user puts real customer interview data into BRIEF for analysis, it ends up in plaintext markdown. | Document explicit guidance: BRIEF is not a data store for personal data. Add a check that warns when text matches PII patterns (emails, Korean RRNs, phone numbers). |
| **Cross-tenant data leak when one user's project context bleeds into another** | If BRIEF has any global cache or shared agent state, project A's confidential strategy could surface in project B's session. | All BRIEF state is project-scoped to the current `.planning/` directory. No cross-project state. Agent memory is per-project. |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **Forcing the user through all 4 phases when they only need one workstream** | Planner who just wants a quick GTM analysis is forced through DEFINE → DISCOVER → DESIGN, gives up. | `/brief-quick {workstream}` command — single-workstream fast path. Skip DEFINE if user already provides objectives via flag. Document what's lost (less alignment) and what's gained (faster). |
| **Asking 12 clarifying questions before any output** | Cognitive fatigue. User abandons before seeing value. | DEFINE phase asks max 5 questions, batched. Push-twice technique on the most ambiguous one. Provide reasonable defaults the user can override. |
| **Showing the user agent spawn output ("Spawning agent...", "Agent completed in 4.2s")** | Reveals the framework's internals; intimidating to non-developers (Pitfall 9). | Suppress agent telemetry in user-facing output by default. Show a summary banner ("Researching market..." → "Done") instead. `--verbose` flag for debugging. |
| **Outputting raw markdown when user expects polished doc** | User opens artifact in TextEdit, sees `## Header` syntax, doesn't know how to render it. | `/brief-export` produces PDF/DOCX/HTML in addition to markdown. Recommend a renderer if not available. |
| **No visible progress on long-running operations** | Phase 1 can take 5-10 minutes. User thinks it's hung, kills it, starts over. | Streaming progress: "Researching market (1/6)... Researching competitors (2/6)..." Even just dots are better than nothing. Estimated time remaining. |
| **Silent failure when an agent errors** | Workstream completes with a missing section. User doesn't notice. | Agent failures are surfaced explicitly with retry options. Workstream completion is gated on all sections present. |
| **No way to resume a session across days** | User starts on Monday, computer goes to sleep, comes back Tuesday — loses orchestrator state. | All state in `.planning/`. Resume is `/brief-status` showing current phase + next step. No in-memory orchestrator state that doesn't survive restart. |
| **`/brief-help` returns a wall of text** | User scans for the command they need, gives up, asks Claude in chat instead. | `/brief-help` is interactive: "What are you trying to do?" with structured choices. Or accepts an argument: `/brief-help research market` returns just the relevant subset. |
| **Treating ALIGN/AUDIENCE/COMPLIANCE gate failures as errors** | User sees "FAIL" red text on every milestone, learns to ignore the gates. | Gates output **findings**, not pass/fail (per Pitfall 4 + Pitfall 3). Findings have severity levels; only critical findings block. |
| **Korean user gets English-default output** | Project is for Korean market; researcher outputs are in English; user has to translate. | At `/brief-init`, ask working language. Default outputs in working language; translate to delivery language at `/brief-export`. |

---

## "Looks Done But Isn't" Checklist

- [ ] **Phase 0 (DEFINE) output:** Often missing distinction between immutable intent and mutable hypotheses — verify OBJECTIVES.md schema separates these layers; if drift later happens, system knows what's allowed.
- [ ] **Phase 1 (DISCOVER) market data:** Often missing source URLs on quantitative claims — verify every number traces to `[VERIFIED:url|date]` tag; reject if not.
- [ ] **Phase 1 region context:** Often missing Korean-specific regulatory awareness even when project is Korea-first — verify region context injection ran on all spawned researchers; check at least one Korea-specific compliance hit appears.
- [ ] **Phase 2 (DESIGN) financial model:** Often missing driver-based bottom-up structure — verify revenue model has `leads × conversion × ACV × cycles`-style drivers, not top-down "% of TAM" assertions.
- [ ] **Phase 2 audience guard:** Often missing cross-artifact diff check — verify when two artifacts of different audiences exist, the guard runs comparison; not just per-artifact frontmatter check.
- [ ] **Phase 2 compliance checker:** Often missing clause-level evidence — verify every compliance "finding" cites specific regulation clause + specific artifact line; reject "compliant" / green-checkmark output.
- [ ] **Phase 3 (DELIVER) Type B artifacts:** Often missing concreteness — verify each claim answers "compared to what / by how much / when"; banned-words list applied; banned word density <2/page.
- [ ] **Phase 3 Korean artifacts:** Often missing honorific guard — verify external Korean artifacts use 하십시오체; bilingual pairs have idiomatic (not literal) translation; pitch deck order has team slide at 3-4 not 8-10.
- [ ] **Phase 3 export step:** Often missing — verify `/brief-export` exists, runs audience confirmation, produces non-markdown formats, applies polish pass.
- [ ] **Cross-runtime parity:** Often missing for non-Claude runtimes — verify smoke tests in Codex and Gemini for at least the 5 critical commands (`init`, `define`, `discover`, `design`, `deliver`).
- [ ] **`/brief-help`:** Often missing interactivity — verify it's not just a `man`-page dump; supports `/brief-help {topic}` subset queries.
- [ ] **Iteration caps:** Often missing on bidirectional Phase 1↔2 flow — verify hard cap of 3 round-trips; meta-arbiter prompt at iteration 2.
- [ ] **Upstream-watch process:** Often missing in fork projects — verify a documented weekly-or-monthly process for ingesting GSD upstream changes; verify last execution was <60 days ago.
- [ ] **Workstream-as-yaml:** Often missing — verify any new workstream can be added by writing a yaml file, NOT by editing orchestrator code.
- [ ] **`/brief-status`:** Often missing visible token-spend telemetry — verify it shows current phase, iteration count per workstream, and approximate token spend; surfaces thrash.
- [ ] **Atomic rename commit:** Often missing — verify the GSD→BRIEF rename was a single commit with ONLY renames (no content/behavior change), preserving cherry-pick capability.
- [ ] **Disclaimer in compliance output:** Often missing — verify "not legal advice / consult counsel" disclaimer is on every compliance artifact.
- [ ] **PII pattern check:** Often missing — verify a pre-commit or in-tool scanner warns when user inputs match real-format PII patterns (Korean RRN, credit card, etc.).

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| **Skill/command bloat (#1)** | MEDIUM | Audit usage telemetry; deprecate any command used <5% of sessions; merge near-synonymous commands; communicate breaking changes via `/brief-status` deprecation banner. |
| **Cross-runtime fragility (#2)** | MEDIUM-HIGH | Add cross-runtime smoke tests retroactively; identify breaking patterns in agent prompts; refactor through runtime-helper layer; communicate to affected users with migration notes. |
| **OBJECTIVES.md drift (#3)** | LOW (per project) | `/brief-realign` command: re-presents current OBJECTIVES.md vs all in-flight artifacts, surfaces contradictions, prompts user to amend objectives or revise artifacts. |
| **Compliance checkbox theater (#4)** | HIGH (if shipped to user as-is) | Reissue compliance findings with disclaimer + clause-level evidence; communicate that prior outputs were starting points only; if user submitted as compliance evidence, refer to legal counsel immediately. |
| **Audience leak (#5) — already happened** | HIGH | Standard breach response: identify recipients, request deletion, communicate to affected stakeholders. Tool-level: post-mortem on why guard missed; add specific guard rule for the leaked content type. |
| **Hallucinated numbers (#6) — already shipped** | HIGH | Issue corrected version with explicit erratum. Update affected artifact's provenance log. If shipped to investors, communicate correction immediately — investor trust depends on transparency, not concealment. |
| **Phase 1↔2 infinite loop (#7) — in progress** | LOW | Manual intervention: `/brief-force-converge {workstream}` exits the loop with documented gap; run `/brief-status` to confirm exit; investigate which prompt was thrashing. |
| **Fork drift (#8)** | MEDIUM-HIGH | Triage upstream commits since last sync (last 60-90 days). Cherry-pick critical fixes one at a time, smallest-first. If the layered-architecture seam was preserved, only `core/` cherry-picks are possible; user-facing layer fixes need manual port. If seam was violated, may require a multi-week reconciliation milestone. |
| **Non-developer adoption failure (#9)** | HIGH | UX overhaul: rewrite `/brief-init`, README, all error messages. Ship a Cowork-style wrapper if Claude Code launches one. Pilot with 5 non-developer planners before re-launch. |
| **AI slop in deliverable (#10) — already shipped** | MEDIUM | Reissue cleaned-up version manually (banned-words pass + concreteness pass). Update agent prompts to prevent recurrence. Use the slop-shipped instance as a training example. |
| **Korean cultural mistake (#11) — already shipped** | HIGH (relationship damage) | Apologize directly; offer corrected artifact; for Korean investor relationships specifically, in-person follow-up may be required to repair trust. Tool-level: add the specific gotcha to the honorific/cultural guard. |
| **Slash command memorability failure (#12)** | LOW | Add aliases for the most-missed commands (analyze user query logs); enrich `/brief-help` with verb-based mappings. |
| **Framework lock-in (#13)** | HIGH | Refactor built-in workstreams to yaml-driven incrementally; one workstream at a time; user-visible breaking changes documented; old hardcoded path retained for 1 release with deprecation. |
| **Dogfooding gap (#14)** | MEDIUM | Begin Track B immediately; document gaps as bugs; consider a pre-launch external pilot before any further v1 work. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| #1 Skill/command bloat | **Phase 0 (planning)** sets caps in CLAUDE.md | Pre-v1 surface count audit (`/brief-help` shows ≤12 user-facing commands). |
| #2 Cross-runtime fragility | **Phase 1 (DISCOVER architecture)** codifies LCD surface | Each agent ships with cross-runtime smoke test passing in Codex + Gemini. |
| #3 OBJECTIVES.md drift | **Phase 0 (DEFINE)** designs schema with mutability layers | `/brief-align` test: planted contradiction is detected; system prompts user to choose. |
| #4 Compliance checkbox theater | **Phase 1 (DISCOVER compliance research)** + **Phase 2 (DESIGN compliance workstream)** | Test fixture: a non-compliant artifact produces findings (not "compliant ✓"); checker output contains disclaimer; clause-level citations present. |
| #5 Audience leakage | **Phase 2 (DESIGN audience guard)** + **Phase 3 (DELIVER export step)** | Test: confidential content placed in external artifact is flagged before write; export step asks confirmation. |
| #6 Hallucinated market data | **Phase 1 (DISCOVER source-mandatory mode)** + **Phase 2 (DESIGN driver-based modeling)** + **Phase 3 (investor-facing gate)** | Test: researcher refuses to emit number without source URL; investor-facing artifact rejects `[ASSUMED]` quantitative claims. |
| #7 Phase 1↔2 infinite loop | **Phase 0 (planning)** mandates iteration cap as v1 feature; **Phase 2 (DESIGN orchestration)** implements | Test: planted infinite loop scenario exits at iteration 3 with meta-arbiter prompt. |
| #8 Fork drift | **Phase 0 (planning)** designs layered architecture before rename | Pre-v1: rename commit is single-purpose; upstream-watch process documented and first execution complete. |
| #9 Non-developer friction | **Phase 0 (DEFINE)** establishes "non-developer first" constraint; **Phase 2 (DESIGN UX)** + **Phase 3 (DELIVER docs)** implement | Pre-launch: 3 non-developer planners complete `/brief-init` → first artifact within 30 minutes, observed. |
| #10 AI slop in deliverables | **Phase 2 (DESIGN Type B agents)** with banned-words + concreteness checks | Test: artifact with banned-word density >2/page is rejected by voice-fit guard. |
| #11 Korean cultural gotchas | **Phase 1 (Korea reference library)** + **Phase 2 (region-aware agents)** + **Phase 3 (bilingual pairs + idiom table)** | Test: external Korean artifact using 반말 is rejected; team slide position checked in `region: KR` deck templates. |
| #12 Slash command memorability | **Phase 0 (naming + alias scheme)** + **Phase 2 (`/brief-help` + suggestion-on-miss)** | Pre-launch pilot: 3 non-author users recall ≥7/12 command names after 24 hours. |
| #13 Framework specialization lock-in | **Phase 0 (planning)** mandates workstream-as-yaml for v1 | Built-in workstreams ship as yaml exemplars; new workstream addable without code change (verified via test scenario). |
| #14 Dogfooding trap | **Phase 0 (planning)** establishes two-track rhythm | Track B has real (non-BRIEF-itself) project in progress before each phase milestone. |

---

## Sources

### Meta-prompting frameworks (lessons from GSD/superpowers/agent-os)
- [Superpowers honest review and lessons (Mejba)](https://www.mejba.me/blog/superpowers-plugin-claude-code-review)
- [Superpowers — when token spikes happen, when overhead doesn't pay off (Builder.io)](https://www.builder.io/blog/claude-code-superpowers-plugin)
- [Claude Code skills common mistakes — bloat, default configurations, monoliths (MindStudio)](https://www.mindstudio.ai/blog/claude-code-skills-common-mistakes-guide)
- [Agentic OS architecture and skill discipline (MindStudio)](https://www.mindstudio.ai/blog/agentic-os-architecture-claude-code-business-brain)
- [Claude Code subagent best practices and prompt drift (PubNub)](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Context management with subagents in Claude Code (RichSnapp)](https://www.richsnapp.com/article/2025/10-05-context-management-with-subagents-in-claude-code)
- [What's New in Claude Code Skills 2.0 (Pere Villega)](https://perevillega.com/posts/2026-04-01-claude-code-skills-2-what-changed-what-works-what-to-watch-out-for/)
- [Lessons from building Claude Code (Thariq, X/Twitter)](https://x.com/trq212/status/2027463795355095314)

### Cross-runtime / multi-LLM agent fragility
- [Tool calling formats across LLMs (vLLM docs)](https://docs.vllm.ai/en/latest/features/tool_calling/)
- [XML vs JSON tool calls — performance differences (Morph LLM docs)](https://docs.morphllm.com/guides/xml-tool-calls)
- [OpenAI Codex prompting and AGENTS.md format](https://developers.openai.com/codex/guides/agents-md)
- [OpenAI Codex changelog — Chat Completions API deprecation](https://developers.openai.com/codex/changelog)
- [Cross-runtime AI coding interface (ai-code-interface.el)](https://github.com/tninja/ai-code-interface.el)

### DSL / slash command discoverability
- [USE-ME usability-driven DSL development framework (ACM SIGPLAN)](https://dl.acm.org/doi/10.1145/3136014.3136027)
- [Custom slash commands and namespacing — formal definition request (anthropics/claude-code #4370)](https://github.com/anthropics/claude-code/issues/4370)
- [Claude Code slash command namespacing bug (#2422)](https://github.com/anthropics/claude-code/issues/2422)
- [Naming conventions and adoption tradeoffs (Valorem)](https://www.valoremreply.com/resources/insights/blog/2021/november/cloud-naming-convention/)

### Non-developer Claude Code adoption
- [Terminal fear and Claude Code adoption (MakeUseOf)](https://www.makeuseof.com/i-was-scared-of-the-terminal-until-i-tried-claude-code/)
- [Claude Code for non-technical users (Product Talk)](https://www.producttalk.org/claude-code-what-it-is-and-how-its-different/)
- [How to use Claude Code commands, skills, plugins (Product Talk)](https://www.producttalk.org/how-to-use-claude-code-features/)
- [Anthropic Claude Cowork wrapper for non-developers (VentureBeat)](https://venturebeat.com/orchestration/we-tested-anthropics-redesigned-claude-code-desktop-app-and-routines-heres-what-enterprises-should-know)

### AI hallucination in business / financial deliverables
- [Hidden dangers of AI hallucinations in financial services (Baytech Consulting)](https://www.baytechconsulting.com/blog/hidden-dangers-of-ai-hallucinations-in-financial-services)
- [LLM hallucinations — implications for financial institutions (BizTech Magazine)](https://biztechmagazine.com/article/2025/08/llm-hallucinations-what-are-implications-financial-institutions)
- [AI hallucinations creating real-world business risks (National Law Review)](https://natlawreview.com/article/ai-hallucinations-are-creating-real-world-risks-businesses)
- [AI hallucinations in finance (Blueberry Fund)](https://theblueberryfund.com/blogs/news/ai-hallucinations-in-finance-when-models-lie-about-the-market)
- [I tested 5 AI tools to write a PRD — verification gaps (Fireside PM)](https://firesidepm.substack.com/p/i-tested-5-ai-tools-to-write-a-prdheres)

### AI slop / corporate jargon
- [Slop named 2025 Word of the Year — implications for employers (Fisher Phillips, 2026)](https://www.fisherphillips.com/en/news-insights/how-employers-can-get-smarter-about-ai-use-in-2026.html)
- [AI jargon flywheel from hell (Storytelling Edge)](https://storytellingedge.substack.com/p/the-corporate-jargon-flywheel-from)
- [Killing business jargon with AI — what happened (Finn Partners)](https://www.finnpartners.com/news-insights/i-asked-ai-to-kill-business-jargon-heres-what-happened/)
- [Common AI words to avoid (gpthuman.ai)](https://gpthuman.ai/common-ai-words-to-avoid-if-you-want-to-bypass-ai-detectors/)

### Financial modeling false precision
- [Financial modeling mistakes — practical playbook (Alpha Apex Group)](https://www.alphaapexgroup.com/blog/financial-modeling-mistakes)
- [Precision vs accuracy in financial modeling (Jirav)](https://www.jirav.com/blog/precision-vs-accuracy-financial-modeling)
- [Common financial modeling errors (FE Training)](https://www.fe.training/free-resources/financial-modeling/financial-modeling-errors/)
- [7 common financial modeling mistakes (Forecastr)](https://www.forecastr.co/blog/financial-modeling-mistakes)
- [Excel financial modeling precision guide (Macabacus)](https://macabacus.com/blog/financial-modeling-excel)

### Korea-specific (PIPA / business culture / fintech)
- [Korea Data Protection 2026 — Chambers practice guide](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/south-korea/trends-and-developments)
- [South Korea PIPA amendments 2026 — fines up to 10% revenue (Hunton)](https://www.hunton.com/privacy-and-cybersecurity-law-blog/south-korea-amends-privacy-law-to-authorize-fines-of-up-to-10-of-total-revenue)
- [PIPA overhaul — CEO accountability (IAPP)](https://iapp.org/news/a/south-korea-overhauls-pipa-and-ties-fines-to-ceo-accountability)
- [South Korea fintech laws and MyData (Lexology)](https://www.lexology.com/library/detail.aspx?g=885e19c7-55aa-4da4-9a7d-c1bcbb3bb9d3)
- [Data privacy laws in Korea's fintech landscape (Law.asia)](https://law.asia/data-privacy-laws-in-koreas-fintech-landscape/)
- [South Korea PIPA compliance guide (Recording Law)](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/south-korea-data-privacy-laws/)
- [Pitching to Korean investors — culture and etiquette (LinkedIn)](https://www.linkedin.com/pulse/pitching-korean-investors-business-culture-tips-etiquette-kocken)
- [Korean startups perfecting their pitches (Seoulz)](https://www.seoulz.com/korean-startups-need-to-perfect-their-pitches-to-get-funded/)
- [Beyond the pitch deck — Korean founder reality (Eagler Lab)](https://eagler.blog/2025/04/11/beyond-the-pitch-deck-what-founders-really-face-in-korea/)
- [Localized pitch decks for global fundraising (Master RV Designers)](https://www.masterrvdesigners.com/guides/ultimate-guide-to-pitch-deck-design-trends/localized-market-specific-deck/)

### Forking / upstream maintenance
- [Stop forking around — hidden dangers of fork drift (Preset)](https://preset.io/blog/stop-forking-around-the-hidden-dangers-of-fork-drift-in-open-source-adoption/)
- [Forking is not free — hidden costs (Nick Desaulniers)](https://nickdesaulniers.github.io/blog/2023/02/01/forking-is-not-free-the-hidden-costs/)
- [Risks of forking open-source projects (DEV Community)](https://dev.to/bobcars/understanding-and-navigating-the-risks-of-forking-open-source-projects-strategies-for-sustainable-4hnp)
- [How to fork — best practices guide (Joaquim Rocha)](https://joaquimrocha.com/2024/09/22/how-to-fork/)

### Documentation / specification drift
- [Documentation drift definition and prevention (Gaudion)](https://gaudion.dev/blog/documentation-drift)
- [Documentation drift — examples and best practices (Docsie)](https://www.docsie.io/blog/glossary/documentation-drift/)
- [Quality drift in documentation (Improvementsoft)](https://www.improvementsoft.com/blog/quality-drift-in-documentation/)
- [Spec-driven development — InfoQ](https://www.infoq.com/articles/spec-driven-development/)

### Bidirectional workflow / multi-agent infinite loops
- [Multi-agent orchestration patterns for production (Beam)](https://beam.ai/agentic-insights/multi-agent-orchestration-patterns-production)
- [AI agent design patterns — Microsoft Azure Architecture](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Stop the loop — preventing infinite conversations in AI agents (DEV)](https://dev.to/alessandro_pignati/stop-the-loop-how-to-prevent-infinite-conversations-in-your-ai-agents-ekj)
- [Loop agents — Google ADK docs](https://google.github.io/adk-docs/agents/workflow-agents/loop-agents/)

### Confidentiality / audience leakage
- [9 typical cases of information leaks (Imatag)](https://www.imatag.com/blog/types-of-information-leaks-threatening-brands-their-impact-on-business)
- [7 confidential data mistakes (ITS ASAP)](https://www.itsasap.com/blog/4-confidential-information-mistakes-avoid)
- [When prompts leak secrets — LLM PII risks (Keysight)](https://www.keysight.com/blogs/en/tech/nwvs/2025/08/04/pii-disclosure-in-user-request)

### B2B vs B2C strategy confusion
- [B2B vs B2C marketing — common mistakes (Goldcast)](https://www.goldcast.io/blog-post/b2b-vs-b2c-marketing)
- [B2B vs B2C marketing channels — side-by-side (Boundless Marketing)](https://www.boundlessmarketingco.com/blog/zyt1m27ol83p36ow0pl2ytsob4nsrt-wrnjk-geypl-6xj58)
- [B2B vs B2C sales — 4 key differences (Revalize)](https://revalizesoftware.com/blog/b2b-vs-b2c-sales/)

### Personal experience / known issues
- BRIEF PROJECT.md (target users, constraints, decisions, dogfooding strategy)
- GSD git log (recent fixes that BRIEF will need to track upstream)
- GSD architecture (state lock, multi-agent orchestration, runtime detection — the inheritance surface)

---
*Pitfalls research for: BRIEF — Business Research, Insight & Execution Framework*
*Researched: 2026-04-17*
