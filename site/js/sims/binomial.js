import * as C from '../maths/counting.js';
import { fitCanvas, theme, clear, text, flow, roundRect } from '../lib/canvas.js';
import { section, slider, readouts } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { fixed, subscript, superscript } from '../lib/format.js';

export const equations = [
  { html: 't<sub>k+1</sub> = <sub>n</sub>C<sub>k</sub> x<sup>n−k</sup> y<sup>k</sup>', what: 'the general term of (x + y)<sup>n</sup>, in descending powers of x' },
  { html: '(x + y)<sup>n</sup> has n + 1 terms', what: 'k runs from 0 to n' },
  { html: 'row n of Pascal’s triangle = <sub>n</sub>C<sub>0</sub>, <sub>n</sub>C<sub>1</sub>, …, <sub>n</sub>C<sub>n</sub>', what: 'each entry is the sum of the two above it' },
  { html: 'for (ax + by)<sup>n</sup>, replace x with ax and y with by', what: 'the coefficient of term k + 1 is <sub>n</sub>C<sub>k</sub> a<sup>n−k</sup> b<sup>k</sup>' },
];

export const prompts = [
  'Expand (x + y)<sup>4</sup> by hand using row 4 of the triangle, then check.',
  'In every term of (x + y)<sup>n</sup>, what do the two exponents add to? Step through the terms to check.',
  'Set a = 2 and b = −3 with n = 5. Find the third term by hand: which value of k is that?',
  'Make b negative. What pattern do the signs follow, and why?',
  'With n = 6, which term has x and y to the same power? Why is there no such term when n is odd?',
];

export const legend = [{ color: 'stat', label: 'the chosen term, and its entry in Pascal’s triangle' }];

// "3x", "x", "−x", "0x": one part of the binomial as students write it.
const part = (c, v) => (c === 1 ? v : c === -1 ? `−${v}` : `${String(c).replace('-', '−')}${v}`);

// The size of a term without its sign: "720x³y²", "x⁴", "81".
function termBody({ coefficient, xPower, yPower }) {
  const pow = (v, p) => (p === 0 ? '' : p === 1 ? v : v + superscript(p));
  const vars = pow('x', xPower) + pow('y', yPower);
  const size = Math.abs(coefficient);
  return vars && size === 1 ? vars : fixed(size, 0) + vars;
}

export function mount(ui) {
  const box = section(ui.controls, 'Binomial (ax + by)ⁿ');
  const n = slider(box, { label: 'Exponent n', min: 0, max: 10, step: 1, value: 4 });
  const a = slider(box, { label: 'a, the coefficient of x', min: -5, max: 5, step: 1, value: 1 });
  const b = slider(box, { label: 'b, the coefficient of y', min: -5, max: 5, step: 1, value: 1 });
  const tbox = section(ui.controls, 'One term');
  const termNo = slider(tbox, { label: 'Term number, k + 1', min: 1, max: 11, step: 1, value: 3 });

  const out = readouts(ui.readouts, [
    { id: 'count', label: 'Terms in the expansion, n + 1' },
    { id: 'choose', label: '<sub>n</sub>C<sub>k</sub>' },
    { id: 'coef', label: 'Coefficient, <sub>n</sub>C<sub>k</sub> a<sup>n−k</sup> b<sup>k</sup>' },
    { id: 'term', label: 'The term' },
  ]);

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing moves

  function draw() {
    const N = n.value;
    const k = termNo.value - 1;
    const row = C.pascalRow(N);
    const terms = row.map((_, i) => C.binomialTerm(N, i, a.value, b.value));
    const chosen = terms[k];
    const signed = (t) => (t.coefficient < 0 ? '−' : '') + termBody(t);
    out.set('count', String(row.length));
    out.set('choose', chosen ? `${subscript(N)}C${subscript(k)} = ${fixed(chosen.choose, 0)}` : '—');
    out.set('coef', chosen ? fixed(chosen.coefficient, 0) : '—');
    out.set('term', chosen ? (chosen.coefficient === 0 ? '0' : signed(chosen)) : `— there are only ${row.length} terms`);

    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const narrow = w < 620;
    const x0 = narrow ? 12 : 30;
    const W = w - 2 * x0;

    // Pascal's triangle, rows 0 to n.
    const triH = h * (narrow ? 0.5 : 0.56);
    const rowH = Math.min(30, (triH - 16) / (N + 1));
    const cell = Math.min(52, W / (N + 1));
    const size = Math.min(narrow ? 12 : 14, rowH * 0.7);
    for (let i = 0; i <= N; i++) {
      const y = 22 + i * rowH;
      C.pascalRow(i).forEach((v, j) => {
        const x = w / 2 + (j - i / 2) * cell;
        const last = i === N;
        if (last && j === k) {
          ctx.strokeStyle = th.stat;
          ctx.lineWidth = 2;
          roundRect(ctx, x - cell / 2 + 2, y - rowH / 2 + 1, cell - 4, rowH - 2, 5);
          ctx.stroke();
        }
        text(ctx, String(v), x, y, { color: last ? th.ink : th.muted, size, weight: last ? 700 : 500, align: 'center' });
      });
    }

    // The expansion, with the chosen term picked out.
    const y = 22 + (N + 1) * rowH + 18;
    const binomial = `(${part(a.value, 'x')} ${b.value < 0 ? '−' : '+'} ${part(Math.abs(b.value), 'y')})${superscript(N)} =`;
    text(ctx, binomial, x0, y, { color: th.muted, size: narrow ? 13 : 15, weight: 600 });
    const shown = terms.map((t, i) => ({ t, i })).filter(({ t }) => t.coefficient !== 0);
    const tokens = shown.length ? shown.map(({ t }, j) => (j === 0 ? signed(t) : `${t.coefficient < 0 ? '−' : '+'} ${termBody(t)}`)) : ['0'];
    flow(ctx, tokens, x0, y + 26, W, {
      maxY: h - 12,
      size: narrow ? 14 : 17,
      weight: 600,
      gap: 8,
      lineH: narrow ? 22 : 26,
      colorOf: (j) => (shown[j]?.i === k ? th.stat : th.ink),
    });
  }
}
