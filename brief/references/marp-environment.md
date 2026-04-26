# Marp Environment Reference

> Reference doc for the BRIEF DELIVER Type B Marp deck rendering pipeline (`/brief-export`).
> Loaded by error messages in `brief/bin/lib/export.cjs` when env detection fails, and by
> CLAUDE.md as the single source of truth for Marp environment prerequisites.

BRIEF invokes Marp CLI via `npx --yes @marp-team/marp-cli@4.3.1` (no runtime dependency
declared in `package.json` — preserves the A1 zero-runtime-deps lock). Successful PPTX/PDF
rendering requires a small handful of host-side prerequisites that are NOT installed by
`npm install brief-cc`. This doc enumerates them.

## Required Software

| Component                  | Required    | Optional       | Purpose                                                                |
| -------------------------- | ----------- | -------------- | ---------------------------------------------------------------------- |
| Node.js >= 22              | ✓           |                | BRIEF runtime                                                          |
| npm (ships with Node)      | ✓           |                | npx invocation of marp-cli                                             |
| Chrome OR Edge OR Firefox  | ✓ (one of)  |                | Marp PPTX/PDF/PNG render via puppeteer-core (browser-driven)           |
| LibreOffice Impress        |             | ✓              | Required ONLY for `--pptx-editable` (Marp experimental, editable PPTX) |
| Pandoc                     |             | ✓ (last resort)| Fallback if Marp invocation fails entirely                             |

Marp's HTML output requires no browser (markdown → HTML is pure JS). PPTX, PDF, and PNG
output ALL require a Chromium-family browser (Chrome / Edge) OR Firefox to be installed
on PATH so puppeteer-core can drive headless rendering.

## Detection paths (per platform)

`brief/bin/lib/export.cjs` probes these paths in order; the first match wins.

### macOS (darwin)
- Chrome:       `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Edge:         `/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`
- Firefox:      `/Applications/Firefox.app/Contents/MacOS/firefox`
- LibreOffice:  `/Applications/LibreOffice.app/Contents/MacOS/soffice`

### Linux
- Chrome:       `/usr/bin/google-chrome`
- Edge:         `/usr/bin/microsoft-edge`
- Firefox:      `/usr/bin/firefox` or `/usr/bin/chromium-browser`
- LibreOffice:  `/usr/bin/libreoffice` or `/usr/bin/soffice`

### Windows (win32)
- Chrome:       `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Edge:         `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- LibreOffice:  `C:\Program Files\LibreOffice\program\soffice.exe`

If none of the above match, set `CHROME_PATH` to the absolute path of any Chromium-family
binary you have installed and `/brief-export` will use that.

## First-Invocation Latency

`npx --yes @marp-team/marp-cli@4.3.1` on FIRST invocation downloads ~50MB (puppeteer-core
+ Chromium-friendly bindings + the marp-cli package). This takes 30-60 seconds depending
on network speed. Subsequent invocations hit the npm cache (~2-5s).

`brief/bin/lib/export.cjs` prints a `First Marp invocation may take 30-60s — fetching
@marp-team/marp-cli@4.3.1...` message BEFORE spawning npx so the user knows to wait. The
spawn timeout is set to 120 seconds (2 minutes) to allow for slower networks.

If a corporate proxy slows the npm fetch beyond 120s, the user can pre-warm the cache
once: `npx --yes @marp-team/marp-cli@4.3.1 --version`. After that, subsequent
`/brief-export` invocations resolve in seconds.

## Sandbox / Network Restrictions

### Enterprise environments

Some enterprise environments block `npx` network calls (egress firewall, npm registry
allow-listing, etc.). Workaround:

```bash
npm install -g @marp-team/marp-cli@4.3.1
```

Then `/brief-export` falls back to invoking `marp` directly from PATH instead of `npx`.
The CLI on PATH is detected first; npx is only used as the second-choice path.

### GitHub Actions / Docker

Some sandboxes (GitHub Actions runners, certain Docker images, root containers) require:

```bash
export CHROME_NO_SANDBOX=1
```

Set this env var BEFORE running `/brief-export` in CI or sandboxed environments. Without
it, puppeteer-core fails to launch Chromium with `Failed to launch the browser process!`.

For Docker images, also add the standard Chromium dependencies (libnss3, libatk1.0-0,
libatk-bridge2.0-0, libcups2, libxcomposite1, libxdamage1, libxrandr2, libgbm1, libpango-1.0-0,
libasound2). The `mcr.microsoft.com/playwright` and `node:22-bookworm` base images already
have these.

### Claude Code / Codex / Gemini CLI / OpenCode runtime sandboxes

`/brief-export` is invoked from a Claude/Codex/Gemini/OpenCode session. The runtime sandbox
must permit `npx` egress to npmjs.org for the FIRST invocation. If your runtime blocks
arbitrary npm fetches, pre-install marp-cli globally on the host BEFORE starting the agent
session. Document this as a known limitation per Assumption STACK-A4.

## Format Fallback Ladder

If Chrome/Edge/Firefox is missing OR Marp invocation fails:

1. **PPTX requested** → fall back to **PDF** (browser still required for both, but the
   marp-cli code paths differ; PDF is more forgiving on some headless setups)
2. **PDF fails** → fall back to **HTML** (no browser needed; pure markdown → HTML render)
3. **HTML fails** → manual error pointing to this reference doc URL

`/brief-export` reports which format was actually rendered AND the fallback reason if any
(e.g., `Rendered HTML (PPTX requested but Chrome not found at expected paths — see
brief/references/marp-environment.md)`).

## Pandoc Fallback (Last Resort)

If Marp is unavailable AND Pandoc is detected on PATH, BRIEF MAY emit a Pandoc-rendered
PPTX as a graceful degradation. NOT recommended for slide quality — Marp's PPTX output is
significantly more polished:

```bash
pandoc input.md -o output.pptx --reference-doc=template.pptx
```

Pandoc fallback is documented for completeness only — the `/brief-export` slide rendering
quality bar is "Marp-quality or HTML". Pandoc PPTX is intentionally a manual escape hatch
the user can trigger by running pandoc directly on the markdown source. BRIEF does NOT
auto-invoke Pandoc.

## Troubleshooting

| Symptom                                                | Diagnosis                                  | Fix                                                                |
| ------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| `Failed to launch the browser process!`                | Sandbox blocks Chromium                    | `export CHROME_NO_SANDBOX=1` before /brief-export                  |
| `npx: command not found`                               | npm not on PATH                            | Reinstall Node.js (npm ships with it) — Node 22+                   |
| `npm ERR! 404` from npx                                | Registry blocked or stale cache            | Run `npm cache clean --force`, retry; or set npm registry mirror   |
| 120s spawn timeout on first invocation                 | Slow network                               | Pre-warm: `npx --yes @marp-team/marp-cli@4.3.1 --version`          |
| PPTX file opens but is not editable in PowerPoint      | LibreOffice missing for `--pptx-editable`  | Install LibreOffice Impress; or accept non-editable PPTX (default) |
| HTML renders but PDF/PPTX silently produces empty file | Browser detected but failed mid-render     | Check `~/.npm/_logs/` for the underlying puppeteer error           |

## References

- [Marp CLI README](https://github.com/marp-team/marp-cli)
- [Marp CLI v4 Release Notes — Discussion #542](https://github.com/marp-team/marp-cli/discussions/542)
- [puppeteer-core CHROME_NO_SANDBOX docs](https://pptr.dev/troubleshooting)
- BRIEF Pitfall #5 (Audience Leakage in Type B Artifacts) — `.planning/research/PITFALLS.md`
- BRIEF Assumption STACK-A4 (npx pattern across runtime sandboxes) — `.planning/ASSUMPTIONS.md`
