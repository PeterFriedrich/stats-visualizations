// Loads one sim into sim.html from ?id=<sim id>. The sim module supplies
// `equations`, `prompts`, optional `legend`, and `mount(ui)`. `ui.steps` is a
// panel under the canvas, hidden unless a sim with worked steps un-hides it.
import { findSim, placements } from './catalog.js';

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get('id');
const sim = id && findSim(id);

function fail(msg) {
  $('sim-root').innerHTML = '';
  const box = document.createElement('div');
  box.className = 'error';
  box.innerHTML = `<p>${msg}</p><p><a href="./">Back to all simulations</a></p>`;
  $('sim-root').appendChild(box);
}

if (!sim) {
  fail('That simulation does not exist.');
} else {
  document.title = `${sim.title} · Stats Sims`;
  $('sim-heading').textContent = sim.title;
  $('sim-summary').textContent = sim.summary;
  $('sim-badge').textContent = placements(sim).map((p) => `${p.course.title} · ${p.unit.title}`).join('  |  ');

  import(`./sims/${sim.id}.js`)
    .then((mod) => {
      for (const eq of mod.equations) {
        const li = document.createElement('li');
        li.innerHTML = `<span class="eq">${eq.html}</span><span class="what">${eq.what ?? ''}</span>`;
        $('sim-equations').appendChild(li);
      }
      for (const p of mod.prompts) {
        const li = document.createElement('li');
        li.innerHTML = p;
        $('sim-prompts').appendChild(li);
      }
      for (const item of mod.legend ?? []) {
        const span = document.createElement('span');
        span.innerHTML = `<i style="background: var(--c-${item.color})"></i>${item.label}`;
        $('sim-legend').appendChild(span);
      }
      if (mod.tallOnMobile) $('sim-canvas').parentElement.classList.add('tall');
      mod.mount({
        canvas: $('sim-canvas'),
        controls: $('sim-controls'),
        readouts: $('sim-readouts'),
        transport: $('sim-transport'),
        steps: $('sim-steps'),
      });
    })
    .catch((err) => {
      console.error(err);
      fail('This simulation failed to load.');
    });
}
