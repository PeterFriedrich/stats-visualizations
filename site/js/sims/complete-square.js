import * as Q from '../maths/quadratic.js';
import { fitCanvas, theme, clear, line, text, para, niceStep } from '../lib/canvas.js';
import { section, slider, choice, buttons, readouts, el } from '../lib/controls.js';
import { createClock } from '../lib/clock.js';
import { fixed } from '../lib/format.js';

export const equations = [
  { html: 'y = a<i>x</i><sup>2</sup> + b<i>x</i> + c', what: 'standard form' },
  { html: 'y = a(<i>x</i> − p)<sup>2</sup> + q', what: 'vertex form: the vertex is (p, q) and the axis of symmetry is x = p' },
  { html: '<i>x</i><sup>2</sup> + k<i>x</i> + (k ÷ 2)<sup>2</sup> = (<i>x</i> + k ÷ 2)<sup>2</sup>', what: 'the perfect square: half the x-coefficient, squared' },
  { html: 'p = −b ÷ 2a, &nbsp; q = c − b<sup>2</sup> ÷ 4a', what: 'what completing the square always gives' },
];

export const prompts = [
  'Pick x² + 6x + 5. Before pressing Next, write the vertex form on paper, then step through to check each line.',
  'In the picture, why does the corner piece have area (b ÷ 2)² and not b²?',
  'Pick x² − 8x + 7. The x-term now takes area away. Which piece gets taken away twice, and how does that explain the + 16?',
  'Pick 2x² + 12x − 3. Why does the −9 come out of the brackets as −18?',
  'Find two quadratics with the same vertex but different values of a. What do they share on the graph, and what is different?',
  'Make a quadratic with no x-intercepts. What has to be true of a and q?',
];

export const legend = [
  { color: 'series-a', label: 'x² square' },
  { color: 'stat', label: 'x strips' },
  { color: 'series-b', label: 'corner piece, (b ÷ 2a)²' },
  { color: 'danger', label: 'area taken away' },
];

export const tallOnMobile = true;

const PRESETS = [[1, 6, 5], [1, -8, 7], [1, 5, 2], [2, 12, -3], [-1, 4, 1], [3, -9, 2]];

// ---- writing numbers and terms the way a student does ----
const M = '−';
const r = Q.rat;
const ONE = r(1);
const absR = ([n, d]) => [Math.abs(n), d];
const isZero = (f) => f[0] === 0;
const val = ([n, d]) => n / d;

// `html` gives stacked fractions and italic x for the step list; plain text
// is for the canvas and the readouts.
function writer(html) {
  const num = ([n, d]) => (d === 1 ? `${n}` : html ? `<span class="fr"><span>${n}</span><span>${d}</span></span>` : `${n}/${d}`);
  const signed = (f) => (f[0] < 0 ? M : '') + num(absR(f));
  const w = {
    X: html ? '<i>x</i>' : 'x',
    X2: html ? '<i>x</i><sup>2</sup>' : 'x²',
    sq: html ? '<sup>2</sup>' : '²',
    num,
    signed,
    paren: (f) => (f[0] < 0 ? `(${signed(f)})` : signed(f)),
    // [[coefficient, variable]], skipping zero terms and writing 1x as x
    terms(list) {
      let out = '';
      for (const [c, v] of list) {
        if (isZero(c)) continue;
        const a = absR(c);
        const body = v && a[0] === 1 && a[1] === 1 ? v : num(a) + v;
        out += out === '' ? (c[0] < 0 ? M : '') + body : (c[0] < 0 ? ` ${M} ` : ' + ') + body;
      }
      return out || '0';
    },
    tail: (f) => (isZero(f) ? '' : (f[0] < 0 ? ` ${M} ` : ' + ') + num(absR(f))),
    aPre: (a) => (a === 1 ? '' : a === -1 ? M : (a < 0 ? M : '') + Math.abs(a)),
    square: (h) => `(${w.X} ${h[0] < 0 ? M : '+'} ${num(absR(h))})${w.sq}`,
  };
  return w;
}
const H = writer(true);
const T = writer(false);
const m = (s) => `<span class="math">${s}</span>`;

function vertexForm(w, a, cs) {
  return isZero(cs.h) ? `y = ${w.aPre(a)}${w.X2}${w.tail(cs.q)}` : `y = ${w.aPre(a)}${w.square(cs.h)}${w.tail(cs.q)}`;
}

function interceptsText(a, b, c) {
  const x = Q.xIntercepts(a, b, c);
  if (x.count === 0) return 'none';
  if (x.exact) return x.exact.map(T.signed).join(' and ');
  const { coef, radicand } = x.surd;
  const rad = `${coef[0] === 1 ? '' : coef[0]}√${radicand}${coef[1] === 1 ? '' : `/${coef[1]}`}`;
  const approx = x.approx.map((v) => fixed(v, 2)).join(', ');
  return `${isZero(x.p) ? '' : `${T.signed(x.p)} `}± ${rad} (≈ ${approx})`;
}

// The worked steps. `g` is the stage of the area model each step goes with.
function buildSteps(a, b, c) {
  const cs = Q.completeSquare(a, b, c);
  const { k, h, h2, ah2, q } = cs;
  const A = r(a);
  const aP = H.aPre(a);
  const aName = aP === M ? `${M}1` : aP;
  const inner = H.terms([[ONE, H.X2], [k, H.X]]);
  const steps = [{
    t: 'Start',
    m: `<i>y</i> = ${H.terms([[A, H.X2], [r(b), H.X], [r(c), '']])}`,
    w: `Standard form, with ${m(`a = ${H.signed(A)}`)}, ${m(`b = ${H.signed(r(b))}`)} and ${m(`c = ${H.signed(r(c))}`)}.`,
    g: 0,
  }];
  if (b === 0) {
    steps.push({ t: 'No x-term', m: `<i>y</i> = ${aP}(${H.X} ${M} 0)<sup>2</sup>${H.tail(r(c))}`, w: `There is no ${m(H.X)}-term, so there is nothing to complete: this is already vertex form with ${m('p = 0')}.`, g: 0 });
  } else {
    steps.push(a === 1
      ? { t: 'Group the x-terms', m: `<i>y</i> = (${inner})${H.tail(r(c))}`, w: `Bracket the ${m(H.X2)} and ${m(H.X)} terms. The constant waits outside.`, g: 1 }
      : { t: 'Factor a out of the x-terms', m: `<i>y</i> = ${aP}(${inner})${H.tail(r(c))}`, w: `Take out ${m(aName)} so that ${m(H.X2)} has coefficient 1. Inside, the ${m(H.X)}-coefficient is ${m(`${H.paren(r(b))} ÷ ${H.paren(A)} = ${H.signed(k)}`)}. Leave the constant alone.`, g: 1 });
    steps.push({ t: 'Halve the x-coefficient, then square it', m: `(${H.signed(k)} ÷ 2)<sup>2</sup> = ${H.paren(h)}<sup>2</sup> = ${H.num(h2)}`, w: `This is the corner piece that turns ${m(inner)} into a perfect square.`, g: 2 });
    steps.push({ t: 'Add it and subtract it inside', m: `<i>y</i> = ${aP}(${H.terms([[ONE, H.X2], [k, H.X], [h2, ''], [r(-h2[0], h2[1]), '']])})${H.tail(r(c))}`, w: `${m(`+${H.num(h2)} ${M} ${H.num(h2)}`)} adds zero, so the value of ${m('<i>y</i>')} does not change.`, g: 3 });
    const out = r(-ah2[0], ah2[1]);
    steps.push({
      t: 'Move the subtracted piece out',
      m: `<i>y</i> = ${aP}(${H.terms([[ONE, H.X2], [k, H.X], [h2, '']])})${H.tail(out)}${H.tail(r(c))}`,
      w: a === 1
        ? `The ${m(`${M}${H.num(h2)}`)} is not part of the square, so it moves outside the brackets.`
        : `It was inside ${m(`${aName}( … )`)}, so it comes out multiplied by ${m(aName)}: ${m(`${H.paren(A)} × (${M}${H.num(h2)}) = ${H.signed(out)}`)}.`,
      g: 3,
    });
    steps.push({ t: 'Write the perfect square', m: `<i>y</i> = ${aP}${H.square(h)}${H.tail(out)}${H.tail(r(c))}`, w: `Check by expanding: ${m(`${H.square(h)} = ${H.terms([[ONE, H.X2], [k, H.X], [h2, '']])}`)}.`, g: 4 });
    steps.push({ t: 'Combine the constants', m: vertexForm(H, a, cs).replace(/^y/, '<i>y</i>'), w: c === 0 ? 'Nothing to combine. This is vertex form.' : `${m(`${H.signed(out)}${H.tail(r(c))} = ${H.signed(q)}`)}. This is vertex form, ${m('<i>y</i> = a(<i>x</i> − p)<sup>2</sup> + q')}.`, g: 4 });
  }
  const p = cs.p;
  const shift = isZero(p) ? '' : ` ${m(`(${H.X} ${p[0] < 0 ? '+' : M} ${H.num(absR(p))}) = (${H.X} ${M} ${H.paren(p)})`)}, so ${m(`p = ${H.signed(p)}`)}.`;
  steps.push({
    t: 'Read off the vertex',
    m: steps[steps.length - 1].m,
    w: `<ul class="read-off"><li>Vertex ${m(`(${H.signed(p)}, ${H.signed(q)})`)}.${shift}</li><li>Axis of symmetry ${m(`<i>x</i> = ${H.signed(p)}`)}</li><li>Opens ${a > 0 ? 'up, so the minimum' : 'down, so the maximum'} value is ${m(H.signed(q))}</li></ul>`,
    g: 4,
  });
  return { cs, steps };
}

// ---- canvas helpers in design units (the area model is laid out on a 520 × 370 box) ----
function mtext(ctx, str, x, y, { size = 15, color, align = 'center', op = 1, rot = 0, italic = true } = {}) {
  if (op <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = op;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.font = `${italic ? 'italic ' : ''}${size}px "Cambria Math", "STIX Two Math", Georgia, serif`;
  ctx.fillStyle = color ?? theme().ink;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, 0, 0);
  ctx.restore();
}

function tile(ctx, x, y, w, h, color, { op = 1, fill = 0.18, width = 1.5, dash } = {}) {
  if (op <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = op * fill;
  ctx.fillStyle = color;
  if (fill) ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = op;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function hatch(ctx, x, y, w, h, color, op) {
  if (op <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = op;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let d = -h; d < w; d += 8) {
    ctx.moveTo(x + d, y + h);
    ctx.lineTo(x + d + h, y);
  }
  ctx.stroke();
  ctx.restore();
  tile(ctx, x, y, w, h, color, { op, fill: 0.06 });
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const fT = (f) => (f[0] < 0 ? '−' : '') + T.num(absR(f));
const coefT = (f) => (f[0] === 1 && f[1] === 1 ? '' : f[1] === 1 ? fT(f) : `(${fT(f)})`);

// The area model of x² + kx at stage g (0 to 4, fractional while animating).
function drawArea(ctx, region, g, cs) {
  const th = theme();
  const BW = 520;
  const BH = 370;
  const sc = Math.min(region.w / BW, region.h / BH);
  ctx.save();
  ctx.translate(region.x + (region.w - BW * sc) / 2, region.y + (region.h - BH * sc) / 2);
  ctx.scale(sc, sc);
  const ox = 70;
  const oy = 60;
  const X = 190; // x is unknown, so its length is arbitrary
  const hA = absR(cs.h);
  const hv = val(hA);
  const hT = fT(hA);
  const sqC = th.seriesA;
  const xC = th.stat;
  const cC = th.seriesB;

  tile(ctx, ox, oy, X, X, sqC);
  mtext(ctx, 'x', ox + X / 2, oy - 14, { color: th.muted });
  mtext(ctx, 'x', ox - 14, oy + X / 2, { color: th.muted, align: 'right' });
  if (isZero(cs.k)) {
    mtext(ctx, 'x²', ox + X / 2, oy + X / 2, { size: 26 });
    mtext(ctx, 'No x-term: nothing to complete.', ox + X / 2, oy + X + 34, { size: 15, color: th.muted, italic: false });
    ctx.restore();
    return;
  }

  if (cs.k[0] > 0) {
    const s = Math.max(14, Math.min(100, hv * 22));
    const split = clamp01(g);
    const move = ease(clamp01(g - 1));
    const corner = clamp01(g - 2);
    const outl = clamp01(g - 3);
    const x0 = ox + X + 40;
    const sep = 10 * split * (1 - move);
    const stripT = `${coefT(hA)}x`;
    mtext(ctx, 'x²', ox + X / 2, oy + X / 2, { size: 26 });

    // strip A slides left against the square
    const ax = lerp(x0, ox + X, move);
    tile(ctx, ax, oy, s, X, xC, { fill: 0.22 });
    if (s >= 22) mtext(ctx, stripT, ax + s / 2, oy + X / 2, { op: split, rot: -Math.PI / 2 });
    // strip B turns and slides under the square
    ctx.save();
    ctx.translate(lerp(x0 + s + sep + s / 2, ox + X / 2, move), lerp(oy + X / 2, oy + X + s / 2, move));
    ctx.rotate((-Math.PI / 2) * move);
    tile(ctx, -s / 2, -X / 2, s, X, xC, { fill: 0.22 });
    if (s >= 22) mtext(ctx, stripT, 0, 0, { op: split, rot: (-Math.PI / 2) * (1 - 2 * move) });
    ctx.restore();

    mtext(ctx, fT(cs.k), x0 + s, oy - 14, { color: th.muted, op: 1 - split });
    if (s < 22) mtext(ctx, `${fT(cs.k)}x`, x0 + s, oy + X + 18, { op: 1 - split });
    mtext(ctx, hT, ax + s / 2, oy - 14, { color: th.muted, op: split * (1 - outl) });
    mtext(ctx, hT, x0 + s + sep + s / 2, oy - 14, { color: th.muted, op: split * (1 - move) });
    mtext(ctx, hT, ox - 14, oy + X + s / 2, { color: th.muted, align: 'right', op: move * (1 - outl) });

    tile(ctx, ox + X, oy + X, s, s, cC, { op: move * (1 - corner), fill: 0, dash: [5, 4] });
    tile(ctx, ox + X, oy + X, s, s, cC, { op: corner, fill: 0.35 });
    const inside = s >= 34;
    mtext(ctx, inside ? fT(cs.h2) : `+ ${fT(cs.h2)}`, inside ? ox + X + s / 2 : ox + X + s + 8, oy + X + s / 2, { op: corner, align: inside ? 'center' : 'left' });

    if (outl > 0) {
      const L = X + s;
      ctx.save();
      ctx.globalAlpha = outl;
      tile(ctx, ox, oy, L, L, th.ink, { fill: 0, width: 2.5 });
      line(ctx, ox, oy - 36, ox + L, oy - 36, { color: th.muted, width: 1 });
      line(ctx, ox - 44, oy, ox - 44, oy + L, { color: th.muted, width: 1 });
      ctx.restore();
      mtext(ctx, `x + ${hT}`, ox + L / 2, oy - 48, { op: outl });
      mtext(ctx, `x + ${hT}`, ox - 56, oy + L / 2, { op: outl, rot: -Math.PI / 2 });
    }
  } else {
    const s = Math.max(14, Math.min(80, hv * 22));
    const strips = clamp01(g);
    const widths = clamp01(g - 1);
    const corner = clamp01(g - 2);
    const remain = clamp01(g - 3);
    const takeT = `−${coefT(hA)}x`;
    mtext(ctx, 'x²', ox + (X - s) / 2, oy + (X - s) / 2, { size: 26, op: 1 - remain });
    hatch(ctx, ox + X - s, oy, s, X, th.danger, strips);
    hatch(ctx, ox, oy + X - s, X, s, th.danger, strips);
    mtext(ctx, widths > 0.5 ? `${takeT} each` : takeT, ox + X + 10, oy + (X - s) / 2, { op: strips, align: 'left' });
    mtext(ctx, takeT, ox + (X - s) / 2, oy + X + 20, { op: strips * (1 - widths) });
    mtext(ctx, hT, ox + X - s / 2, oy - 14, { color: th.muted, op: widths });
    mtext(ctx, hT, ox - 14, oy + X - s / 2, { color: th.muted, align: 'right', op: widths });
    tile(ctx, ox + X - s, oy + X - s, s, s, th.danger, { op: widths * (1 - corner), fill: 0, width: 2.5 });
    mtext(ctx, 'taken twice', ox + X + 10, oy + X - s / 2, { color: th.muted, op: widths * (1 - corner), align: 'left', italic: false });
    tile(ctx, ox + X - s, oy + X - s, s, s, th.seriesB, { op: corner, fill: 0.45 });
    mtext(ctx, `+ ${fT(cs.h2)} back`, ox + X + 10, oy + X - s / 2, { op: corner, align: 'left' });
    tile(ctx, ox, oy, X - s, X - s, th.ink, { op: remain, fill: 0, width: 2.5 });
    mtext(ctx, `(x − ${hT})²`, ox + (X - s) / 2, oy + (X - s) / 2, { size: 24, op: remain });
  }
  ctx.restore();
}

// y = ax² + bx + c around its vertex; the vertex, axis and intercepts appear once the steps are done.
function drawGraph(ctx, R, a, b, c, cs, done) {
  const th = theme();
  const pv = val(cs.p);
  const xi = Q.xIntercepts(a, b, c);
  let half = 4;
  if (xi.count === 2) half = Math.max(half, Math.abs(xi.approx[1] - pv) + 1.5);
  const xMin = Math.min(pv - half, -1);
  const xMax = Math.max(pv + half, 1);
  const pts = [];
  let yMin = 0;
  let yMax = 0;
  for (let i = 0; i <= 200; i++) {
    const x = xMin + ((xMax - xMin) * i) / 200;
    const y = Q.evaluate(a, b, c, x);
    pts.push([x, y]);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  }
  const pad = (yMax - yMin) * 0.08 || 1;
  yMin -= pad;
  yMax += pad;
  const l = R.x + 40;
  const rr = R.x + R.w - 10;
  const t = R.y + 10;
  const bt = R.y + R.h - 24;
  const sx = (x) => l + ((x - xMin) / (xMax - xMin)) * (rr - l);
  const sy = (y) => t + ((yMax - y) / (yMax - yMin)) * (bt - t);
  const minus = (v) => String(+v.toFixed(6)).replace('-', '−');
  const xs = niceStep(xMax - xMin, 7);
  const ys = niceStep(yMax - yMin, 6);
  for (let x = Math.ceil(xMin / xs) * xs; x <= xMax + 1e-9; x += xs) {
    line(ctx, sx(x), t, sx(x), bt, { color: th.grid, width: 1 });
    text(ctx, minus(x), sx(x), bt + 12, { color: th.muted, size: 11, align: 'center' });
  }
  for (let y = Math.ceil(yMin / ys) * ys; y <= yMax + 1e-9; y += ys) {
    line(ctx, l, sy(y), rr, sy(y), { color: th.grid, width: 1 });
    text(ctx, minus(y), l - 6, sy(y), { color: th.muted, size: 11, align: 'right' });
  }
  line(ctx, l, sy(0), rr, sy(0), { color: th.muted, width: 1.2 });
  line(ctx, sx(0), t, sx(0), bt, { color: th.muted, width: 1.2 });
  if (done) line(ctx, sx(pv), t, sx(pv), bt, { color: th.seriesB, width: 1.4, dash: [5, 4] });
  ctx.save();
  ctx.beginPath();
  ctx.rect(l, t, rr - l, bt - t);
  ctx.clip();
  ctx.strokeStyle = th.seriesA;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y))));
  ctx.stroke();
  ctx.restore();
  if (!done) return;
  for (const x of xi.approx) {
    ctx.beginPath();
    ctx.arc(sx(x), sy(0), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = th.surface;
    ctx.fill();
    ctx.strokeStyle = th.stat;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }
  const vx = sx(pv);
  const vy = sy(val(cs.q));
  ctx.beginPath();
  ctx.arc(vx, vy, 6, 0, Math.PI * 2);
  ctx.fillStyle = th.seriesB;
  ctx.fill();
  const right = vx > (l + rr) / 2;
  const ly = Math.max(t + 10, Math.min(bt - 10, a > 0 ? vy + 20 : vy - 16));
  mtext(ctx, `(${fT(cs.p)}, ${fT(cs.q)})`, right ? vx - 10 : vx + 10, ly, { size: 14, align: right ? 'right' : 'left', italic: false });
}

export function mount(ui) {
  const box = section(ui.controls, 'Quadratic');
  const example = choice(box, {
    label: 'Example',
    options: [
      ...PRESETS.map(([a, b, c]) => ({ value: `${a},${b},${c}`, label: `y = ${T.terms([[r(a), 'x²'], [r(b), 'x'], [r(c), '']])}` })),
      { value: 'own', label: 'Your own (use the sliders)' },
    ],
    value: '1,6,5',
  });
  const sa = slider(box, { label: 'a', min: -5, max: 5, step: 1, value: 1 });
  const sb = slider(box, { label: 'b', min: -20, max: 20, step: 1, value: 6 });
  const sc = slider(box, { label: 'c', min: -20, max: 20, step: 1, value: 5 });

  const out = readouts(ui.readouts, [
    { id: 'form', label: 'Vertex form' },
    { id: 'vertex', label: 'Vertex (p, q)' },
    { id: 'axis', label: 'Axis of symmetry' },
    { id: 'ext', label: 'Minimum or maximum' },
    { id: 'xint', label: 'x-intercepts' },
    { id: 'yint', label: 'y-intercept' },
  ]);

  ui.steps.hidden = false;
  const head = el('div', { class: 'steps-head' }, ui.steps);
  el('h2', { text: 'Algebra, step by step' }, head);
  const [prevB, nextB, allB, resetB] = buttons(head, [
    { label: '← Back', onClick: () => go(cur - 1) },
    { label: 'Next step →', onClick: () => go(cur + 1), primary: true },
    { label: 'Show all', onClick: () => go(Infinity) },
    { label: 'Start over', onClick: () => go(0) },
  ]);
  const count = el('span', { class: 'steps-count' }, head);
  const list = el('ol', { class: 'steps-list' }, ui.steps);

  const canvas = fitCanvas(ui.canvas);
  createClock(ui.transport, { frame: draw });
  ui.transport.hidden = true; // nothing runs in simulated time

  let key = '';
  let built = null;
  let cur = 0;
  let g = 0;
  let last = performance.now();
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  function go(i) {
    if (!built) return;
    cur = Math.max(0, Math.min(built.steps.length - 1, i));
    renderSteps();
  }

  function renderSteps() {
    const { steps } = built;
    list.innerHTML = '';
    steps.forEach((s, i) => {
      if (i > cur) return;
      el('li', { class: i === cur ? 'now' : 'past', html: `<div class="step-title">${s.t}</div><div class="step-math">${s.m}</div><div class="step-why">${s.w}</div>` }, list);
    });
    if (cur < steps.length - 1) el('li', { class: 'ghost', html: `<div class="step-title">Next: ${steps[cur + 1].t}</div><div class="step-why">Try it on paper first, then press Next step.</div>` }, list);
    count.textContent = `Step ${cur + 1} of ${steps.length}`;
    prevB.disabled = resetB.disabled = cur === 0;
    nextB.disabled = allB.disabled = cur === steps.length - 1;
  }

  example.onChange((v) => {
    if (v === 'own') return;
    [sa.value, sb.value, sc.value] = v.split(',').map(Number);
  });

  function draw() {
    const a = sa.value;
    const b = sb.value;
    const c = sc.value;
    const k = `${a},${b},${c}`;
    if (k !== key) {
      key = k;
      example.value = PRESETS.some((p) => p.join() === k) ? k : 'own';
      built = a === 0 ? null : buildSteps(a, b, c);
      cur = 0;
      g = 0;
      if (built) renderSteps();
      else {
        list.innerHTML = '';
        el('li', { class: 'now', html: '<div class="step-why">With a = 0 there is no x² term, so this is a line, not a quadratic. Move the a slider.</div>' }, list);
        count.textContent = '';
        [prevB, nextB, allB, resetB].forEach((btn) => (btn.disabled = true));
      }
    }

    const { ctx, w, h } = canvas;
    const th = theme();
    clear(ctx, w, h);
    if (!built) {
      ['form', 'vertex', 'axis', 'ext', 'xint', 'yint'].forEach((id) => out.set(id, '—'));
      para(ctx, 'a = 0 gives a line, not a quadratic.', w / 2, h / 2, w - 40, { color: th.danger, size: 15 });
      return;
    }

    const now = performance.now();
    const target = built.steps[cur].g;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    g = reduce?.matches ? target : g < target ? Math.min(target, g + dt * 2) : Math.max(target, g - dt * 2);

    const { cs } = built;
    const done = cur === built.steps.length - 1;
    const narrow = w < 620;
    const areaR = narrow ? { x: 4, y: 4, w: w - 8, h: h * 0.52 } : { x: 6, y: 6, w: w * 0.54, h: h - 12 };
    const graphR = narrow ? { x: 8, y: h * 0.54, w: w - 16, h: h * 0.46 - 6 } : { x: w * 0.56, y: 16, w: w * 0.44 - 12, h: h - 28 };
    drawArea(ctx, areaR, g, cs);
    if (!narrow) line(ctx, w * 0.55, 16, w * 0.55, h - 16, { color: th.grid, width: 1 });
    drawGraph(ctx, graphR, a, b, c, cs, done);

    if (!done) {
      ['form', 'vertex', 'axis', 'ext', 'xint'].forEach((id) => out.set(id, 'after the last step'));
    } else {
      out.set('form', vertexForm(T, a, cs));
      out.set('vertex', `(${T.signed(cs.p)}, ${T.signed(cs.q)})`);
      out.set('axis', `x = ${T.signed(cs.p)}`);
      out.set('ext', `${a > 0 ? 'minimum' : 'maximum'} y = ${T.signed(cs.q)}`);
      out.set('xint', interceptsText(a, b, c));
    }
    out.set('yint', `(0, ${T.signed(r(c))})`);
  }
}
