import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, normal, normalSample } from '../site/js/stats/random.js';
import { mean, sampleVariance } from '../site/js/stats/variance.js';

test('test_random_same_seed_same_sequence', () => {
  // The seed on screen has to reproduce the run, on any machine.
  const a = mulberry32(42);
  const b = mulberry32(42);
  const c = mulberry32(43);
  const xs = Array.from({ length: 5 }, () => a());
  assert.deepEqual(xs, Array.from({ length: 5 }, () => b()));
  assert.notDeepEqual(xs, Array.from({ length: 5 }, () => c()));
  assert.ok(xs.every((x) => x >= 0 && x < 1));
});

test('test_random_uniform_fills_the_unit_interval_evenly', () => {
  const rng = mulberry32(1);
  const counts = new Array(10).fill(0);
  for (let i = 0; i < 100000; i++) counts[Math.floor(rng() * 10)] += 1;
  for (const c of counts) assert.ok(Math.abs(c - 10000) < 400, `decile count ${c}`);
});

test('test_random_normal_has_the_mean_and_variance_asked_for', () => {
  const xs = normalSample(mulberry32(42), 50000, 10, 3);
  assert.ok(Math.abs(mean(xs) - 10) < 0.05, `mean ${mean(xs)}`);
  assert.ok(Math.abs(sampleVariance(xs) - 9) < 0.2, `variance ${sampleVariance(xs)}`);
  // About 68.3 % of a normal population lies within one σ of μ.
  const within = xs.filter((x) => Math.abs(x - 10) <= 3).length / xs.length;
  assert.ok(Math.abs(within - 0.6827) < 0.01, `within one sigma ${within}`);
  assert.ok(Number.isFinite(normal(() => 0, 0, 1)), 'u = 0 must not give log(0)');
});
