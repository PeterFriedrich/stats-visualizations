import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as Q from '../site/js/maths/quadratic.js';

const r = Q.rat;

test('test_quadratic_vertex_form_worked_examples', () => {
  // [a, b, c] → p, q in y = a(x − p)² + q, checked by hand.
  const cases = [
    [[1, 6, 5], r(-3), r(-4)], // (x + 3)² − 4
    [[1, -8, 7], r(4), r(-9)], // (x − 4)² − 9
    [[1, 5, 2], r(-5, 2), r(-17, 4)], // (x + 5/2)² − 17/4
    [[2, 12, -3], r(-3), r(-21)], // 2(x + 3)² − 18 − 3
    [[-1, 4, 1], r(2), r(5)], // −(x − 2)² + 4 + 1
    [[3, -9, 2], r(3, 2), r(-19, 4)], // 3(x − 3/2)² − 27/4 + 2
  ];
  for (const [[a, b, c], p, q] of cases) {
    const cs = Q.completeSquare(a, b, c);
    assert.deepEqual(cs.p, p, `${a}x² + ${b}x + ${c}: p`);
    assert.deepEqual(cs.q, q, `${a}x² + ${b}x + ${c}: q`);
  }
  // The intermediate numbers the steps print for 2x² + 12x − 3.
  const cs = Q.completeSquare(2, 12, -3);
  assert.deepEqual([cs.k, cs.h, cs.h2, cs.ah2], [r(6), r(3), r(9), r(18)]);
});

test('test_quadratic_vertex_form_expands_back', () => {
  for (let a = -4; a <= 4; a++) {
    if (a === 0) continue;
    for (let b = -9; b <= 9; b += 3) {
      for (let c = -5; c <= 5; c += 5) {
        const { p, q } = Q.completeSquare(a, b, c);
        for (const x of [-2.5, 0, 1, 3]) {
          const vertex = a * (x - p[0] / p[1]) ** 2 + q[0] / q[1];
          assert.ok(Math.abs(vertex - Q.evaluate(a, b, c, x)) < 1e-9, `${a}, ${b}, ${c} at x = ${x}`);
        }
      }
    }
  }
});

test('test_quadratic_x_intercepts_worked_examples', () => {
  assert.deepEqual(Q.xIntercepts(1, 6, 5).exact, [r(-5), r(-1)]);
  assert.deepEqual(Q.xIntercepts(1, -6, 9).exact, [r(3)]);
  assert.equal(Q.xIntercepts(1, 2, 5).count, 0);
  // 2(x + 3)² − 21 = 0 → x = −3 ± √(21/2) = −3 ± √42/2
  assert.deepEqual(Q.xIntercepts(2, 12, -3).surd, { coef: r(1, 2), radicand: 42 });
  // (9 ± √57) ÷ 6 = 3/2 ± √57/6
  const x = Q.xIntercepts(3, -9, 2);
  assert.deepEqual([x.p, x.surd], [r(3, 2), { coef: r(1, 6), radicand: 57 }]);
  assert.deepEqual(Q.xIntercepts(-1, 4, 1).surd, { coef: r(1), radicand: 5 });
  for (const [a, b, c] of [[2, 12, -3], [3, -9, 2], [1, 5, 2]]) {
    for (const v of Q.xIntercepts(a, b, c).approx) assert.ok(Math.abs(Q.evaluate(a, b, c, v)) < 1e-9);
  }
});

test('test_quadratic_simplify_sqrt', () => {
  assert.deepEqual(Q.simplifySqrt(68), [2, 17]);
  assert.deepEqual(Q.simplifySqrt(72), [6, 2]);
  assert.deepEqual(Q.simplifySqrt(42), [1, 42]);
  assert.deepEqual(Q.simplifySqrt(49), [7, 1]);
  assert.deepEqual(Q.rat(6, -4), [-3, 2]);
});
