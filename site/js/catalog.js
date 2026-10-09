// Every simulation the site hosts. The home page and the sim page both render
// from this list; tests/catalog.test.js checks that each entry has a module
// under js/sims/ exporting what sim-page.js needs.
//
// Mathematics 30-1 and 30-2 units are the Alberta program-of-studies topics
// this site covers (counting and probability only). Mathematics 20-1 units are
// added one at a time as the owner names them (docs/SPEC_phase1.md §3). STAT 151 units follow the
// University of Alberta calendar description (docs/SPEC_phase1.md §3).

export const courses = [
  {
    id: 'm20-1',
    title: 'Mathematics 20-1',
    units: [{ id: 'quadratics', title: 'Quadratic Functions and Equations' }],
  },
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
    id: 'complete-square',
    course: 'm20-1',
    unit: 'quadratics',
    title: 'Completing the Square',
    summary: 'Rewrite y = ax² + bx + c in vertex form, y = a(x − p)² + q, one step at a time. An area model shows why it works: the x-term splits into two strips around the x² square, and the missing corner, (b ÷ 2a)², completes it. The graph shows the vertex the steps lead to.',
    concepts: ['vertex form y = a(x − p)² + q', 'area model', 'vertex and axis of symmetry', 'x-intercepts'],
  },
  {
    id: 'odds',
    course: 'm30-2',
    unit: 'probability',
    title: 'Odds and Probability',
    summary: 'Set the favourable and unfavourable outcomes. Odds compare the two parts; probability compares one part with the whole. Read the odds in favour, the odds against, P(A) and P(A′), and see why 1 : 4 is not a 1 in 4 chance.',
    concepts: ['odds in favour and against', 'part : part and part ÷ whole', 'complement'],
  },
  {
    id: 'venn',
    course: 'm30-2',
    unit: 'probability',
    title: '“Or”: Mutually Exclusive or Not',
    summary: 'Two events in one sample space, drawn as a Venn diagram. When A and B share outcomes, adding P(A) and P(B) counts the shared ones twice, so P(A ∩ B) comes off once. When they share nothing, the probabilities just add.',
    concepts: ['P(A ∪ B)', 'mutually exclusive events', 'Venn diagrams', 'inclusive “or”'],
  },
  {
    id: 'tree',
    course: 'm30-2',
    unit: 'probability',
    title: '“And”: Independent and Dependent Events',
    summary: 'Draw two marbles from a bag, with or without putting the first one back. The tree diagram shows each branch probability; multiply along a path for “and”, add paths for “or”. Without replacement the second draw depends on the first: P(B | A).',
    concepts: ['P(A ∩ B)', 'conditional probability P(B | A)', 'tree diagrams', 'with and without replacement'],
  },
  {
    id: 'counting',
    course: 'm30-1',
    unit: 'pcb',
    also: [{ course: 'm30-2', unit: 'probability' }],
    title: 'The Fundamental Counting Principle',
    summary: 'Build an outfit one choice at a time and watch the tree branch. The number of outfits is the product of the options at each step: a × b × c × …',
    concepts: ['fundamental counting principle', 'tree diagrams', 'multiply for “and then”'],
  },
  {
    id: 'permutations',
    course: 'm30-1',
    unit: 'pcb',
    also: [{ course: 'm30-2', unit: 'probability' }],
    title: 'Permutations: Order Matters',
    summary: 'Arrange r of n different objects in a row and see the choices shrink position by position, n × (n − 1) × …, which is n! ÷ (n − r)!. Then arrange the letters of a word, where repeated letters make some orders look the same.',
    concepts: ['n!', 'nPr = n! ÷ (n − r)!', 'repeated elements', 'listing arrangements'],
  },
  {
    id: 'combinations',
    course: 'm30-1',
    unit: 'pcb',
    also: [{ course: 'm30-2', unit: 'probability' }],
    title: 'Combinations: Order Does Not Matter',
    summary: 'Choose r of n objects and list every selection: each one stands for r! arrangements, so nCr = nPr ÷ r!. Then pick a committee from two groups with “at least”, “at most” or “exactly”, split into cases and add them.',
    concepts: ['nCr = n! ÷ ((n − r)! r!)', 'nCr = nC(n − r)', 'cases: at least, at most', 'committees'],
  },
  {
    id: 'binomial',
    course: 'm30-1',
    unit: 'pcb',
    title: 'The Binomial Theorem and Pascal’s Triangle',
    summary: 'Expand (ax + by)ⁿ. Row n of Pascal’s triangle gives the nCk in each term; pick a term number to see the general term, nCk (ax)ⁿ⁻ᵏ (by)ᵏ, worked out.',
    concepts: ['Pascal’s triangle', 'general term', 'n + 1 terms', 'coefficients with a and b'],
  },
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

// Every { course, unit } a sim is listed under: its own, then any in `also`
// (the counting sims serve both mathematics courses).
export function placements(sim) {
  return [{ course: sim.course, unit: sim.unit }, ...(sim.also ?? [])].map((p) => {
    const course = courses.find((c) => c.id === p.course);
    return { course, unit: course?.units.find((u) => u.id === p.unit) };
  });
}

export function simsIn(courseId, unitId) {
  return sims.filter((s) => placements(s).some((p) => p.course?.id === courseId && p.unit?.id === unitId));
}
