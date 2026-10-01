import * as P from '../stats/probability.js';
import { fitCanvas, theme, clear, line, text } from '../lib/canvas.js';
import { section, slider, toggle, readouts } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { frac, fracDec } from '../lib/format.js';

export const equations = [
  { html: 'P(A ∩ B) = P(A) • P(B)', what: 'independent events: the first result does not change the second (with replacement)' },
  { html: 'P(A ∩ B) = P(A) • P(B | A)', what: 'dependent events: P(B | A) is the probability of B once A has happened (without replacement)' },
  { html: 'multiply along a path; add the paths you want', what: 'each path is one outcome, and the four paths add to 1' },
];

export const prompts = [
  'With 3 blue and 5 orange and no replacement, find P(blue, then blue) by hand. What is in the bag for the second draw?',
  'Turn replacement on. Which branch fractions changed, and which did not?',
  'Without replacement, compare P(second marble is blue) with P(first marble is blue). Surprised? Explain it.',
  'Find P(at least one blue) two ways: by adding three paths, and as 1 − P(orange, then orange).',
  'Make the bag 1 blue and 1 orange with no replacement. Which paths are impossible?',
];

export const legend = [
  { color: 'series-a', label: 'blue marble' },
  { color: 'series-b', label: 'orange marble' },
];

export const tallOnMobile = true;

export function mount(ui) {
  const box = section(ui.controls, 'Bag of marbles');
  const blue = slider(box, { label: 'Blue', min: 1, max: 10, step: 1, value: 3 });
  const orange = slider(box, { label: 'Orange', min: 1, max: 10, step: 1, value: 5 });
  const replace = toggle(box, { label: 'Put the first marble back before the second draw' });

  const out = readouts(ui.readouts, [
    { id: 'kind', label: 'The two draws are' },
    { id: 'aa', label: 'P(blue, then blue)' },
    { id: 'mix', label: 'P(one of each colour)' },
    { id: 'second', label: 'P(second marble is blue)' },
    { id: 'any', label: 'P(at least one blue)' },
  ]);

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing moves

  function draw() {
    const a = blue.value;
    const b = orange.value;
    const t = P.twoDraws(a, b, replace.value);
    const p = (f) => fracDec(P.reduce(f));
    out.set('kind', replace.value ? 'independent' : 'dependent');
    out.set('aa', p(t.bothA));
    out.set('mix', p(t.oneOfEach));
    out.set('second', p(t.secondA));
    out.set('any', p(t.atLeastOneA));

    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const narrow = w < 620;
    const x0 = narrow ? 12 : 30;
    const W = w - 2 * x0;
    const color = { A: th.seriesA, B: th.seriesB };
    const dot = (x, y, kind, r) => {
      ctx.fillStyle = color[kind];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // The bag.
    const step = Math.min(20, (W - 40) / (a + b));
    text(ctx, 'Bag', x0, 20, { color: th.muted, size: 12, weight: 600 });
    for (let i = 0; i < a + b; i++) dot(x0 + 44 + i * step, 20, i < a ? 'A' : 'B', Math.min(7, step / 2 - 1));

    // The tree: two branches, then two more from each.
    const top = 62;
    const H = h - top - 14;
    const xs = [x0 + 8, x0 + W * (narrow ? 0.22 : 0.26), x0 + W * (narrow ? 0.48 : 0.54)];
    const r = narrow ? 7 : 9;
    const size = narrow ? 11 : 13;
    const head = { color: th.muted, size: 12, weight: 600 };
    text(ctx, '1st draw', xs[1], top - 18, { ...head, align: 'center' });
    text(ctx, '2nd draw', xs[2] + r, top - 18, { ...head, align: 'right' });
    text(ctx, narrow ? 'multiply' : 'multiply along the path', xs[2] + 18, top - 18, head);
    const branch = (xa, ya, xb, yb, f, kind) => {
      line(ctx, xa, ya, xb, yb, { color: th.muted, width: 1.2 });
      // The fraction sits beside the middle of its branch, on the outer side.
      const len = Math.hypot(xb - xa, yb - ya);
      const side = (yb < ya ? -1 : 1) * (narrow ? 12 : 15);
      text(ctx, frac(f), (xa + xb) / 2 - ((yb - ya) / len) * side, (ya + yb) / 2 + ((xb - xa) / len) * side, { color: th.ink, size, weight: 600, align: 'center' });
      dot(xb, yb, kind, r);
    };
    const rootY = top + H / 2;
    ctx.fillStyle = th.ink;
    ctx.beginPath();
    ctx.arc(xs[0], rootY, 3, 0, Math.PI * 2);
    ctx.fill();
    ['A', 'B'].forEach((k1, i) => {
      const y1 = top + H * (0.25 + 0.5 * i);
      branch(xs[0], rootY, xs[1], y1, t.first[k1], k1);
      const after = k1 === 'A' ? t.afterA : t.afterB;
      ['A', 'B'].forEach((k2, j) => {
        const y2 = top + H * (0.125 + 0.5 * i + 0.25 * j);
        branch(xs[1] + r, y1, xs[2], y2, after[k2], k2);
        text(ctx, `${frac(t.first[k1])} × ${frac(after[k2])} = ${frac(t.leaves[k1 + k2])}`, xs[2] + 18, y2, { color: th.ink, size, weight: 600 });
      });
    });
  }
}
