# Architecture

## 1. Shape

A static site with no build step and no dependencies. ES modules are served
as-is from `site/`, so GitHub Pages (or any static host) can publish the folder
directly, and tests import the same files the browser runs. The apparatus is
copied from chemistry_sim (itself copied from physics_sim); it replaced a PyQt6
desktop app on 2026-10-01.

```
site/
├── index.html            home: renders the catalog
├── sim.html              one page for every sim: ?id=<catalog id>
├── css/style.css         tokens (light + dark), layout
└── js/
    ├── catalog.js        courses, units, sims — the single list
    ├── home.js           home page renderer
    ├── sim-page.js       loads js/sims/<id>.js into sim.html
    ├── maths/            pure functions, seeded randomness, no DOM   ← tested
    ├── lib/              canvas, controls, clock, format
    └── sims/             one module per simulation: UI + drawing only
tests/                    node:test — stats, format, catalog, repo invariants
tools/                    serve.js (dev server), verify-sims.js (browser smoke test)
scripts/                  Python guards from the workflow template (stdlib only)
```

## 2. Layers and what each may do

| Layer | May | May not |
|---|---|---|
| `maths/` | maths, counting, random draws from a passed-in `rng` | touch the DOM, format numbers, know about pixels, call `Math.random()` |
| `lib/` | DOM, canvas, formatting | contain statistics or counting formulas |
| `sims/` | wire controls → maths → drawing | compute a readout without a `maths/` function |
| `catalog.js` | list sims and units | import sim modules |

The rule that matters: **a number on screen traces to a tested `maths/`
function.** Rendering code can be wrong-looking; it cannot be wrong-valued.

## 3. The sim page contract

`sim-page.js` imports `js/sims/<id>.js` and expects:

- `equations`: `[{ html, what }]` — shown under "Key equations".
- `prompts`: `[html]` — shown under "Try this" (at least three).
- `legend` (optional): `[{ color, label }]`, `color` naming a `--c-*` token.
- `tallOnMobile` (optional): `true` gives the canvas a portrait aspect on phones
  for sims that stack two views.
- `mount(ui)`: builds the sim into `ui = { canvas, controls, readouts, transport }`.

`tests/catalog.test.js` checks every catalog entry against this contract, and
that no module in `sims/` is missing from the catalog.

A catalog entry names one `course` and `unit`, and may list more in `also`
(`[{ course, unit }]`). The counting sims use it to appear under both
Mathematics 30-1 and 30-2; the home page and the sim page badge read
`placements()`. A sim with nothing to animate still creates the clock for its
redraw loop and hides the transport bar.

## 4. Time, randomness and drawing

`lib/clock.js` runs one `requestAnimationFrame` loop per page. Simulated time
advances only while playing (times the speed setting); the frame callback runs
every frame regardless, so a paused sim still redraws when a slider moves.
Sims read control values each frame rather than keeping derived state, except
where a change must restart the run (`onChange` → reset).

The physics and chemistry sites treat random motion as decoration that feeds no
readout. Here sampling is often the subject, so the rule is different:

- **Exact where a formula exists.** Counting, probability and expected values
  come from closed-form `maths/` functions, so they equal the hand calculation.
- **Simulated readouts are labelled and reproducible.** A readout that averages
  random draws says "simulated", comes from `maths/random.js` seeded with the
  seed shown on screen, and sits beside its exact value where one exists.
- **A run depends on the seed, not on frame timing.** A sim draws "sample
  number k" from the generator in order, so the first 1 000 samples are the
  same at any speed or frame rate.

## 5. Theming

Colours are CSS custom properties on `:root`, redefined for dark mode.
`lib/canvas.js` `theme()` reads them so canvas drawing follows the page theme.
Colour meanings are shared across sims so students learn one code:
`--c-param` is a population parameter (the true value), `--c-stat` a sample
statistic (what the data gave); `--c-series-a`/`-b` are plain data series;
`--c-danger` is the error box and warnings.

## 6. Verification and deployment

- **Merge gate (`.github/workflows/tests.yml`)**: `node --test` plus the two
  Python doc guards. Offline, secret-free, dependency-free, so it cannot flake
  on an upstream outage and never gets ignored.
- **Browser smoke test (`tools/verify-sims.js`)**: headless Chromium over every
  page. Not on the gate — it needs a browser download there — so it is run
  locally before merging UI work (`npm run verify`). If UI regressions start
  slipping through, promote it to its own CI job rather than weakening it.
- **Deploy (`.github/workflows/deploy.yml`)**: on push to `main`, re-runs the
  unit tests, builds `site/` into `_site/` with `tools/build-site.js`, and
  publishes that to GitHub Pages. One-time setup: repository Settings → Pages →
  Source: *GitHub Actions*.
- **Cache busting (`tools/build-site.js`)**: Pages lets browsers cache every
  file for 10 minutes, so right after a deploy a fresh page could run against an
  old `catalog.js` ("the new sim isn't there"). The build stamps the stylesheet
  and entry scripts with `?v=<content hash>` and writes an import map into each
  HTML page that sends every module, including the sim page's dynamic import,
  to its hashed URL. `site/` stays unbuilt for local work (`npm run serve`);
  `npm run verify:built` checks the built output and fails on any unversioned
  `.js`/`.css` request.
- The workflow guards stay in Python (stdlib only, no `pip install`) as they
  came from the template.

## 7. Teaching models (deliberate simplifications)

Each is stated in the code where it lives and flagged to the student where it
could mislead.

- **Bessel's correction** (`maths/variance.js`, `sims/bessel.js`): samples are
  drawn straight from a normal population N(μ, σ²). The PyQt version drew
  100 000 normal values first and resampled from them; that finite population
  had its own variance, slightly off σ², so the "true σ²" line was not exactly
  the target. The expected values (σ²(n − 1)/n and σ²) hold for any population
  with variance σ²; the normal is only what the sim draws from. The histogram
  axis spans 4 standard deviations of s² (σ²√(2/(n − 1)), a normal-population
  result) either side of σ², floored at 0; estimates beyond it are counted in
  the averages and reported as "beyond the axis". Both panels share one count
  scale. The run stops at 50 000 samples.
- **Counting principle** (`maths/counting.js` `product`, `sims/counting.js`):
  independent choices only — the options at one step never depend on an
  earlier choice — with up to 4 choices of up to 6 options. The tree draws as
  many levels as stay readable and states the rest as "× n".
- **Permutations** (`sims/permutations.js`): objects in a row only (no circular
  arrangements, no objects kept together or apart). Up to 9 objects; a word of
  up to 12 letters A–Z, other characters dropped. Arrangements are listed when
  there are 400 or fewer, cut to what fits with "… and N more".
- **Combinations** (`sims/combinations.js`): up to 12 objects. The committee
  mode has two groups and one condition, on the number taken from the second
  group; every possible split is a case, and the cases that fit are added.
- **Binomial theorem** (`sims/binomial.js`): (ax + by)<sup>n</sup> with whole
  a and b from −5 to 5 and n up to 10. Linear terms only: no x² or 1/x inside
  the bracket, which is where the 30-1 bulletin says students struggle.
- **Odds** (`maths/probability.js`, `sims/odds.js`): equally likely outcomes,
  up to 20 favourable and 20 unfavourable. Odds print in lowest terms, so
  0 favourable to 5 unfavourable prints 0 : 1.
- **Venn diagram** (`sims/venn.js`): two events. The circles are a fixed size,
  drawn overlapping or apart; areas are not to scale, and the counts in the
  regions carry the sizes. Counts that cannot happen are refused with the
  reason, not clamped.
- **Tree diagram** (`sims/tree.js`): two draws from a bag of two colours, each
  marble equally likely. Branch and path fractions are left unreduced so they
  match the student's working (3/8 × 2/7 = 6/56); the readouts reduce them.
