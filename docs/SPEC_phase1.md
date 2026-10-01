# Spec — Phase 1: the static site, and one simulation per topic

**Status: scope APPROVED; Mathematics 30-1 and 30-2 rows BUILT as first
versions; STAT 151 rows PROPOSED.** The owner approved the rewrite as a static
site like physics_sim and chemistry_sim, covering STAT 151 plus the counting
and probability topics of Mathematics 30-1 and 30-2, then asked for the basics
to be built and adjusted later (2026-10-01, DECISIONS.md). The seven
mathematics sims are first versions awaiting the owner's walkthrough. The
STAT 151 rows other than `bessel` wait for the owner's approval or edits.

## 1. Goal

A tutor (or student) opens a link, picks a topic, and gets an interactive
simulation that makes the idea visible and whose numbers can be checked against
a hand calculation done with the course formula sheet. Phase 1 covers every
topic in §3 with at least one simulation.

## 2. Audience and use

- **Tutor-led:** screen-shared or on a tablet during a session. The tutor sets
  up a situation, asks the student to predict, then plays it.
- **Student alone:** the "Try this" prompts on each page give a predict →
  check → explain sequence without a tutor.
- Devices: laptop and phone/tablet browsers. Light and dark mode.

## 3. Scope (mathematics built, STAT 151 proposed)

Mathematics 30-1 and 30-2 rows follow the Alberta program of studies topics and
the 2025–2026 diploma information bulletins (DATA_SHEET.md §1, §2). STAT 151
rows follow the University of Alberta calendar description: "Data collection
and presentation, descriptive statistics. Probability distributions, sampling
distributions and the central limit theorem. Point estimation and hypothesis
testing. Correlation and regression analysis. Goodness of fit and contingency
table."

| Course | Topic | Simulation (catalog id) | Formula-sheet lines it uses |
|---|---|---|---|
| Mathematics 30-1 | Permutations, Combinations, and Binomial Theorem | Fundamental counting principle: fill slots one at a time, independent choices on a tree (`counting`, **built 2026-10-01**) | none (the principle is not on the sheet) |
| Mathematics 30-1 | Permutations, Combinations, and Binomial Theorem | Permutations: <sub>n</sub>P<sub>r</sub>, repeated elements, (`permutations`, **built 2026-10-01**; objects kept together or apart are not yet covered) | n!, <sub>n</sub>P<sub>r</sub> |
| Mathematics 30-1 | Permutations, Combinations, and Binomial Theorem | Combinations: <sub>n</sub>C<sub>r</sub>, committees, "at least" and "at most" by cases (`combinations`, **built 2026-10-01**) | <sub>n</sub>C<sub>r</sub> |
| Mathematics 30-1 | Permutations, Combinations, and Binomial Theorem | Binomial expansion: Pascal's triangle, (x + y)<sup>n</sup>, a chosen term (`binomial`, **built 2026-10-01**, linear terms only) | general term t<sub>k+1</sub> |
| Mathematics 30-2 | Probability | Odds ↔ probability, part-part against part-whole (`odds`, **built 2026-10-01**) | none (odds are not on the sheet) |
| Mathematics 30-2 | Probability | "Or": mutually exclusive and non-mutually exclusive events on a Venn diagram (`venn`, **built 2026-10-01**) | P(A ∪ B), both forms |
| Mathematics 30-2 | Probability | "And": independent and dependent events on a tree diagram, with and without replacement (`tree`, **built 2026-10-01**) | P(A ∩ B), both forms |
| Mathematics 30-2 | Probability | `counting`, `permutations`, `combinations` — the same sims as 30-1, listed under both courses (DECISIONS.md) | n!, <sub>n</sub>P<sub>r</sub>, <sub>n</sub>C<sub>r</sub> |
| STAT 151 | Data collection and descriptive statistics | Mean, median, standard deviation and quartiles of points you drag, with a boxplot (`describe`) | course sheet (§6 question 2) |
| STAT 151 | Probability distributions | Binomial distribution, built from <sub>n</sub>C<sub>r</sub> (`binomialdist`); normal curve areas and z-scores (`normal`) | course sheet and tables |
| STAT 151 | Sampling distributions and the central limit theorem | Bessel's correction (`bessel`, **built — seed sim, ported from the PyQt app**); sampling distribution of x̄ (`clt`) | course sheet |
| STAT 151 | Point estimation and hypothesis testing | Confidence-interval coverage over repeated samples (`confidence`); test statistic, P-value and the two error types (`pvalue`) | course sheet and tables |
| STAT 151 | Correlation and regression | Least-squares line and r for points you drag (`regression`) | course sheet |
| STAT 151 | Goodness of fit and contingency tables | Observed against expected counts and the χ² statistic (`chisquare`) | course sheet and tables |

Out of scope for phase 1: the rest of Mathematics 30-1 and 30-2 (relations and
functions, trigonometry, logical reasoning and set theory), accounts, saved
progress, a backend, worked-solution generation, uploading data files, and any
claim of alignment to specific outcome codes (topics are mapped by title only —
see `TODO.md`).

## 4. Every simulation page must have

1. A canvas view with play/pause, reset and slow-motion where anything moves.
2. Controls for every variable the topic's formulas use.
3. Readouts of the quantities a student would calculate, in the notation the
   formula sheet uses. A readout that comes from random draws is labelled
   "simulated" and sits beside its exact value where one exists.
4. A "Key equations" list and at least three "Try this" prompts.
5. Consistent colour coding across sims (legend tokens in `css/style.css`).

## 5. Acceptance criteria

1. Every readout comes from a function in `site/js/stats/` with a unit test
   that checks it against a worked example.
2. Formulas and notation are the formula sheet's (`DATA_SHEET.md`); a table
   value or method the sheet lacks has a named source and a DECISIONS row.
3. Every random draw comes from the seeded generator in `stats/random.js`, and
   the seed is on screen.
4. `npm run check` passes (unit tests + doc guards) on the merge gate.
5. `npm run verify` loads every page at 390 px and 1280 px, light and dark,
   with no console errors, no blank canvas and no horizontal scroll.
6. A human has looked at each sim's screenshot and the numbers on screen agree
   with a hand calculation for the default settings.

## 6. Questions for the owner

1. ~~**Shared counting sims.**~~ Settled 2026-10-01: one sim each, listed under
   both courses through the catalog's `also` field (DECISIONS.md).
2. **STAT 151 formula sheet and tables.** Which sheet and which z, t and χ²
   tables does the section use? Readouts have to match them (a table read to
   four decimals differs from an exact value). Nothing for STAT 151 is
   transcribed yet (DATA_SHEET.md §3).
3. **Which STAT 151 sims, in what order?** `clt`, `describe` and `regression`
   need no table and could be built before question 2 is answered.
4. **What should the mathematics sims do next?** The bulletins name what
   students find hard (DATA_SHEET.md §1.2, §2.2): permutations with three or
   more constraints, problems with several cases, and binomial terms with
   non-linear parts. The first versions cover one-step problems only.
