# AUDIT LEDGER — what has been audited, when, and what came back

One row per **executed audit run**. This is the coverage map the audit docs
don't give individually: briefs are reusable *instruments*, findings docs record
*one run's output*, and the `project-audit` skill deliberately picks ONE target
per session — so nothing else says what has and hasn't been looked at. This does.

Rules: add a row when an audit **executes** (not when a brief is written); every
row carries a **pointer to the findings doc**; verdicts are **point-in-time** — a
row says the target was audited *as of that date*, not that it's still clean
after later changes. Not part of any session's mandatory reading — open it to
scope an audit or to check what has already been covered. Audits are framed
top-down, fundamental decisions first.

## Executed audits

| Date | Target / scope | Instrument | Output | Verdict (one line) | Outstanding |
|------|----------------|------------|--------|--------------------|-------------|

None yet.

## Never audited

1. `bessel` — readouts against hand calculation at the defaults and the slider
   extremes (n = 2, n = 100, σ² = 25).
2. The seven mathematics sims (`counting`, `permutations`, `combinations`,
   `binomial`, `odds`, `venn`, `tree`) — readouts and on-canvas working against
   hand calculation at the defaults and the slider extremes.
3. `docs/DATA_SHEET.md` — the two formula sheets against the bulletin PDFs,
   read off the rendered page.
