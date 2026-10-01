# Decisions Index

Append-only. **One ROW per locked decision** — when, what, why (including what
was rejected), and a pointer to where the argument lives in full. When a decision
locks, add a row; when one is superseded, strike it (`~~...~~`) or mark it
`SUPERSEDED <date>` in place and add the successor — don't delete history.

**What a row owes you:**

1. ⚠️ **EVERY ROW CARRIES A POINTER TO A DOC** — not only to code. Code moves;
   the argument has to live somewhere prose can hold it.
   `scripts/check_doc_citations.py` checks that every pointer resolves.
2. **The row is a self-contained summary** and may paraphrase the argument.
3. **The pointer is the authority.** When a row and its target disagree, the
   target wins and the row gets fixed.
4. **A row names the test that protects it** (`test_x`, the ID opening a
   `test(...)` title in `tests/*.test.js`; `verify-x.js`; `check_x.py`), or
   carries `[unverifiable]`. `scripts/check_decisions_log.py` enforces this on
   the merge gate (and that a superseded row is marked where it stands).

| When | Decision | Full reasoning |
|------|----------|----------------|
| 2026-10-01 | **Rewritten as a static site with the physics_sim / chemistry_sim apparatus** (owner), replacing the PyQt6 + matplotlib desktop app: ES modules, no build step and no npm dependencies; offline merge gate (node:test + stdlib Python guards); GitHub Pages deploy with content-hash cache busting; the pre-push merged-branch guard. Copied from chemistry_sim rather than shared, as chemistry_sim copied physics_sim. Protected by `test_catalog_every_sim_module_exports_page_contract`, `test_build_site_every_module_is_in_the_import_map_with_its_content_hash`, `test_at_most_three_handoffs_at_top_level`. | ARCHITECTURE.md §1 |
| 2026-10-01 | **Scope is STAT 151 plus the counting and probability topics of Mathematics 30-1 and 30-2** (owner): 30-1 "Permutations, Combinations, and Binomial Theorem" and 30-2 "Probability". The rest of both mathematics courses is out. The sim list itself is still proposed. A scope choice, not a number — [unverifiable] | SPEC_phase1.md §3 |
| 2026-10-01 | **Every on-screen number traces to a tested function in `site/js/stats/`**; sim modules only wire controls and draw. No mechanical check that a sim does not compute a readout inline — review catches it. [unverifiable] | ARCHITECTURE.md §2 |
| 2026-10-01 | **Randomness is seeded, and a simulated readout says so.** Unlike the physics and chemistry sites, random draws feed readouts here, because sampling is the subject. Every draw comes from `stats/random.js` (mulberry32 + Box–Muller) with the seed on screen, never `Math.random()`; a simulated readout is labelled and sits beside its exact value where one exists. Rejected: unseeded draws (a readout nobody can reproduce or test). Protected by `test_random_same_seed_same_sequence`, `test_random_normal_has_the_mean_and_variance_asked_for`. No mechanical check that a sim never calls `Math.random()`. | ARCHITECTURE.md §4 |
| 2026-10-01 | **Notation and formulas follow the Mathematics 30-1 and 30-2 formula sheets** as reprinted in the 2025–2026 diploma information bulletins. STAT 151's sheet and tables are not yet chosen. No counting or probability module exists yet to test — [unverifiable] | DATA_SHEET.md §1 |
| 2026-10-01 | **`bessel` draws each sample straight from N(μ, σ²)**, not from a pre-drawn pool of 100 000 values as the PyQt app did: the pool's own variance was not exactly σ², so the reference line was slightly off the target. Readouts pair the simulated averages with the exact σ²(n − 1)/n and σ². Protected by `test_bessel_simulation_converges_to_the_exact_expectations`, `test_variance_expected_value_of_dividing_by_n`, `test_variance_worked_example`. | ARCHITECTURE.md §7 |
