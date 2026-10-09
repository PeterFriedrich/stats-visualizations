import * as P from '../maths/probability.js';
import { fitCanvas, theme, clear, text, para, roundRect } from '../lib/canvas.js';
import { section, slider, choice, readouts } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { frac, fracDec } from '../lib/format.js';

export const equations = [
  { html: 'P(A ∪ B) = P(A) + P(B)', what: 'mutually exclusive events: A and B share no outcomes' },
  { html: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)', what: 'non-mutually exclusive events: the shared outcomes were counted twice, so take them off once' },
  { html: '“or” means A, or B, or both', what: 'in probability, “or” is inclusive' },
];

export const prompts = [
  'One card from a deck: find P(heart or face card) by hand. Which cards would you count twice if you only added?',
  'Pick “heart, spade”. Why is there nothing to subtract?',
  'Slide the shared outcomes up from 0. What happens to P(A ∪ B), and why does it go that way?',
  'Make every outcome of B also an outcome of A. What does P(A ∪ B) equal now?',
  'Can two events with P(A) = 0.7 and P(B) = 0.5 be mutually exclusive? Try to set it up with 10 outcomes.',
];

export const legend = [
  { color: 'series-a', label: 'event A' },
  { color: 'series-b', label: 'event B' },
];

const PRESETS = [
  { value: 'cards', label: 'One card: A = heart, B = face card', set: [52, 13, 12, 3] },
  { value: 'suits', label: 'One card: A = heart, B = spade', set: [52, 13, 13, 0] },
  { value: 'die', label: 'One die: A = even, B = more than 4', set: [6, 3, 2, 1] },
  { value: 'class', label: 'Class of 30: A = soccer, B = hockey', set: [30, 12, 9, 4] },
  { value: 'custom', label: 'My own numbers' },
];

export function mount(ui) {
  const box = section(ui.controls, 'Events');
  const preset = choice(box, { label: 'Example', options: PRESETS, value: 'cards' });
  const total = slider(box, { label: 'Outcomes in the sample space', min: 1, max: 60, step: 1, value: 52 });
  const nA = slider(box, { label: 'Outcomes in A', min: 0, max: 60, step: 1, value: 13 });
  const nB = slider(box, { label: 'Outcomes in B', min: 0, max: 60, step: 1, value: 12 });
  const nAB = slider(box, { label: 'Outcomes in both A and B', min: 0, max: 60, step: 1, value: 3 });
  const ctls = [total, nA, nB, nAB];
  preset.onChange(() => preset.option.set?.forEach((v, i) => (ctls[i].value = v)));
  ctls.forEach((c) => c.onChange(() => (preset.value = 'custom')));

  const out = readouts(ui.readouts, [
    { id: 'a', label: 'P(A)' },
    { id: 'b', label: 'P(B)' },
    { id: 'and', label: 'P(A ∩ B), both' },
    { id: 'or', label: 'P(A ∪ B), A or B' },
    { id: 'none', label: 'P(neither)' },
    { id: 'me', label: 'Mutually exclusive?' },
  ]);

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing moves

  function draw() {
    const [N, a, b, ab] = ctls.map((c) => c.value);
    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const narrow = w < 620;
    const problem = P.setsProblem(N, a, b, ab);
    if (problem) {
      ['a', 'b', 'and', 'or', 'none', 'me'].forEach((id) => out.set(id, '—'));
      text(ctx, 'Not possible:', w / 2, h / 2 - 12, { color: th.danger, size: 14, weight: 600, align: 'center' });
      para(ctx, problem, w / 2, h / 2 + 12, w - 32, { color: th.danger, size: 14 });
      return;
    }
    const r = P.regions(N, a, b, ab);
    const exclusive = r.both === 0;
    const p = (count) => fracDec(P.reduce([count, N]));
    out.set('a', p(a));
    out.set('b', p(b));
    out.set('and', p(r.both));
    out.set('or', p(r.union));
    out.set('none', p(r.neither));
    out.set('me', exclusive ? 'yes: no shared outcomes' : 'no: they share outcomes');

    // The sample space, with A and B overlapping only when they share outcomes.
    const x0 = narrow ? 12 : 30;
    const boxW = w - 2 * x0;
    const boxH = h - (narrow ? 84 : 74);
    ctx.strokeStyle = th.muted;
    ctx.lineWidth = 1.5;
    roundRect(ctx, x0, 12, boxW, boxH, 8);
    ctx.stroke();
    const R = Math.min(boxH * 0.36, boxW / 4.8);
    const cy = 12 + boxH / 2 + 6;
    const off = exclusive ? 1.15 * R : 0.6 * R;
    const circle = (cx, color) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    circle(w / 2 - off, th.seriesA);
    circle(w / 2 + off, th.seriesB);
    const num = narrow ? 18 : 24;
    text(ctx, 'A', w / 2 - off - R * 0.75, cy - R * 0.95, { color: th.seriesA, size: 16, weight: 700, align: 'center' });
    text(ctx, 'B', w / 2 + off + R * 0.75, cy - R * 0.95, { color: th.seriesB, size: 16, weight: 700, align: 'center' });
    text(ctx, String(r.onlyA), w / 2 - off - (exclusive ? 0 : 0.42 * R), cy, { color: th.ink, size: num, weight: 700, align: 'center' });
    text(ctx, String(r.onlyB), w / 2 + off + (exclusive ? 0 : 0.42 * R), cy, { color: th.ink, size: num, weight: 700, align: 'center' });
    if (!exclusive) text(ctx, String(r.both), w / 2, cy, { color: th.ink, size: num, weight: 700, align: 'center' });
    text(ctx, `neither: ${r.neither}`, x0 + boxW - 10, 12 + boxH - 14, { color: th.muted, size: 13, weight: 600, align: 'right' });

    const f = (count) => frac([count, N]);
    const rule = exclusive ? 'P(A ∪ B) = P(A) + P(B)' : 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)';
    const work = exclusive ? `${f(a)} + ${f(b)} = ${f(r.union)}` : `${f(a)} + ${f(b)} − ${f(r.both)} = ${f(r.union)}`;
    const y = 12 + boxH + (narrow ? 24 : 32);
    if (narrow) {
      text(ctx, rule, w / 2, y, { color: th.muted, size: 13, weight: 600, align: 'center' });
      text(ctx, `= ${work}`, w / 2, y + 24, { color: th.ink, size: 15, weight: 600, align: 'center' });
    } else {
      text(ctx, `${rule} = ${work}`, w / 2, y, { color: th.ink, size: 17, weight: 600, align: 'center' });
    }
  }
}
