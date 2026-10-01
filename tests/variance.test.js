import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../site/js/stats/random.js';
import * as V from '../site/js/stats/variance.js';
import { createTally } from '../site/js/stats/tally.js';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b}`);

test('test_variance_worked_example', () => {
  // 2, 4, 4, 4, 5, 5, 7, 9: x̄ = 5, Σ(x − x̄)² = 9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32.
  const xs = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(V.mean(xs), 5);
  assert.equal(V.sumSquares(xs), 32);
  assert.equal(V.varianceN(xs), 4);
  close(V.sampleVariance(xs), 32 / 7, 1e-12);
});

test('test_variance_expected_value_of_dividing_by_n', () => {
  assert.equal(V.expectedVarianceN(1, 5), 0.8);
  assert.equal(V.biasVarianceN(1, 5), -0.2);
  close(V.expectedVarianceN(4, 2), 2, 1e-12);
  // The bias is the gap between the expected value and σ², at any n.
  for (const n of [2, 3, 10, 100]) close(V.expectedVarianceN(9, n) - 9, V.biasVarianceN(9, n), 1e-12);
});

test('test_bessel_simulation_converges_to_the_exact_expectations', () => {
  // The claim the sim exists to show: over many samples the ÷ n estimates
  // average σ²(n − 1)/n and the ÷ (n − 1) estimates average σ². μ plays no part.
  for (const [n, mu, sigma2] of [[5, 0, 1], [2, -3, 4], [30, 50, 2.5]]) {
    const rng = mulberry32(42);
    let b = 0;
    let u = 0;
    const trials = 40000;
    for (let i = 0; i < trials; i++) {
      const t = V.varianceTrial(rng, n, mu, sigma2);
      close(t.biased * n, t.unbiased * (n - 1), 1e-9 * sigma2 * n, 'same sum of squares');
      b += t.biased;
      u += t.unbiased;
    }
    // 4 standard errors of the mean of the unbiased estimates.
    const tol = (4 * V.sdOfSampleVariance(sigma2, n)) / Math.sqrt(trials);
    close(u / trials, sigma2, tol, `n=${n} unbiased`);
    close(b / trials, V.expectedVarianceN(sigma2, n), tol, `n=${n} biased`);
  }
});

test('test_variance_spread_of_the_sample_variance', () => {
  assert.equal(V.sdOfSampleVariance(1, 3), 1);
  const rng = mulberry32(7);
  const s2 = Array.from({ length: 40000 }, () => V.varianceTrial(rng, 5, 0, 1).unbiased);
  close(Math.sqrt(V.sampleVariance(s2)), V.sdOfSampleVariance(1, 5), 0.02);
});

test('test_tally_counts_mean_and_values_outside_the_range', () => {
  const t = createTally({ lo: 0, hi: 4, bins: 4 });
  assert.ok(Number.isNaN(t.mean));
  for (const v of [0, 0.5, 1, 3.999, 4, 9, -1]) t.add(v);
  assert.deepEqual(t.counts, [2, 1, 0, 1]);
  assert.equal(t.n, 7);
  assert.equal(t.outside, 3); // 4 is the open end of the range
  close(t.mean, 17.499 / 7, 1e-12);
});
