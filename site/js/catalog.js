// Every simulation the site hosts. The home page and the sim page both render
// from this list; tests/catalog.test.js checks that each entry has a module
// under js/sims/ exporting what sim-page.js needs.
//
// Mathematics 30-1 and 30-2 units are the Alberta program-of-studies topics
// this site covers (counting and probability only). STAT 151 units follow the
// University of Alberta calendar description (docs/SPEC_phase1.md §3).

export const courses = [
  {
    id: 'm30-1',
    title: 'Mathematics 30-1',
    units: [{ id: 'pcb', title: 'Permutations, Combinations, and Binomial Theorem' }],
  },
  {
    id: 'm30-2',
    title: 'Mathematics 30-2',
    units: [{ id: 'probability', title: 'Probability' }],
  },
  {
    id: 'stat151',
    title: 'STAT 151',
    units: [
      { id: 'descriptive', title: 'Data Collection and Descriptive Statistics' },
      { id: 'distributions', title: 'Probability Distributions' },
      { id: 'sampling', title: 'Sampling Distributions and the Central Limit Theorem' },
      { id: 'inference', title: 'Point Estimation and Hypothesis Testing' },
      { id: 'regression', title: 'Correlation and Regression' },
      { id: 'tables', title: 'Goodness of Fit and Contingency Tables' },
    ],
  },
];

export const sims = [
  {
    id: 'bessel',
    course: 'stat151',
    unit: 'sampling',
    title: 'Why Divide by n − 1? Bessel’s Correction',
    summary: 'Draw sample after sample from a normal population and estimate its variance two ways: dividing the squared deviations by n, and by n − 1. Watch the ÷ n estimates average out below the true σ², by exactly the factor (n − 1)/n, while the ÷ (n − 1) estimates centre on σ².',
    concepts: ['sample variance', 'biased and unbiased estimators', 'sampling distribution', 'bias = −σ²/n'],
  },
];

export function findSim(id) {
  return sims.find((s) => s.id === id) ?? null;
}

export function unitOf(sim) {
  const course = courses.find((c) => c.id === sim.course);
  return { course, unit: course?.units.find((u) => u.id === sim.unit) };
}
