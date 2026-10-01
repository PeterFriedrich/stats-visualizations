import * as C from '../stats/counting.js';
import { fitCanvas, theme, clear, line, text } from '../lib/canvas.js';
import { section, slider, readouts } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { fixed } from '../lib/format.js';

export const equations = [
  { html: 'a × b × c × …', what: 'the fundamental counting principle: if one choice can be made a ways, the next b ways, and so on, all of them together can be made a × b × c × … ways' },
  { html: 'multiply for “and then”', what: 'each choice follows the one before, so every branch splits again' },
  { html: 'add for “or”', what: 'separate cases that cannot happen together are added, not multiplied' },
];

export const prompts = [
  'With 3 shirts and 2 pants, list every outfit by hand. Does your list match the ends of the tree?',
  'Add a third choice with 2 options. Predict the new total before you move the slider.',
  'Which changes the total more: one extra shirt, or one extra choice to make with 2 options? Try both.',
  'Set every choice to 1 except one. Why is the total just that one number?',
  'A licence plate has 3 letters then 3 digits. Write the product you would use. Why can the tree not be drawn?',
];

export const legend = [{ color: 'series-a', label: 'one option; each path from the left to the right edge is one outfit' }];

const STAGES = [
  { label: 'Shirts', letter: 'S', value: 3 },
  { label: 'Pants', letter: 'P', value: 2 },
  { label: 'Jackets', letter: 'J', value: 2 },
  { label: 'Hats', letter: 'H', value: 2 },
];

export function mount(ui) {
  const box = section(ui.controls, 'Outfit');
  const stages = slider(box, { label: 'Choices to make', min: 1, max: 4, step: 1, value: 3 });
  const counts = STAGES.map((s) => {
    const ctl = slider(box, { label: s.label, min: 1, max: 6, step: 1, value: s.value });
    return { ...s, ctl, row: box.lastElementChild };
  });

  const out = readouts(ui.readouts, [
    { id: 'work', label: 'Options multiplied' },
    { id: 'total', label: 'Different outfits' },
  ]);

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing moves

  function draw() {
    const k = stages.value;
    counts.forEach((c, i) => (c.row.hidden = i >= k));
    const used = counts.slice(0, k);
    const ns = used.map((c) => c.ctl.value);
    const total = C.product(ns);
    out.set('work', ns.join(' × '));
    out.set('total', fixed(total, 0));

    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const narrow = w < 620;
    const x0 = narrow ? 14 : 30;
    const colW = (w - x0 - (narrow ? 44 : 52)) / k;
    const top = 40;
    const bottom = h - 40;
    // Draw as many levels as leave the branch ends readable; say the rest in words.
    const maxEnds = Math.floor((bottom - top) / (narrow ? 8 : 10));
    let depth = 0;
    while (depth < k && C.product(ns.slice(0, depth + 1)) <= maxEnds) depth++;
    const ends = C.product(ns.slice(0, depth));
    const endY = (i) => top + ((i + 0.5) * (bottom - top)) / ends;
    const nodeY = (level, j) => {
      const span = ends / C.product(ns.slice(0, level + 1));
      return (endY(j * span) + endY((j + 1) * span - 1)) / 2;
    };
    const X = (level) => x0 + (level + 1) * colW;

    used.forEach((s, level) => {
      text(ctx, `${s.label}: ${ns[level]}`, X(level), 18, { color: th.ink, size: narrow ? 12 : 13, weight: 600, align: 'center' });
      if (level >= depth) {
        text(ctx, `× ${ns[level]}`, X(level), (top + bottom) / 2, { color: th.muted, size: 15, weight: 600, align: 'center' });
        return;
      }
      const count = C.product(ns.slice(0, level + 1));
      const labelled = (bottom - top) / count >= 13;
      for (let j = 0; j < count; j++) {
        const y = nodeY(level, j);
        const py = level === 0 ? (top + bottom) / 2 : nodeY(level - 1, Math.floor(j / ns[level]));
        line(ctx, X(level - 1), py, X(level), y, { color: th.muted, width: 1 });
        ctx.fillStyle = th.seriesA;
        ctx.beginPath();
        ctx.arc(X(level), y, 3, 0, Math.PI * 2);
        ctx.fill();
        // Inner labels sit above the node, clear of the branches leaving it.
        const inner = level < depth - 1;
        if (labelled) text(ctx, `${s.letter}${(j % ns[level]) + 1}`, X(level) + (inner ? 0 : 7), y - (inner ? 10 : 0), { color: th.muted, size: 11, align: inner ? 'center' : 'left' });
      }
    });
    ctx.fillStyle = th.ink;
    ctx.beginPath();
    ctx.arc(x0, (top + bottom) / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const tail = depth < k ? ' (too many branches to draw them all)' : '';
    text(ctx, `${ns.join(' × ')} = ${fixed(total, 0)} outfits`, w / 2, h - 18, { color: th.ink, size: 15, weight: 600, align: 'center' });
    if (tail && !narrow) text(ctx, tail.trim(), w - 30, h - 18, { color: th.muted, size: 12, align: 'right' });
  }
}
