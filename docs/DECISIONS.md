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
| 2026-10-01 | **Notation and formulas follow the Mathematics 30-1 and 30-2 formula sheets** as reprinted in the 2025–2026 diploma information bulletins. STAT 151's sheet and tables are not yet chosen. Protected by `test_counting_factorial_matches_the_formula_sheet`, `test_counting_ncr_worked_examples`, `test_venn_non_mutually_exclusive_worked_example`, `test_tree_dependent_events_worked_example` (cited once the modules existed, same day). | DATA_SHEET.md §1 |
| 2026-10-01 | **`bessel` draws each sample straight from N(μ, σ²)**, not from a pre-drawn pool of 100 000 values as the PyQt app did: the pool's own variance was not exactly σ², so the reference line was slightly off the target. Readouts pair the simulated averages with the exact σ²(n − 1)/n and σ². Protected by `test_bessel_simulation_converges_to_the_exact_expectations`, `test_variance_expected_value_of_dividing_by_n`, `test_variance_worked_example`. | ARCHITECTURE.md §7 |
| 2026-10-01 | **The seven Mathematics 30-1 and 30-2 sims are built as first versions** (owner: "build the basics, adjust later"): `counting`, `permutations`, `combinations`, `binomial`, `odds`, `venn`, `tree`. Each covers one-step problems; their limits are listed with the teaching models. Not yet walked through by the owner. Protected by `test_counting_npr_worked_examples`, `test_counting_ncr_worked_examples`, `test_counting_repeated_letters_worked_examples`, `test_counting_lists_agree_with_the_formulas`, `test_binomial_pascal_row_and_general_term`, `test_combinations_committee_cases_worked_example`, `test_odds_worked_example`, `test_venn_non_mutually_exclusive_worked_example`, `test_tree_dependent_events_worked_example`, `test_tree_leaves_always_add_to_one`. | ARCHITECTURE.md §7 |
| 2026-10-01 | **One counting sim serves both mathematics courses** (owner): `counting`, `permutations` and `combinations` are listed under Mathematics 30-1 and, through the catalog's `also` field, under Mathematics 30-2 Probability. Rejected: separate 30-2 copies, which would drift apart. Protected by `test_catalog_ids_unique_and_units_exist`. | ARCHITECTURE.md §3 |
| 2026-10-01 | **Fractions stay unreduced in the working and are reduced in the readouts**: a tree path prints 3/8 × 2/7 = 6/56 and the Venn sum prints 22/52, as a student writes them, while readouts print 3/28 and 11/26 with the decimal. Odds print in lowest terms. Protected by `test_probability_fractions_reduce_multiply_and_add`, `test_format_fractions_like_students_write_them`. | ARCHITECTURE.md §7 |
| 2026-10-09 | **The pure-maths folder is `site/js/maths/`, renamed from `site/js/stats/`** (owner approved the plan), because the site now holds algebra too (Mathematics 20-1). Rows above that say `stats/` mean this folder. Rejected: a second `algebra/` folder beside `stats/`, which splits one layer in two. Protected by `test_catalog_every_sim_module_exports_page_contract` (it imports every sim, so a stale import path fails). | ARCHITECTURE.md §2 |
