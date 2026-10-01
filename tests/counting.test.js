import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../site/js/stats/counting.js';

test('test_counting_principle_multiplies_the_stages', () => {
  // 3 shirts, 2 pants, 2 shoes: 3 × 2 × 2 = 12 outfits.
  assert.equal(C.product([3, 2, 2]), 12);
  assert.equal(C.product([5]), 5);
  assert.equal(C.product([]), 1);
});

test('test_counting_factorial_matches_the_formula_sheet', () => {
  assert.equal(C.factorial(0), 1); // "0! = 1"
  assert.equal(C.factorial(1), 1);
  assert.equal(C.factorial(5), 120);
  assert.equal(C.factorial(12), 479001600);
});

test('test_counting_npr_worked_examples', () => {
  // 7P3 = 7!/4! = 7 × 6 × 5 = 210.
  assert.deepEqual(C.slotChoices(7, 3), [7, 6, 5]);
  assert.equal(C.nPr(7, 3), 210);
  assert.equal(C.nPr(5, 5), 120);
  assert.equal(C.nPr(5, 0), 1);
  assert.equal(C.nPr(3, 4), 0);
  for (let n = 0; n <= 9; n++) for (let r = 0; r <= n; r++) assert.equal(C.nPr(n, r), C.factorial(n) / C.factorial(n - r));
});

test('test_counting_ncr_worked_examples', () => {
  // 7C3 = 7!/(4! 3!) = 35; a 5-card hand from 52 cards: 2 598 960.
  assert.equal(C.nCr(7, 3), 35);
  assert.equal(C.nCr(52, 5), 2598960);
  assert.equal(C.nCr(6, 0), 1);
  assert.equal(C.nCr(6, 6), 1);
  assert.equal(C.nCr(3, 4), 0);
  for (let n = 0; n <= 12; n++) {
    for (let r = 0; r <= n; r++) {
      assert.equal(C.nCr(n, r), C.factorial(n) / (C.factorial(n - r) * C.factorial(r)));
      assert.equal(C.nCr(n, r), C.nCr(n, n - r));
      assert.equal(C.nPr(n, r), C.nCr(n, r) * C.factorial(r));
    }
  }
});

test('test_counting_repeated_letters_worked_examples', () => {
  // BANANA: 6!/(3! 2!) = 60. MISSISSIPPI: 11!/(4! 4! 2!) = 34 650.
  assert.deepEqual(C.letterCounts('BANANA'), [{ letter: 'B', count: 1 }, { letter: 'A', count: 3 }, { letter: 'N', count: 2 }]);
  const ways = (w) => C.arrangementsWithRepeats(C.letterCounts(w).map((c) => c.count));
  assert.equal(ways('BANANA'), 60);
  assert.equal(ways('MISSISSIPPI'), 34650);
  assert.equal(ways('MATH'), 24);
  assert.equal(ways(''), 1);
});

test('test_counting_lists_agree_with_the_formulas', () => {
  const items = ['A', 'B', 'C', 'D'];
  const perms = C.listArrangements(items, 2).map((p) => p.join(''));
  assert.equal(perms.length, C.nPr(4, 2));
  assert.equal(new Set(perms).size, perms.length);
  assert.deepEqual(perms.slice(0, 4), ['AB', 'AC', 'AD', 'BA']);

  const sels = C.listSelections(items, 2).map((s) => s.join(''));
  assert.deepEqual(sels, ['AB', 'AC', 'AD', 'BC', 'BD', 'CD']);
  assert.equal(C.listSelections(items, 0).length, 1);
  assert.equal(C.listSelections(items, 5).length, 0);

  for (const w of ['NOON', 'BOOK', 'BANANA', 'AAA']) {
    const list = C.listDistinctArrangements(w);
    assert.equal(list.length, C.arrangementsWithRepeats(C.letterCounts(w).map((c) => c.count)), w);
    assert.equal(new Set(list).size, list.length, `${w}: each arrangement once`);
  }
});

test('test_binomial_pascal_row_and_general_term', () => {
  assert.deepEqual(C.pascalRow(0), [1]);
  assert.deepEqual(C.pascalRow(4), [1, 4, 6, 4, 1]);
  for (let n = 0; n <= 10; n++) assert.equal(C.pascalRow(n).reduce((a, c) => a + c, 0), 2 ** n);
  // Third term of (2x − 3y)^5: t3 = 5C2 (2x)^3 (−3y)^2 = 10 × 8 × 9 x³y² = 720x³y².
  assert.deepEqual(C.binomialTerm(5, 2, 2, -3), { choose: 10, coefficient: 720, xPower: 3, yPower: 2 });
  // (x + y)^4, term 2: 4x³y.
  assert.deepEqual(C.binomialTerm(4, 1), { choose: 4, coefficient: 4, xPower: 3, yPower: 1 });
  // (x − 1)^3 = x³ − 3x² + 3x − 1.
  assert.deepEqual([0, 1, 2, 3].map((k) => C.binomialTerm(3, k, 1, -1).coefficient), [1, -3, 3, -1]);
});

test('test_combinations_committee_cases_worked_example', () => {
  // 5 students and 4 teachers, a committee of 3 with at least 2 teachers:
  // 4C2 × 5C1 + 4C3 × 5C0 = 30 + 4 = 34.
  const cases = C.committeeCases(5, 4, 3);
  assert.deepEqual(cases.map((c) => [c.fromB, c.fromA, c.ways]), [[0, 3, 10], [1, 2, 40], [2, 1, 30], [3, 0, 4]]);
  assert.equal(C.countCommittees(cases, 'atLeast', 2), 34);
  assert.equal(C.countCommittees(cases, 'exactly', 2), 30);
  assert.equal(C.countCommittees(cases, 'atMost', 1), 50);
  // Every committee falls in exactly one case, so the cases add to 9C3.
  assert.equal(C.countCommittees(cases, 'atLeast', 0), C.nCr(9, 3));
  // A committee bigger than group A must take some from group B.
  assert.deepEqual(C.committeeCases(2, 6, 4).map((c) => c.fromB), [2, 3, 4]);
});
