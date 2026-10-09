import * as P from '../maths/probability.js';
import { fitCanvas, theme, clear, line, text } from '../lib/canvas.js';
import { section, slider, readouts } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { frac, fracDec } from '../lib/format.js';

export const equations = [
  { html: 'odds in favour of A = favourable : unfavourable', what: 'part : part' },
  { html: 'odds against A = unfavourable : favourable', what: 'the same two parts, the other way round' },
  { html: 'P(A) = favourable ÷ (favourable + unfavourable)', what: 'part ÷ whole, a value from 0 to 1' },
  { html: 'P(A′) = 1 − P(A)', what: 'the complement: A does not happen' },
];

export const prompts = [
  'The odds in favour of rain are 3 : 5. Find P(rain) by hand, then set the sliders to check.',
  'P(win) = 2/7. What are the odds against winning? Which slider values show it?',
  'Set favourable = unfavourable. What are the odds, and what is the probability? Why is the probability not 1?',
  'Double both sliders. Which readouts change and which stay the same?',
  'Someone reads odds of 1 : 4 as “a 1 in 4 chance”. What is the mistake, and what is the real probability?',
];

export const legend = [
  { color: 'stat', label: 'favourable outcomes (A happens)' },
  { color: 'muted', label: 'unfavourable outcomes (A does not)' },
];

export function mount(ui) {
  const box = section(ui.controls, 'Equally likely outcomes');
  const fav = slider(box, { label: 'Favourable', min: 0, max: 20, step: 1, value: 3 });
  const unfav = slider(box, { label: 'Unfavourable', min: 0, max: 20, step: 1, value: 5 });

  const out = readouts(ui.readouts, [
    { id: 'for', label: 'Odds in favour of A' },
    { id: 'against', label: 'Odds against A' },
    { id: 'p', label: 'P(A)' },
    { id: 'not', label: 'P(A′)' },
  ]);

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing moves

  function draw() {
    const f = fav.value;
    const u = unfav.value;
    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const [pn, pd] = P.probabilityFromOdds(f, u);
    if (pd === 0) {
      ['for', 'against', 'p', 'not'].forEach((id) => out.set(id, '—'));
      text(ctx, 'Add at least one outcome.', w / 2, h / 2, { color: th.muted, size: 14, align: 'center' });
      return;
    }
    const ratio = ([x, y]) => `${x} : ${y}`;
    out.set('for', ratio(P.oddsInFavour(f, u)));
    out.set('against', ratio(P.oddsAgainst(f, u)));
    out.set('p', fracDec(P.reduce([pn, pd])));
    out.set('not', fracDec(P.reduce(P.probabilityFromOdds(u, f))));

    const narrow = w < 620;
    const x0 = narrow ? 14 : 40;
    const x1 = w - x0;
    const seg = (x1 - x0) / pd;
    const barY = h * 0.24;
    const barH = narrow ? 34 : 46;
    const split = x0 + f * seg;
    for (let i = 0; i < pd; i++) {
      ctx.globalAlpha = i < f ? 1 : 0.3;
      ctx.fillStyle = i < f ? th.stat : th.muted;
      ctx.fillRect(x0 + i * seg + 1, barY, seg - 2, barH);
    }
    ctx.globalAlpha = 1;

    // Brackets: the two parts above the bar, the whole below it.
    const bracket = (xa, xb, y, dir) => {
      line(ctx, xa, y, xb, y, { color: th.ink, width: 1 });
      line(ctx, xa, y, xa, y + 6 * dir, { color: th.ink, width: 1 });
      line(ctx, xb, y, xb, y + 6 * dir, { color: th.ink, width: 1 });
    };
    const small = narrow ? 12 : 13;
    if (f) {
      bracket(x0 + 1, split - 1, barY - 10, 1);
      text(ctx, `${f} favourable`, x0, barY - 24, { color: th.stat, size: small, weight: 600 });
    }
    if (u) {
      bracket(split + 1, x1 - 1, barY - 10, 1);
      text(ctx, `${u} unfavourable`, x1, barY - 24, { color: th.muted, size: small, weight: 600, align: 'right' });
    }
    bracket(x0 + 1, x1 - 1, barY + barH + 10, -1);
    text(ctx, `${pd} outcomes in all`, w / 2, barY + barH + 26, { color: th.ink, size: small, weight: 600, align: 'center' });

    const reduced = (raw, low) => (raw === low ? raw : `${raw} = ${low}`);
    const big = narrow ? 14 : 17;
    const y = barY + barH + (narrow ? 64 : 76);
    const gap = narrow ? 44 : 52;
    text(ctx, 'part : part', w / 2, y - 18, { color: th.muted, size: 12, align: 'center' });
    text(ctx, `odds in favour of A = ${reduced(ratio([f, u]), ratio(P.oddsInFavour(f, u)))}`, w / 2, y, { color: th.ink, size: big, weight: 600, align: 'center' });
    text(ctx, 'part ÷ whole', w / 2, y + gap - 18, { color: th.muted, size: 12, align: 'center' });
    const low = P.reduce([pn, pd]);
    text(ctx, `P(A) = ${frac([pn, pd]) === frac(low) ? '' : `${pn}/${pd} = `}${fracDec(low)}`, w / 2, y + gap, { color: th.ink, size: big, weight: 600, align: 'center' });
  }
}
