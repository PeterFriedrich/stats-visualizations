// Probability of equally likely outcomes, odds, two events on a Venn diagram
// and two draws on a tree, in the Mathematics 30-2 formula sheet's notation
// (docs/DATA_SHEET.md §2). Fractions are [numerator, denominator] pairs of
// whole numbers, kept unreduced until `reduce` so the working matches the
// student's ("3/8 × 2/7 = 6/56").

export function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export function reduce([n, d]) {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

export function value([n, d]) {
  return n / d;
}

export function multiply([a, b], [c, d]) {
  return [a * c, b * d];
}

// Sum of fractions over their common (product) denominator, e.g. 15/56 + 15/56 = 30/56.
export function add(...fs) {
  return fs.reduce(([a, b], [c, d]) => (b === d ? [a + c, b] : [a * d + c * b, b * d]));
}

// Odds are part : part. In favour of A is favourable : unfavourable.
export function oddsInFavour(favourable, unfavourable) {
  return reduce([favourable, unfavourable]);
}

export function oddsAgainst(favourable, unfavourable) {
  return reduce([unfavourable, favourable]);
}

// Probability is part / whole: favourable / (favourable + unfavourable).
export function probabilityFromOdds(favourable, unfavourable) {
  return [favourable, favourable + unfavourable];
}

// Why these counts cannot describe two events in a sample space of N outcomes;
// null when they can.
export function setsProblem(N, nA, nB, nAB) {
  if (nA > N || nB > N) return 'an event cannot have more outcomes than the sample space';
  if (nAB > Math.min(nA, nB)) return 'A and B cannot share more outcomes than the smaller event has';
  if (nA + nB - nAB > N) return 'A or B would have more outcomes than the sample space';
  return null;
}

// The four regions of a two-event Venn diagram, as counts of outcomes.
// n(A ∪ B) = n(A) + n(B) − n(A ∩ B).
export function regions(N, nA, nB, nAB) {
  const union = nA + nB - nAB;
  return { onlyA: nA - nAB, both: nAB, onlyB: nB - nAB, union, neither: N - union };
}

// Two draws from a bag holding `a` of one kind (A) and `b` of another (B).
// With replacement the draws are independent: P(A ∩ B) = P(A) × P(B). Without,
// they are dependent: P(A ∩ B) = P(A) × P(B | A), and the bag is one smaller.
export function twoDraws(a, b, replace) {
  const t = a + b;
  const first = { A: [a, t], B: [b, t] };
  const afterA = replace ? first : { A: [a - 1, t - 1], B: [b, t - 1] };
  const afterB = replace ? first : { A: [a, t - 1], B: [b - 1, t - 1] };
  const leaves = {
    AA: multiply(first.A, afterA.A),
    AB: multiply(first.A, afterA.B),
    BA: multiply(first.B, afterB.A),
    BB: multiply(first.B, afterB.B),
  };
  return {
    first,
    afterA,
    afterB,
    leaves,
    bothA: leaves.AA,
    oneOfEach: add(leaves.AB, leaves.BA),
    secondA: add(leaves.AA, leaves.BA),
    atLeastOneA: add(leaves.AA, leaves.AB, leaves.BA),
  };
}
