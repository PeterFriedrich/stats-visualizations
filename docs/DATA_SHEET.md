# Formula sheets: what students have in front of them

Transcribed 2026-10-01 from the official Alberta Education and Childcare
**2025–2026 diploma examination information bulletins**, which reprint each
course's formula sheet (Crown copyright; not committed to this repo — fetch
them from these URLs):

- Mathematics 30-1: https://www.alberta.ca/system/files/custom_downloaded_images/edc-math-30-1-info-bulletin.pdf (formula sheet on the page numbered 22)
- Mathematics 30-2: https://www.alberta.ca/system/files/custom_downloaded_images/edc-math-30-2-info-bulletin.pdf (formula sheet on the page numbered 27)

Only the sections this site covers are transcribed. Notation in sims and
readouts follows these sheets. When a sheet is updated, update this file first,
then the code, then the tests. **Transcribe from the PDF, never from memory.**
⚠️ This transcription was made from the PDF's text layer, which drops the
conditional bar in P(B | A) and scrambles stacked fractions; it has not yet
been checked against the rendered pages (`TODO.md`).

## 1. Mathematics 30-1

### 1.1 Permutations, Combinations, and the Binomial Theorem

| Formula | Notes on the sheet |
|---|---|
| n! = n(n − 1)(n − 2)…3 × 2 × 1 | where n ∈ N and 0! = 1 |
| <sub>n</sub>P<sub>r</sub> = n! / (n − r)! | |
| <sub>n</sub>C<sub>r</sub> = n! / ((n − r)! r!) | also written as the column (n over r) |
| t<sub>k+1</sub> = <sub>n</sub>C<sub>k</sub> x<sup>n−k</sup> y<sup>k</sup> | "In the expansion of (x + y)<sup>n</sup>, written in descending powers of x, the general term is…" |

### 1.2 Exam weighting and commentary (bulletin)

- Permutations, Combinations, and Binomial Theorem: **14 %–18 %** of the
  diploma examination.
- Students solve permutation problems with one or two constraints; many have
  difficulty with three or more constraints or multiple cases.
- Students can solve problems involving repeated elements.
- Many students have difficulty finding specific terms in the expansion of a
  binomial with non-linear terms.

### 1.3 Not on the sheet

- The fundamental counting principle.
- Permutations with repeated elements, n! / (a! b! c! …).

## 2. Mathematics 30-2

### 2.1 Probability

| Formula | Notes |
|---|---|
| n! = n(n − 1)(n − 2)…3 • 2 • 1 | where n ∈ N and 0! = 1 |
| <sub>n</sub>P<sub>r</sub> = n! / (n − r)! | |
| <sub>n</sub>C<sub>r</sub> = n! / ((n − r)! r!) | also written as the column (n over r) |
| P(A ∪ B) = P(A) + P(B) | mutually exclusive events (the sheet prints the formula without the condition) |
| P(A ∪ B) = P(A) + P(B) − P(A ∩ B) | non-mutually exclusive events |
| P(A ∩ B) = P(A) • P(B) | independent events |
| P(A ∩ B) = P(A) • P(B \| A) | dependent events |

The sheet's Logical Reasoning section lists set symbols only: A′ complement,
∅ empty set, ∩ intersection, ⊂ subset, ∪ union.

### 2.2 Exam weighting and commentary (bulletin)

- Probability: **30 %–35 %** of the diploma examination.
- Most students can convert probability to odds and back; weaker students find
  it difficult. Odds are "part-part", probability is "part-whole".
- Students struggle with non-mutually exclusive events, dependent events, and
  probabilities that involve permutations and combinations.
- Some students confuse mutually exclusive / non-mutually exclusive with
  independent / dependent.
- Students have difficulty when there is more than one case to consider.
- Some students give a probability as a percent rather than a value from 0 to
  1, a concern in numerical-response questions.
- Written responses must label odds as "odds in favour of A", "odds for A" or
  "odds against A".

### 2.3 Not on the sheet

- Odds, and the conversion between odds and probability.
- The complement rule, P(A′) = 1 − P(A).
- The fundamental counting principle.
- Permutations with repeated elements.

## 3. STAT 151

**Not yet transcribed.** No formula sheet or statistical table (z, t, χ²) for
STAT 151 is recorded here; the owner has to say which the section uses
(SPEC_phase1.md §6). The `bessel` sim needs none: its formulas are the
definitions of the two estimators and their expected values.
