# Claude Instructions

## Project
A static web app of interactive simulations for tutoring counting, probability and introductory statistics: Mathematics 20-1 topics the owner adds one at a time (quadratics first, 2026-10-09; notation in `docs/DATA_SHEET.md` §4), the "Permutations, Combinations, and Binomial Theorem" topic of Alberta Mathematics 30-1, the "Probability" topic of Mathematics 30-2, and STAT 151 (University of Alberta). It is a teaching aid: every exact readout must match what a student gets by hand with the course formula sheet, and every simulated readout is labelled and reproducible from its seed. It is deliberately not a statistics package, not a course replacement, and has no backend or accounts. Sibling of `physics_sim` and `chemistry_sim`, whose apparatus it reuses — when in doubt about a shared helper or workflow rule, `physics_sim` is the reference implementation. It replaced a PyQt6 desktop app on 2026-10-01.

## Key Files
- `TODO.md` — living backlog and **the source of truth for progress**. Read it first to know what to work on; update it in place as items open/close. Session summaries narrate *what happened*; TODO.md owns *what's left*. Never redo a closed item without asking — its `## Done` section lists every closed item in one line each. Conversely, an *open* item can be stale — reproduce the symptom before acting on it. **When an item closes, move its body to `docs/TODO_archive.md` and leave a `## Done` line** (`python3 tools/todo_archive.py` does it in bulk).
- `docs/DECISIONS.md` — append-only index of locked decisions: one row + pointer to the doc holding the full reasoning. **Add a row whenever a decision locks.** Check it before re-opening anything that feels "already settled".
- `docs/SPEC_phase1.md` — phase 1 (one sim per topic; the mathematics sims are built as first versions, **the STAT 151 list is proposed, not yet approved**) and the acceptance criteria every sim must meet. Read before adding or changing a sim.
- `docs/DATA_SHEET.md` — the Mathematics 30-1 and 30-2 formula sheets, transcribed, and what they do **not** print (odds, the complement rule, the counting principle). STAT 151's sheet and tables are not chosen yet. **Check a formula, a notation or an "is it on the sheet?" question here first.**
- `docs/ARCHITECTURE.md` — module contracts (stats / lib / sims / catalog), the sim page contract, and the rule for randomness. Read before a new module or a change to a shared helper.
- `docs/TOKEN_EFFICIENCY.md` — context/token hygiene. Read before bulk-reading screenshots or summaries.
- `docs/AUDIT_LEDGER.md` — coverage map of executed audit runs. **Add a row when an audit executes; check it before scoping a new one.**
- `docs/REMOTE_VM.md` — **read FIRST in a Claude Code web/remote VM session**: network-policy constraints, environment setup.
- `session-summary/` — session handoff notes. Read the latest before starting work; older ones live in `session-summary/archive/` (don't bulk-read them).

## Token Efficiency
- **Screenshots are expensive.** `tools/verify-sims.js` writes one per page to `output/`; open only the sims you changed. See `docs/TOKEN_EFFICIENCY.md`.
- Read only the **latest** session summary; keep the 3 most recent at top level, archive older — enforced by `tests/loaded-path.test.js`.

## Session Management
- **At session start, check open GitHub issues** — nothing pushes these to a model. ⚠️ **A working guard on a channel nobody reads is the standing failure mode** — treat an unread report as a finding, not as background.
- Always run `/handoff` before `/clear` — never wipe context without a written record in `session-summary/`. The `SessionStart` and `SessionEnd` hooks run `scripts/handoff_gap.py`, which names the commits and uncommitted files that landed after the newest handoff was last committed, and **says nothing when nothing is owed**.
- Commit after each working unit with a descriptive message, rather than batching a session into one commit.
- **Pushing is normal — push proactively after committing, in every environment.**
- **Remote/cloud VM sessions: commit + push at every natural checkpoint.** The container is ephemeral; unpushed work is LOST when it is reclaimed. Quirks: `docs/REMOTE_VM.md`.
- **⚠️ The owner may merge PRs mid-session. Re-check before EVERY push to an existing branch.** Commits pushed after the PR merged land on a dead branch.
  - Enforced by `.githooks/pre-push`. **A fresh clone must enable it: `git config core.hooksPath .githooks`** (`./bootstrap.sh` does). It fails OPEN, so it can never be the reason work goes unsaved. Escape hatch: `git push --no-verify`.
  - After any merge, confirm the work landed: `git merge-base --is-ancestor <sha> origin/main`.
- **No scheduled PR check-ins**: each one costs a full turn of usage. Subscribe to a PR's activity so CI failures and reviews still arrive, but never arm a `send_later` / trigger check-in for it.

## Code Style
- **A decision that protects a number is a test first, prose second.** Write the guard, then the `DECISIONS.md` row cites its ID (`test_x` — the string that opens a `test(...)` title). A row with nothing to cite is tagged `[unverifiable]`. `scripts/check_decisions_log.py` gates new rows on the merge path.
- **Maths lives in `site/js/maths/`, pure and DOM-free.** Sims only draw and wire controls; any number shown in a readout comes from a `maths/` function that has a test. Rendering code contains no formulas beyond scaling to pixels.
- **Exact over simulated** wherever a formula exists (<sub>n</sub>P<sub>r</sub>, P(A ∪ B), expected values), so readouts equal the hand calculation.
- **Randomness is seeded.** Every draw goes through an `rng` from `maths/random.js`, never `Math.random()`; the seed is on screen; a readout built from draws is labelled "simulated" and sits beside its exact value where one exists. A run must depend on the seed only, not on frame timing.
- **Notation is the formula sheet's** (`docs/DATA_SHEET.md`): <sub>n</sub>P<sub>r</sub>, <sub>n</sub>C<sub>r</sub>, P(A ∪ B), P(B | A). Probabilities are values from 0 to 1 unless the label says percent; odds are labelled "in favour" or "against". A table value or method the sheet does not print needs a DECISIONS row naming its source.
- Readouts go through `lib/format.js` (`fmt()` for significant figures, `fixed()` for decimal places).
- No dependencies and no build step: ES modules served as-is. Adding one is a DECISIONS row.

## Comments & Scope
- Comments only where the *why* is non-obvious. Don't narrate what the code plainly does.
- Make the **smallest change that satisfies the request**. Don't refactor, rename, or reformat code you weren't asked to touch.
- No abstractions for a single use case — inline until there are 3+ call sites (the lib/ helpers came with theirs from the sibling sites).
- Deleting obsolete code is valid and **preferred** over leaving it behind.
- **Propose the plan first** for: a new sim, a change to the sim page contract or a shared lib helper, or anything that changes CI or deployment. Routine edits don't need a proposal.
- These are scope rules, not verification rules. They do **not** relax the stats tests, the guard scripts, or checking a changed sim in a real browser (`npm run verify`, then look at its screenshot).

## Verification
- `npm run check` — unit tests + doc-citation and decisions-log guards (what CI runs). The guards need python ≥ 3.10; on this server the system `python3` is 3.6, so run them as `python3.12 scripts/check_doc_citations.py` and `python3.12 scripts/check_decisions_log.py`.
- `npm run verify:built` — the deploy build (cache-busted `_site/`) in the browser; also fails on any unversioned `.js`/`.css` request. Run it after touching `tools/build-site.js` or the HTML shells.
- `npm run verify` — every page in headless Chromium; fails on console errors, blank canvas, horizontal scroll. `VERIFY_WIDTHS=390,1280 VERIFY_THEME=dark` for phone and dark mode. On this server Playwright is not global: prefix `NODE_PATH=/home/opc/edmonton-tax-viz/tools/profiling/node_modules`. Look at the screenshot of anything you changed — "no errors" is not "looks right".
