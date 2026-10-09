import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../site/js/maths/probability.js';

test('test_probability_fractions_reduce_multiply_and_add', () => {
  assert.deepEqual(P.reduce([22, 52]), [11, 26]);
  assert.deepEqual(P.reduce([0, 8]), [0, 1]);
  assert.deepEqual(P.reduce([0, 0]), [0, 0]);
  assert.deepEqual(P.multiply([3, 8], [2, 7]), [6, 56]);
  assert.deepEqual(P.add([15, 56], [15, 56]), [30, 56]);
  assert.deepEqual(P.reduce(P.add([1, 2], [1, 3])), [5, 6]);
  assert.equal(P.value([3, 8]), 0.375);
});

test('test_odds_worked_example', () => {
  // 3 favourable and 5 unfavourable outcomes: odds in favour 3 : 5, against
  // 5 : 3, P(A) = 3/8.
  assert.deepEqual(P.oddsInFavour(3, 5), [3, 5]);
  assert.deepEqual(P.oddsAgainst(3, 5), [5, 3]);
  assert.deepEqual(P.probabilityFromOdds(3, 5), [3, 8]);
  // Odds are given in lowest terms: 4 : 6 is 2 : 3.
  assert.deepEqual(P.oddsInFavour(4, 6), [2, 3]);
  assert.deepEqual(P.oddsInFavour(0, 6), [0, 1]);
  assert.deepEqual(P.oddsInFavour(6, 0), [1, 0]);
});

test('test_venn_non_mutually_exclusive_worked_example', () => {
  // One card from 52: A = heart (13), B = face card (12), both = 3.
  // P(A ∪ B) = 13/52 + 12/52 − 3/52 = 22/52 = 11/26.
  assert.equal(P.setsProblem(52, 13, 12, 3), null);
  const r = P.regions(52, 13, 12, 3);
  assert.deepEqual(r, { onlyA: 10, both: 3, onlyB: 9, union: 22, neither: 30 });
  assert.equal(r.onlyA + r.both + r.onlyB + r.neither, 52);
  assert.deepEqual(P.reduce([r.union, 52]), [11, 26]);
});

test('test_venn_mutually_exclusive_events_just_add', () => {
  // One die: A = even, B = odd. Nothing shared, so P(A ∪ B) = 3/6 + 3/6 = 1.
  assert.deepEqual(P.regions(6, 3, 3, 0), { onlyA: 3, both: 0, onlyB: 3, union: 6, neither: 0 });
});

test('test_venn_refuses_counts_that_cannot_happen', () => {
  assert.match(P.setsProblem(6, 7, 1, 0), /sample space/);
  assert.match(P.setsProblem(6, 3, 2, 3), /share/);
  assert.match(P.setsProblem(6, 4, 4, 1), /A or B/);
  assert.equal(P.setsProblem(6, 4, 4, 2), null);
});

test('test_tree_dependent_events_worked_example', () => {
  // 3 blue and 5 orange, two draws without replacement.
  const t = P.twoDraws(3, 5, false);
  assert.deepEqual(t.first, { A: [3, 8], B: [5, 8] });
  assert.deepEqual(t.afterA, { A: [2, 7], B: [5, 7] });
  assert.deepEqual(t.afterB, { A: [3, 7], B: [4, 7] });
  assert.deepEqual(t.leaves, { AA: [6, 56], AB: [15, 56], BA: [15, 56], BB: [20, 56] });
  assert.deepEqual(P.reduce(t.bothA), [3, 28]);
  assert.deepEqual(P.reduce(t.oneOfEach), [15, 28]);
  assert.deepEqual(P.reduce(t.atLeastOneA), [9, 14]);
  // The second marble is blue with the same probability as the first.
  assert.deepEqual(P.reduce(t.secondA), [3, 8]);
});

test('test_tree_independent_events_worked_example', () => {
  // The same bag with replacement: P(blue, blue) = 3/8 × 3/8 = 9/64.
  const t = P.twoDraws(3, 5, true);
  assert.deepEqual(t.afterA, t.first);
  assert.deepEqual(t.afterB, t.first);
  assert.deepEqual(t.leaves.AA, [9, 64]);
  assert.deepEqual(P.reduce(t.oneOfEach), [15, 32]);
});

test('test_tree_leaves_always_add_to_one', () => {
  for (const replace of [true, false]) {
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        const { leaves } = P.twoDraws(a, b, replace);
        assert.deepEqual(P.reduce(P.add(leaves.AA, leaves.AB, leaves.BA, leaves.BB)), [1, 1], `${a}, ${b}, ${replace}`);
      }
    }
  }
});
