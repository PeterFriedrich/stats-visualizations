// A running tally of simulated values: their count and mean, and histogram
// counts over [lo, hi). Values outside the range still count toward the mean;
// `outside` says how many the histogram does not show.
export function createTally({ lo, hi, bins }) {
  const counts = new Array(bins).fill(0);
  let n = 0;
  let sum = 0;
  let outside = 0;
  return {
    lo,
    hi,
    counts,
    add(v) {
      n += 1;
      sum += v;
      const i = Math.floor(((v - lo) / (hi - lo)) * bins);
      if (i >= 0 && i < bins) counts[i] += 1;
      else outside += 1;
    },
    get n() {
      return n;
    },
    get mean() {
      return n ? sum / n : NaN;
    },
    get outside() {
      return outside;
    },
  };
}
