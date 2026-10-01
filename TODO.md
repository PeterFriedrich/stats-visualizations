# TODO

The source of truth for what's left. Read first every session; update in place.

**Format contract** (`tools/todo_archive.py` depends on it): top-level items are
`- [ ]` / `- [x]` lines directly under `## Open work`; `###` sub-headings may
group them; closed items are moved to `docs/TODO_archive.md` by the tool, which
leaves a one-line stub under `## Done`. An open item can be stale — reproduce the
symptom before acting on it.

## Open work

### Needs the owner

- [ ] **Approve or edit the STAT 151 rows of the phase 1 sim list** (SPEC_phase1.md §3) and say which to build first. Record the approval as a DECISIONS row.
- [ ] **Say what the seven mathematics sims should change or add** after trying them (SPEC_phase1.md §6 question 4). They are first versions.
- [ ] **Say which STAT 151 formula sheet and z, t and χ² tables the section uses** (SPEC_phase1.md §6 question 2). Blocks every STAT 151 sim that prints a table value.
- [ ] **Merge the rewrite PR** (branch `static-site-rewrite`). It replaces the PyQt app on `main` and publishes the site.
- [ ] **Keep or drop the GPLv3 `LICENSE`**, copied from chemistry_sim; this repo had none.

### Before tutoring with it

- [ ] **Owner walkthrough of every sim against hand calculations.** SPEC_phase1.md §5 criterion 6. Done when each sim has a ✓ (or a bug filed) here. `bessel`: ☐ `counting`: ☐ `permutations`: ☐ `combinations`: ☐ `binomial`: ☐ `odds`: ☐ `venn`: ☐ `tree`: ☐
- [ ] **Map sims to program-of-studies outcomes.** Topics are matched by title only; check specific outcome codes against the Alberta programs of study before showing them on a page.
- [ ] **Check DATA_SHEET.md against the rendered bulletin pages.** It was transcribed from the PDF text layer, which scrambles stacked fractions and drops the conditional bar in P(B | A).

### Phase 1 simulations (one per bullet; propose each first — CLAUDE.md)

- [ ] `permutations`: objects kept together or apart, and problems with several constraints (the 30-1 bulletin's weak spot, DATA_SHEET.md §1.2). Propose first.
- [ ] `binomial`: non-linear terms such as (2x² − 3/x)ⁿ and "find the term containing x⁴" (DATA_SHEET.md §1.2). Propose first.
- [ ] `odds`: start from a probability or from given odds, not only from counts. Propose first.
- [ ] `venn` and `tree`: probabilities that use permutations and combinations ("a hand of 5 cards with exactly 2 hearts"), named in DATA_SHEET.md §2.2. Propose first.
- [ ] STAT 151: `describe`, `binomialdist`, `normal`, `clt`, `confidence`, `pvalue`, `regression`, `chisquare`.
- [ ] `bessel`: show the current sample's points with x̄ and μ marked, so the student sees why deviations from x̄ are smaller than deviations from μ. Propose first.

### Housekeeping

- [ ] Ask the `server` session to update the `stats-visualizations` row in `/home/opc/CLAUDE.md` (it still says "PyQt6 desktop app") once the rewrite is on `main`.

## Done

- GitHub Pages enabled with source GitHub Actions (owner) — 2026-10-01.
- Mathematics 30-1 and 30-2 first versions: `counting`, `permutations`, `combinations`, `binomial`, `odds`, `venn`, `tree`; counting sims listed under both courses — 2026-10-01 (DECISIONS rows).
- Rewrite as a static site with the physics_sim / chemistry_sim apparatus; `bessel` ported from the PyQt app — 2026-10-01 (DECISIONS rows).
