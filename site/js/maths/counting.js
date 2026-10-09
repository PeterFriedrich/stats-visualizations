// Counting: the fundamental counting principle, permutations, combinations and
// the binomial theorem, in the formula sheets' notation (docs/DATA_SHEET.md).
// Whole numbers in, whole numbers out. Results are exact below 2^53; the sims'
// sliders stay well inside that.

// Fundamental counting principle: a × b × c × … for tasks done one after another.
export function product(choices) {
  return choices.reduce((a, c) => a * c, 1);
}

// n! = n(n − 1)(n − 2)…3 × 2 × 1, with 0! = 1.
export function factorial(n) {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

// Choices left for each of r positions filled from n different objects: n, n − 1, …
export function slotChoices(n, r) {
  return Array.from({ length: r }, (_, i) => n - i);
}

// nPr = n! / (n − r)!; 0 when r > n.
export function nPr(n, r) {
  return r > n ? 0 : product(slotChoices(n, r));
}

// nCr = n! / ((n − r)! r!); 0 when r > n. Built up one factor at a time so the
// running value stays a whole number.
export function nCr(n, r) {
  if (r < 0 || r > n) return 0;
  let c = 1;
  for (let i = 1; i <= Math.min(r, n - r); i++) c = (c * (n - i + 1)) / i;
  return c;
}

// [{ letter, count }] in order of first appearance.
export function letterCounts(word) {
  const counts = new Map();
  for (const ch of word) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return [...counts].map(([letter, count]) => ({ letter, count }));
}

// Arrangements of n objects where some are identical: n! / (a! b! c! …).
export function arrangementsWithRepeats(counts) {
  let left = counts.reduce((a, c) => a + c, 0);
  let ways = 1;
  for (const c of counts) {
    ways *= nCr(left, c);
    left -= c;
  }
  return ways;
}

// Every arrangement of r of the items, in order of the items given.
export function listArrangements(items, r) {
  if (r === 0) return [[]];
  return items.flatMap((x, i) => listArrangements([...items.slice(0, i), ...items.slice(i + 1)], r - 1).map((rest) => [x, ...rest]));
}

// Every different arrangement of a word's letters (repeats give each one once).
export function listDistinctArrangements(word) {
  const go = (counts) => {
    if (counts.every((c) => c.count === 0)) return [''];
    return counts.flatMap((c, i) =>
      c.count === 0 ? [] : go(counts.map((d, j) => (j === i ? { ...d, count: d.count - 1 } : d))).map((rest) => c.letter + rest)
    );
  };
  return go(letterCounts(word));
}

// Every selection of r of the items; order inside a selection does not matter.
export function listSelections(items, r) {
  if (r === 0) return [[]];
  if (items.length < r) return [];
  const [first, ...rest] = items;
  return [...listSelections(rest, r - 1).map((s) => [first, ...s]), ...listSelections(rest, r)];
}

// Row n of Pascal's triangle: nC0, nC1, …, nCn.
export function pascalRow(n) {
  return Array.from({ length: n + 1 }, (_, k) => nCr(n, k));
}

// Term k + 1 of (ax + by)^n in descending powers of x:
// t(k+1) = nCk (ax)^(n−k) (by)^k.
export function binomialTerm(n, k, a = 1, b = 1) {
  return { choose: nCr(n, k), coefficient: nCr(n, k) * a ** (n - k) * b ** k, xPower: n - k, yPower: k };
}

// A committee of k from two groups of sizes a and b, split by how many come
// from group B: one case for each possible number j, with bCj × aC(k − j) ways.
export function committeeCases(a, b, k) {
  const cases = [];
  for (let j = Math.max(0, k - a); j <= Math.min(b, k); j++) {
    cases.push({ fromB: j, fromA: k - j, waysB: nCr(b, j), waysA: nCr(a, k - j), ways: nCr(b, j) * nCr(a, k - j) });
  }
  return cases;
}

// Whether a case with j from group B meets "exactly / at least / at most m".
export function fits(condition, m, j) {
  return condition === 'atLeast' ? j >= m : condition === 'atMost' ? j <= m : j === m;
}

// Cases are separate ways to do the job, so their counts add.
export function countCommittees(cases, condition, m) {
  return cases.filter((c) => fits(condition, m, c.fromB)).reduce((a, c) => a + c.ways, 0);
}
