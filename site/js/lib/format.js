// Number formatting for readouts: significant figures, and scientific notation
// written the way students write it (1.60 × 10⁻¹⁹), not as 1.6e-19.

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const minus = (s) => s.replace(/^-/, '−');

export function superscript(n) {
  return String(n).split('').map((ch) => SUP[ch] ?? ch).join('');
}

// Whole-number subscripts, for ₅P₃ and ₅C₃ on the canvas (no markup there).
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
export function subscript(n) {
  return String(n).replace(/\d/g, (d) => SUBS[d]);
}

export function fmt(x, sig = 3) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
  if (x === 0) return (0).toPrecision(sig);
  const ax = Math.abs(x);
  if (ax >= 1e5 || ax < 1e-3) {
    const [mant, exp] = x.toExponential(sig - 1).split('e');
    return `${minus(mant)} × 10${superscript(parseInt(exp, 10))}`;
  }
  const s = x.toPrecision(sig);
  // toPrecision switches to e-notation once the integer part has more digits than `sig`.
  return minus(s.includes('e') ? String(Number(s)) : s);
}

// Fixed decimal places, for probabilities and simulated averages. Digits are
// grouped in threes with a narrow space from 1 000 up ("3 628 800").
export function fixed(x, dp) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  let s = Math.abs(x).toFixed(dp);
  if (Number(s) === 0) return s; // no "−0.0"
  const [int, frac] = s.split('.');
  s = (int.length > 3 ? int.replace(/\B(?=(\d{3})+$)/g, '\u202f') : int) + (frac ? `.${frac}` : '');
  return x < 0 ? `−${s}` : s;
}

// A fraction given as a [numerator, denominator] pair of whole numbers, the way
// students write it: 3/8, or a bare whole number when the denominator is 1.
export function frac([n, d]) {
  return d === 1 ? String(n) : `${n}/${d}`;
}

// The fraction and its decimal value: "3/8 = 0.375".
export function fracDec([n, d], dp = 3) {
  return d === 1 ? String(n) : `${n}/${d} = ${fixed(n / d, dp)}`;
}

export function withUnit(x, unit, sig = 3) {
  const s = fmt(x, sig);
  return unit ? `${s} ${unit}` : s;
}

// Floating-point residue (a bias of 1e-17) would print as a real
// number in scientific notation. Snap values that are tiny *relative to the
// quantity's own scale* to zero. There is no absolute threshold: a
// probability of 1.6 × 10⁻¹⁹ is a real value.
export function snap(x, scale) {
  return Math.abs(x) < 1e-9 * Math.abs(scale) ? 0 : x;
}
