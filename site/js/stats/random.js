// Seeded pseudo-random numbers. Every random draw on the site comes through an
// `rng` made here, never Math.random(), so a simulated readout can be
// reproduced from the seed shown on screen and pinned by a test.

// mulberry32: a 32-bit generator returning uniforms in [0, 1).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One draw from N(mu, sigma²) by Box–Muller. Uses two uniforms per draw and
// discards the sine half, which keeps the function stateless.
export function normal(rng, mu = 0, sigma = 1) {
  const u = 1 - rng(); // (0, 1], so the log is finite
  const v = rng();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function normalSample(rng, n, mu = 0, sigma = 1) {
  return Array.from({ length: n }, () => normal(rng, mu, sigma));
}
