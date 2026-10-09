import * as C from '../maths/counting.js';
import { fitCanvas, theme, clear, line, text, para, flow } from '../lib/canvas.js';
import { section, slider, choice, readouts } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { fixed, subscript } from '../lib/format.js';

export const equations = [
  { html: '<sub>n</sub>C<sub>r</sub> = n! ÷ ((n − r)! r!)', what: 'selections of r objects from n different objects; order does not matter' },
  { html: '<sub>n</sub>C<sub>r</sub> = <sub>n</sub>P<sub>r</sub> ÷ r!', what: 'each selection can be arranged r! ways, and all of those are the same selection' },
  { html: '<sub>n</sub>C<sub>r</sub> = <sub>n</sub>C<sub>n − r</sub>', what: 'choosing r to take is the same as choosing n − r to leave' },
  { html: 'cases add; choices inside a case multiply', what: '“at least” and “at most” split into cases that cannot happen together' },
];

export const prompts = [
  'With n = 5 and r = 3, how many arrangements does each selection stand for? Check that <sub>5</sub>P<sub>3</sub> ÷ 3! gives the list length.',
  'Compare r = 2 and r = n − 2. Why are the two answers equal?',
  'Switch to the committee. With 5 students and 4 teachers, find the number of committees of 3 with at least 2 teachers by hand: which cases do you need?',
  'Change “at least 2” to “at most 1”. Add your two answers. What do they total, and why?',
  'Is “at least 1 teacher” quicker as three cases, or as all committees minus the committees with no teachers?',
];

const NAMES = 'ABCDEFGHIJKL';
const LIST_LIMIT = 400;

export function mount(ui) {
  const box = section(ui.controls, 'Selection');
  const mode = choice(box, {
    label: 'Choose',
    options: [
      { value: 'choose', label: 'r of n different objects' },
      { value: 'cases', label: 'a committee from two groups' },
    ],
    value: 'choose',
  });
  const rows = { choose: [], cases: [] };
  const add = (kind, ctl) => (rows[kind].push(box.lastElementChild), ctl);
  const n = add('choose', slider(box, { label: 'Objects to choose from, n', min: 1, max: 12, step: 1, value: 5 }));
  const r = add('choose', slider(box, { label: 'Objects chosen, r', min: 0, max: 12, step: 1, value: 3 }));
  const students = add('cases', slider(box, { label: 'Students to choose from', min: 1, max: 10, step: 1, value: 5 }));
  const teachers = add('cases', slider(box, { label: 'Teachers to choose from', min: 1, max: 10, step: 1, value: 4 }));
  const size = add('cases', slider(box, { label: 'Committee size', min: 1, max: 8, step: 1, value: 3 }));
  const cond = add('cases', choice(box, {
    label: 'The committee must have',
    options: [
      { value: 'atLeast', label: 'at least …' },
      { value: 'exactly', label: 'exactly …' },
      { value: 'atMost', label: 'at most …' },
    ],
    value: 'atLeast',
  }));
  const m = add('cases', slider(box, { label: '… this many teachers', min: 0, max: 8, step: 1, value: 2 }));

  const chooseOut = readouts(ui.readouts, [
    { id: 'p', label: '<sub>n</sub>P<sub>r</sub> (order matters)' },
    { id: 'rf', label: 'r!' },
    { id: 'c', label: '<sub>n</sub>C<sub>r</sub> = <sub>n</sub>P<sub>r</sub> ÷ r!' },
    { id: 'left', label: '<sub>n</sub>C<sub>n − r</sub> (choosing what to leave)' },
  ]);
  const chooseDl = ui.readouts.lastElementChild;
  const casesOut = readouts(ui.readouts, [
    { id: 'fit', label: 'Committees that fit' },
    { id: 'all', label: 'All committees of that size' },
  ]);
  const casesDl = ui.readouts.lastElementChild;

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing moves

  let listKey = '';
  let list = [];

  function draw() {
    const isCases = mode.value === 'cases';
    rows.choose.forEach((row) => (row.hidden = isCases));
    rows.cases.forEach((row) => (row.hidden = !isCases));
    chooseDl.hidden = isCases;
    casesDl.hidden = !isCases;
    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    const narrow = w < 620;
    const x0 = narrow ? 14 : 30;
    const W = w - 2 * x0;
    const big = narrow ? 14 : 17;
    const nCrText = (a, b) => `${subscript(a)}C${subscript(b)}`;

    if (!isCases) {
      const N = n.value;
      const R = r.value;
      if (R > N) {
        ['p', 'rf', 'left'].forEach((id) => chooseOut.set(id, '—'));
        chooseOut.set('c', '— r cannot be more than n');
        para(ctx, `There are only ${N} objects, so ${R} cannot be chosen.`, w / 2, h / 2 - 10, W, { color: th.danger, size: 14 });
        return;
      }
      const ways = C.nCr(N, R);
      const rFact = C.factorial(R);
      chooseOut.set('p', fixed(C.nPr(N, R), 0));
      chooseOut.set('rf', fixed(rFact, 0));
      chooseOut.set('c', fixed(ways, 0));
      chooseOut.set('left', fixed(C.nCr(N, N - R), 0));

      text(ctx, `${nCrText(N, R)} = ${N}! ÷ (${N - R}! × ${R}!) = ${fixed(ways, 0)}`, w / 2, 24, { color: th.ink, size: big, weight: 600, align: 'center' });
      const note = [`Each selection can be arranged ${R}! = ${fixed(rFact, 0)} ways,`, `so ${subscript(N)}P${subscript(R)} = ${fixed(ways, 0)} × ${fixed(rFact, 0)} = ${fixed(C.nPr(N, R), 0)}`];
      if (narrow) note.forEach((s, i) => text(ctx, s, w / 2, 50 + i * 17, { color: th.muted, size: 12, align: 'center' }));
      else text(ctx, note.join(' '), w / 2, 52, { color: th.muted, size: 13, align: 'center' });
      const y = narrow ? 96 : 88;
      const names = NAMES.slice(0, N).split('');
      const key = `${N},${R}`;
      if (key !== listKey) {
        listKey = key;
        list = ways <= LIST_LIMIT ? C.listSelections(names, R).map((s) => s.join('') || '(none)') : [];
      }
      text(ctx, ways > LIST_LIMIT ? `Too many to list: ${fixed(ways, 0)} selections` : `Every selection of ${R} from ${names.join(' ')}`, x0, y, { color: th.muted, size: 12 });
      if (list.length) {
        const res = flow(ctx, list, x0, y + 22, W, { maxY: h - 34, grid: true, size: narrow ? 12 : 13, lineH: narrow ? 17 : 19 });
        if (res.shown < ways) text(ctx, `… and ${fixed(ways - res.shown, 0)} more`, x0, h - 14, { color: th.muted, size: 12 });
      }
      return;
    }

    const a = students.value;
    const b = teachers.value;
    const k = size.value;
    if (k > a + b) {
      casesOut.set('fit', '— the committee is bigger than the pool');
      casesOut.set('all', '—');
      para(ctx, `Only ${a + b} people to choose from, so a committee of ${k} is not possible.`, w / 2, h / 2 - 10, W, { color: th.danger, size: 14 });
      return;
    }
    const cases = C.committeeCases(a, b, k);
    const fit = C.countCommittees(cases, cond.value, m.value);
    casesOut.set('fit', fixed(fit, 0));
    casesOut.set('all', `${nCrText(a + b, k)} = ${fixed(C.nCr(a + b, k), 0)}`);

    const size12 = narrow ? 12 : 14;
    const cols = [x0 + 22, x0 + (narrow ? 92 : 120), x0 + (narrow ? 162 : 220)];
    const top = 22;
    ['Teachers', 'Students', narrow ? 'Ways' : 'Ways: teachers × students'].forEach((s, i) => text(ctx, s, cols[i], top, { color: th.muted, size: 12, weight: 600 }));
    line(ctx, x0, top + 12, w - x0, top + 12, { color: th.grid, width: 1 });
    const rowH = Math.min(30, (h - top - (narrow ? 104 : 70)) / cases.length);
    const chosen = [];
    cases.forEach((c, i) => {
      const y = top + 14 + (i + 0.5) * rowH;
      const on = C.fits(cond.value, m.value, c.fromB);
      const color = on ? th.ink : th.muted;
      if (on) {
        chosen.push(c.ways);
        text(ctx, '✓', x0 + 2, y, { color: th.stat, size: 14, weight: 700 });
      }
      text(ctx, String(c.fromB), cols[0], y, { color, size: size12, weight: on ? 600 : 500 });
      text(ctx, String(c.fromA), cols[1], y, { color, size: size12, weight: on ? 600 : 500 });
      const product = narrow ? '' : ` = ${fixed(c.waysB, 0)} × ${fixed(c.waysA, 0)}`;
      text(ctx, `${nCrText(b, c.fromB)} × ${nCrText(a, c.fromA)}${product} = ${fixed(c.ways, 0)}`, cols[2], y, { color, size: size12, weight: on ? 600 : 500 });
    });
    const sumY = top + 14 + cases.length * rowH + 22;
    line(ctx, x0, sumY - 16, w - x0, sumY - 16, { color: th.grid, width: 1 });
    const sum = chosen.length > 1 ? `${chosen.map((v) => fixed(v, 0)).join(' + ')} = ` : '';
    const label = chosen.length ? `Add the cases that fit: ${sum}${fixed(fit, 0)} committees` : 'No case fits: 0 committees';
    flow(ctx, label.split(' '), x0, sumY, W, { size: narrow ? 13 : 15, weight: 600, gap: 5, lineH: 20 });
  }
}
