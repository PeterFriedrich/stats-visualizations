import * as V from '../maths/variance.js';
import { mulberry32 } from '../maths/random.js';
import { createTally } from '../maths/tally.js';
import { fitCanvas, theme, clear, line, text, niceStep } from '../lib/canvas.js';
import { section, slider, readouts } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { fixed } from '../lib/format.js';

export const equations = [
  { html: 's² = Σ(x<sub>i</sub> − x̄)² ÷ (n − 1)', what: 'the sample variance: averages to σ² over many samples (unbiased)' },
  { html: 'Σ(x<sub>i</sub> − x̄)² ÷ n', what: 'dividing by n: too small on average (biased)' },
  { html: 'E[Σ(x<sub>i</sub> − x̄)² ÷ n] = σ²(n − 1)/n', what: 'what the ÷ n estimates average to' },
  { html: 'bias = σ²(n − 1)/n − σ² = −σ²/n', what: 'shrinks as n grows' },
];

export const prompts = [
  'With n = 5 and σ² = 1, work out what the ÷ n estimates should average to. Press Play and compare.',
  'Slide n from 2 up to 50. What happens to the gap between the two averages? Explain it with −σ²/n.',
  'Change μ. Which readouts move? Why does the population mean not matter for a variance estimate?',
  'Both histograms lean right. Are most single estimates above or below σ²? How can the ÷ (n − 1) estimates still average to σ²?',
  'The deviations are measured from x̄, not from μ. Why does that make Σ(x − x̄)² smaller than Σ(x − μ)²?',
];

export const legend = [
  { color: 'series-a', label: 'variance estimates, one per sample' },
  { color: 'stat', label: 'average of the estimates so far' },
  { color: 'param', label: 'true σ²' },
];

export const tallOnMobile = true;

const RATE = 200; // samples drawn per second at 1× speed
const MAX_SAMPLES = 50000;
const BINS = 40;

export function mount(ui) {
  const pbox = section(ui.controls, 'Population (normal)');
  const mu = slider(pbox, { label: 'Mean μ', min: -50, max: 50, step: 1, value: 0 });
  const sigma2 = slider(pbox, { label: 'Variance σ²', min: 0.25, max: 25, step: 0.25, value: 1 });
  const sbox = section(ui.controls, 'Sampling');
  const n = slider(sbox, { label: 'Sample size n', min: 2, max: 100, step: 1, value: 5 });
  const seed = slider(sbox, { label: 'Random seed', min: 1, max: 999, step: 1, value: 42 });

  const out = readouts(ui.readouts, [
    { id: 'count', label: 'Samples drawn' },
    { id: 'mb', label: 'Average of the ÷ n estimates (simulated)' },
    { id: 'eb', label: 'Expected, σ²(n − 1)/n' },
    { id: 'mu', label: 'Average of the ÷ (n − 1) estimates (simulated)' },
    { id: 'eu', label: 'Expected, σ²' },
    { id: 'bias', label: 'Bias of ÷ n, −σ²/n' },
  ]);

  let rng, biased, unbiased;
  function restart() {
    // Axis: 4 standard deviations of s² either side of σ², floored at 0.
    const sd = V.sdOfSampleVariance(sigma2.value, n.value);
    const range = { lo: Math.max(0, sigma2.value - 4 * sd), hi: sigma2.value + 4 * sd, bins: BINS };
    rng = mulberry32(seed.value);
    biased = createTally(range);
    unbiased = createTally(range);
  }
  restart();

  const canvas = fitCanvas(ui.canvas);
  const clock = createClock(ui.transport, { frame: draw, onReset: restart, speeds: [0.05, 0.25, 1, 5] });
  [mu, sigma2, n, seed].forEach((c) => c.onChange(() => (clock.pause(), clock.reset())));

  function draw(clk) {
    const target = Math.min(MAX_SAMPLES, Math.floor(clk.t * RATE));
    while (biased.n < target) {
      const t = V.varianceTrial(rng, n.value, mu.value, sigma2.value);
      biased.add(t.biased);
      unbiased.add(t.unbiased);
    }
    if (target >= MAX_SAMPLES && clk.running) clk.pause();
    clk.setTimeLabel(`${fixed(biased.n, 0)} samples`);

    out.set('count', fixed(biased.n, 0));
    out.set('mb', fixed(biased.mean, 3));
    out.set('eb', fixed(V.expectedVarianceN(sigma2.value, n.value), 3));
    out.set('mu', fixed(unbiased.mean, 3));
    out.set('eu', fixed(sigma2.value, 3));
    out.set('bias', fixed(V.biasVarianceN(sigma2.value, n.value), 3));

    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const narrow = w < 620;
    const x0 = narrow ? 14 : 28;
    const x1 = w - x0;
    const { lo, hi } = biased;
    const X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
    const ph = (h - 12) / 2;
    // One count scale for both panels, so their bar heights compare.
    const peak = Math.max(1, ...biased.counts, ...unbiased.counts);
    const step = niceStep(hi - lo, narrow ? 4 : 8);
    const dp = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;

    [
      { tally: biased, title: `Divide by n = ${n.value}` },
      { tally: unbiased, title: `Divide by n − 1 = ${n.value - 1}` },
    ].forEach(({ tally, title }, i) => {
      const top = 6 + i * ph;
      const yTop = top + 34;
      const yBase = top + ph - 24;
      text(ctx, title, x0, top + 14, { color: th.ink, size: 14, weight: 600 });
      if (tally.outside) text(ctx, `${fixed(tally.outside, 0)} beyond the axis`, x1, top + 14, { color: th.muted, size: 12, align: 'right' });

      ctx.fillStyle = th.seriesA;
      ctx.globalAlpha = 0.6;
      const bw = (x1 - x0) / BINS;
      tally.counts.forEach((c, b) => {
        const bh = (c / peak) * (yBase - yTop);
        ctx.fillRect(x0 + b * bw + 0.5, yBase - bh, bw - 1, bh);
      });
      ctx.globalAlpha = 1;

      line(ctx, x0, yBase, x1, yBase, { color: th.muted, width: 1 });
      for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) {
        line(ctx, X(v), yBase, X(v), yBase + 4, { color: th.muted, width: 1 });
        text(ctx, fixed(v, dp), X(v), yBase + 13, { color: th.muted, size: 11, align: 'center' });
      }
      line(ctx, X(sigma2.value), yTop - 8, X(sigma2.value), yBase, { color: th.param, width: 2, dash: [6, 4] });
      if (tally.n) line(ctx, X(tally.mean), yTop - 8, X(tally.mean), yBase, { color: th.stat, width: 2.5 });
    });
  }
}
