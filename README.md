# stats-visualizations

Interactive simulations for tutoring **counting, probability and introductory
statistics**: Alberta Mathematics 30-1 (permutations, combinations and the
binomial theorem), Mathematics 30-2 (probability) and STAT 151. Each sim shows
the idea, lets the student change the variables, and prints readouts that match
a hand calculation with the course formula sheet. A readout that comes from
random draws is labelled as simulated and can be reproduced from its seed.

| Course | Topic | Simulations |
|---|---|---|
| Mathematics 30-1 | Permutations, Combinations, and Binomial Theorem | Fundamental counting principle; permutations; combinations; binomial theorem and Pascal's triangle |
| Mathematics 30-2 | Probability | Odds and probability; "or" on a Venn diagram; "and" on a tree diagram; plus the three counting sims |
| STAT 151 | Sampling distributions and the central limit theorem | Why divide by n − 1? Bessel's correction |

More are planned for every topic — see `docs/SPEC_phase1.md` and `TODO.md`.
Every page has a "Key equations" list and "Try this" predict-and-check prompts.

## Run it

No install and no build step: plain HTML, CSS and ES modules.

```bash
./bootstrap.sh     # enables the git hooks, runs the tests
npm run serve      # http://localhost:8000
```

(Opening `site/index.html` straight from disk does not work: browsers block ES
modules on `file://`.)

## Check it

```bash
npm run check      # unit tests + doc guards (the CI merge gate)
npm run verify     # every page in headless Chromium; screenshots in output/
VERIFY_WIDTHS=390,1280 VERIFY_THEME=dark npm run verify
```

## Deploy

`.github/workflows/deploy.yml` builds `site/` with `tools/build-site.js`,
which cache-busts every asset, and publishes it to GitHub Pages on every push
to `main` after re-running the tests (Pages source: **GitHub Actions**).

## Working on it

A sibling of [physics_sim](https://github.com/PeterFriedrich/physics_sim) and
chemistry_sim, with the same workflow from
[cc-data-project-template](https://github.com/PeterFriedrich/cc-data-project-template):
spec → architecture → one module at a time with tests, a decisions log whose
rows cite tests, `/handoff` notes between sessions, and a pre-push hook that
refuses to push to an already-merged branch. Start with `CLAUDE.md`,
`CONTRIBUTING.md` and `TODO.md`.

This repo was a PyQt6 desktop app until 2026-10-01; that version is in the git
history.

Not affiliated with Alberta Education or the University of Alberta.
