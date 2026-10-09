// Variance of a sample, divided by n and by n − 1, and what each estimator
// averages to over repeated samples. sigma2 is the population variance σ².
import { normalSample } from './random.js';

export function mean(xs) {
  return xs.reduce((a, x) => a + x, 0) / xs.length;
}

// Σ(xᵢ − x̄)²
export function sumSquares(xs) {
  const m = mean(xs);
  return xs.reduce((a, x) => a + (x - m) ** 2, 0);
}

// Σ(xᵢ − x̄)² / n: the biased estimator.
export function varianceN(xs) {
  return sumSquares(xs) / xs.length;
}

// s² = Σ(xᵢ − x̄)² / (n − 1): the sample variance.
export function sampleVariance(xs) {
  return sumSquares(xs) / (xs.length - 1);
}

// E[Σ(xᵢ − x̄)² / n] = σ²(n − 1)/n, for any population with variance σ².
export function expectedVarianceN(sigma2, n) {
  return (sigma2 * (n - 1)) / n;
}

// Bias of the ÷ n estimator: its expected value minus σ².
export function biasVarianceN(sigma2, n) {
  return -sigma2 / n;
}

// Standard deviation of s² over repeated samples from a normal population:
// σ²√(2/(n − 1)). Sets the histogram's range; it is not a readout.
export function sdOfSampleVariance(sigma2, n) {
  return sigma2 * Math.sqrt(2 / (n - 1));
}

// One trial: a sample of n from N(mu, sigma2) and both estimates from it.
export function varianceTrial(rng, n, mu, sigma2) {
  const ss = sumSquares(normalSample(rng, n, mu, Math.sqrt(sigma2)));
  return { biased: ss / n, unbiased: ss / (n - 1) };
}
