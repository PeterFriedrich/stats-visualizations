// Quadratics in the Mathematics 20-1 notation (docs/DATA_SHEET.md §4):
// standard form y = ax² + bx + c and vertex form y = a(x − p)² + q.
// Rationals are [numerator, denominator] pairs, always reduced with a
// positive denominator, so a student's fractions (5/2, −17/4) come out exact.
import { gcd } from './probability.js';

export function rat(n, d = 1) {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  return [n / g + 0, d / g]; // + 0 turns −0 into 0
}

const add = ([a, b], [c, d]) => rat(a * d + c * b, b * d);
const mul = ([a, b], [c, d]) => rat(a * c, b * d);
const div = ([a, b], [c, d]) => rat(a * d, b * c);
const neg = ([a, b]) => rat(-a, b);

// √n = s√t with t square-free: √68 = 2√17.
export function simplifySqrt(n) {
  let s = 1;
  let t = n;
  for (let i = 2; i * i <= t; i++) {
    while (t % (i * i) === 0) {
      t /= i * i;
      s *= i;
    }
  }
  return [s, t];
}

// Every number completing the square produces, for whole-number a, b, c (a ≠ 0):
// k = b ÷ a is the x-coefficient once a is factored out, h = k ÷ 2 the side of
// the corner piece and h² its area. Then y = a(x + h)² − ah² + c, so p = −h and
// q = c − ah².
export function completeSquare(a, b, c) {
  const A = rat(a);
  const k = div(rat(b), A);
  const h = div(k, rat(2));
  const h2 = mul(h, h);
  const ah2 = mul(A, h2);
  return { k, h, h2, ah2, p: neg(h), q: add(rat(c), neg(ah2)) };
}

// x-intercepts from vertex form: a(x − p)² + q = 0 gives (x − p)² = −q ÷ a.
// Exact when −q ÷ a is a square of a rational; otherwise x = p ± (s/d)√t.
export function xIntercepts(a, b, c) {
  const { p, q } = completeSquare(a, b, c);
  const r = div(neg(q), rat(a));
  if (r[0] < 0) return { count: 0, p, r, approx: [] };
  if (r[0] === 0) return { count: 1, p, r, exact: [p], approx: [p[0] / p[1]] };
  const rn = Math.round(Math.sqrt(r[0]));
  const rd = Math.round(Math.sqrt(r[1]));
  const spread = Math.sqrt(r[0] / r[1]);
  const approx = [p[0] / p[1] - spread, p[0] / p[1] + spread];
  if (rn * rn === r[0] && rd * rd === r[1]) {
    const root = rat(rn, rd);
    return { count: 2, p, r, exact: [add(p, neg(root)), add(p, root)], approx };
  }
  // √(n/d) = √(nd) / d
  const [s, t] = simplifySqrt(r[0] * r[1]);
  return { count: 2, p, r, surd: { coef: rat(s, r[1]), radicand: t }, approx };
}

export function evaluate(a, b, c, x) {
  return a * x * x + b * x + c;
}
