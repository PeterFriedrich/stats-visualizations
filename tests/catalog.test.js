import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { sims, findSim, placements, simsIn } from '../site/js/catalog.js';

test('test_catalog_every_sim_module_exports_page_contract', async () => {
  // sim-page.js calls mount(ui) and renders equations/prompts; a sim missing
  // any of them loads to a blank or broken page with no build step to catch it.
  for (const s of sims) {
    const path = new URL(`../site/js/sims/${s.id}.js`, import.meta.url);
    assert.ok(existsSync(path), `${s.id}: no module at site/js/sims/${s.id}.js`);
    const mod = await import(path);
    assert.equal(typeof mod.mount, 'function', `${s.id}: mount() missing`);
    assert.ok(Array.isArray(mod.equations) && mod.equations.length, `${s.id}: no equations`);
    assert.ok(mod.equations.every((e) => typeof e.html === 'string'), `${s.id}: equation without html`);
    assert.ok(Array.isArray(mod.prompts) && mod.prompts.length >= 3, `${s.id}: fewer than 3 prompts`);
  }
});

test('test_catalog_ids_unique_and_units_exist', () => {
  const ids = sims.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate sim id');
  for (const s of sims) {
    assert.match(s.id, /^[a-z0-9-]+$/, `${s.id}: ids are used in URLs and file names`);
    // A sim may be listed under more than one course (`also`); every listing
    // has to name a real course and unit, or the sim silently drops off the home page.
    for (const p of placements(s)) assert.ok(p.course && p.unit, `${s.id}: unknown course or unit in ${JSON.stringify([s.course, s.unit, s.also])}`);
    assert.ok(placements(s).every((p) => simsIn(p.course.id, p.unit.id).includes(s)), `${s.id}: not listed where it says`);
    assert.ok(s.title && s.summary && s.concepts.length, `${s.id}: missing card text`);
  }
  assert.equal(findSim('nope'), null);
});

test('test_catalog_every_sim_module_is_listed', async () => {
  const { readdirSync } = await import('node:fs');
  const files = readdirSync(new URL('../site/js/sims/', import.meta.url)).filter((f) => f.endsWith('.js'));
  const listed = new Set(sims.map((s) => `${s.id}.js`));
  for (const f of files) assert.ok(listed.has(f), `site/js/sims/${f} is not in catalog.js, so no page links to it`);
});

test('test_sim_page_passes_the_steps_panel', async () => {
  // complete-square writes its worked steps into ui.steps; without the panel
  // in sim.html, or with it shown by default, every other sim changes too.
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../site/sim.html', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../site/js/sim-page.js', import.meta.url), 'utf8');
  assert.match(html, /<div class="steps" id="sim-steps" hidden><\/div>/);
  assert.match(page, /steps: \$\('sim-steps'\)/);
});
