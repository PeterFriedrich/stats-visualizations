import * as C from '../stats/counting.js';
import { fitCanvas, theme, clear, text, para, flow, roundRect } from '../lib/canvas.js';
import { section, slider, choice, readouts, el } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { fixed, subscript } from '../lib/format.js';

export const equations = [
  { html: 'n! = n(n − 1)(n − 2)…3 × 2 × 1', what: 'arrangements of n different objects in a row; 0! = 1' },
  { html: '<sub>n</sub>P<sub>r</sub> = n! ÷ (n − r)!', what: 'arrangements of r objects chosen from n different objects; order matters' },
  { html: 'n! ÷ (a! b! c! …)', what: 'arrangements of n objects when a are alike, b are alike, …; not on the formula sheet' },
];

export const prompts = [
  'With n = 5 and r = 3, write the number of choices for each position by hand, then multiply. Compare with 5! ÷ 2!.',
  'Set r = n. Why does <sub>n</sub>P<sub>n</sub> equal n!? What does that say 0! must be?',
  'Switch to a word and type BOOK. The two O’s are identical: how many of the 4! orders look the same as another one?',
  'Type BANANA. Work out 6! ÷ (3! × 2!) by hand before you read the answer.',
  'Find a 5-letter word with exactly 30 different arrangements. What must its repeated letters be?',
];

const NAMES = 'ABCDEFGHI';
const LIST_LIMIT = 400; // longer lists are not generated at all

export function mount(ui) {
  const box = section(ui.controls, 'Arrangement');
  const mode = choice(box, {
    label: 'Arrange in a row',
    options: [
      { value: 'pick', label: 'r of n different objects' },
      { value: 'word', label: 'all the letters of a word' },
    ],
    value: 'pick',
  });
  const n = slider(box, { label: 'Objects to pick from, n', min: 1, max: 9, step: 1, value: 5 });
  const nRow = box.lastElementChild;
  const r = slider(box, { label: 'Positions to fill, r', min: 0, max: 9, step: 1, value: 3 });
  const rRow = box.lastElementChild;
  const wRow = el('div', { class: 'ctl ctl-choice' }, box);
  el('label', { for: 'ctl-word', text: 'Word (up to 12 letters)' }, wRow);
  const input = el('input', { id: 'ctl-word', type: 'text', value: 'BANANA', maxlength: '12', autocomplete: 'off', spellcheck: 'false' }, wRow);

  const pickOut = readouts(ui.readouts, [
    { id: 'nf', label: 'n!' },
    { id: 'df', label: '(n − r)!' },
    { id: 'p', label: '<sub>n</sub>P<sub>r</sub> = n! ÷ (n − r)!' },
  ]);
  const pickDl = ui.readouts.lastElementChild;
  const wordOut = readouts(ui.readouts, [
    { id: 'n', label: 'Letters, n' },
    { id: 'rep', label: 'Repeated letters' },
    { id: 'nf', label: 'n!' },
    { id: 'ways', label: 'Different arrangements' },
  ]);
  const wordDl = ui.readouts.lastElementChild;

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing moves

  // The lists are rebuilt only when the inputs change, not every frame.
  let listKey = '';
  let list = [];
  const listFor = (key, count, build) => {
    if (key !== listKey) {
      listKey = key;
      list = count <= LIST_LIMIT ? build() : [];
    }
    return list;
  };

  function draw() {
    const isWord = mode.value === 'word';
    nRow.hidden = rRow.hidden = pickDl.hidden = isWord;
    wRow.hidden = wordDl.hidden = !isWord;
    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const narrow = w < 620;
    const x0 = narrow ? 14 : 30;
    const W = w - 2 * x0;
    const big = narrow ? 14 : 17;

    // A row of boxes centred on the canvas; returns nothing, draws `labels`.
    const boxes = (labels, y, colorOf) => {
      const gap = 14;
      const size = Math.min(40, (W - (labels.length - 1) * gap) / labels.length);
      const left = w / 2 - (labels.length * size + (labels.length - 1) * gap) / 2;
      labels.forEach((s, i) => {
        const x = left + i * (size + gap);
        ctx.strokeStyle = colorOf?.(i) ?? th.muted;
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, y, size, size, 6);
        ctx.stroke();
        text(ctx, String(s), x + size / 2, y + size / 2 + 1, { color: th.ink, size: Math.min(18, size * 0.5), weight: 600, align: 'center' });
        if (i) text(ctx, isWord ? '' : '×', x - gap / 2, y + size / 2, { color: th.muted, size: 13, align: 'center' });
      });
      return y + size;
    };
    const listing = (items, y, title, total) => {
      text(ctx, title, x0, y, { color: th.muted, size: 12 });
      if (!items.length) return;
      const res = flow(ctx, items, x0, y + 22, W, { maxY: h - 34, grid: true, size: narrow ? 12 : 13, lineH: narrow ? 17 : 19 });
      if (res.shown < total) text(ctx, `… and ${fixed(total - res.shown, 0)} more`, x0, h - 14, { color: th.muted, size: 12 });
    };

    if (!isWord) {
      const N = n.value;
      const R = r.value;
      pickOut.set('nf', fixed(C.factorial(N), 0));
      if (R > N) {
        pickOut.set('df', '—');
        pickOut.set('p', '— r cannot be more than n');
        para(ctx, `There are only ${N} objects, so ${R} positions cannot all be filled.`, w / 2, h / 2 - 10, W, { color: th.danger, size: 14 });
        return;
      }
      const slots = C.slotChoices(N, R);
      const ways = C.nPr(N, R);
      pickOut.set('df', fixed(C.factorial(N - R), 0));
      pickOut.set('p', fixed(ways, 0));

      text(ctx, R ? 'Choices left for each position' : 'No positions to fill: one arrangement, the empty one', w / 2, 18, { color: th.muted, size: 12, align: 'center' });
      const y = R ? boxes(slots, 32) : 40;
      const work = R ? `${slots.join(' × ')} = ` : '';
      const below = para(ctx, `${subscript(N)}P${subscript(R)} = ${work}${fixed(ways, 0)}`, w / 2, y + 28, W, { color: th.ink, size: big, weight: 600 });
      const names = NAMES.slice(0, N).split('');
      const items = listFor(`p${N},${R}`, ways, () => C.listArrangements(names, R).map((a) => a.join('')));
      const title = ways > LIST_LIMIT ? `Too many to list: ${fixed(ways, 0)} arrangements` : `Every arrangement of ${R} from ${names.join(' ')}`;
      if (R) listing(items, below + 12, title, ways);
      return;
    }

    const word = input.value.toUpperCase().replace(/[^A-Z]/g, '');
    const counts = C.letterCounts(word);
    const repeats = counts.filter((c) => c.count > 1);
    const ways = C.arrangementsWithRepeats(counts.map((c) => c.count));
    const nFact = C.factorial(word.length);
    wordOut.set('n', String(word.length));
    wordOut.set('rep', repeats.length ? repeats.map((c) => `${c.letter} × ${c.count}`).join(', ') : 'none');
    wordOut.set('nf', fixed(nFact, 0));
    wordOut.set('ways', word ? fixed(ways, 0) : '—');
    if (!word) {
      text(ctx, 'Type a word.', w / 2, h / 2, { color: th.muted, size: 14, align: 'center' });
      return;
    }
    const repeated = new Set(repeats.map((c) => c.letter));
    const y = boxes(word.split(''), 20, (i) => (repeated.has(word[i]) ? th.seriesB : th.muted));
    const same = C.product(repeats.map((c) => C.factorial(c.count)));
    const work = repeats.length
      ? `${word.length}! ÷ ${repeats.length > 1 ? '(' : ''}${repeats.map((c) => `${c.count}!`).join(' × ')}${repeats.length > 1 ? ')' : ''} = ${fixed(nFact, 0)} ÷ ${fixed(same, 0)}`
      : `${word.length}!`;
    const below = para(ctx, `${work} = ${fixed(ways, 0)}`, w / 2, y + 28, W, { color: th.ink, size: big, weight: 600 });
    const items = listFor(`w${word}`, ways, () => C.listDistinctArrangements(word));
    const title = ways > LIST_LIMIT ? `Too many to list: ${fixed(ways, 0)} arrangements` : 'Every different arrangement';
    listing(items, below + 12, title, ways);
  }
}
