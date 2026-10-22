import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Dependency-free regression checks. These do not replace browser visual QA.
const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const start = app.indexOf("  document.addEventListener('load',event => {");
const end = app.indexOf("  window.addEventListener('hashchange'", start);
assert.ok(start >= 0 && end > start);
const listeners = {};
runInNewContext(app.slice(start, end), {
  document: { addEventListener(type, callback, capture) {
    assert.equal(capture, true, 'image load/error events require capture');
    listeners[type] = callback;
  } },
});

function image({ alternate = true, decode = () => Promise.resolve() } = {}) {
  const classes = new Set(alternate ? ['card-alternate'] : []);
  const linkClasses = new Set();
  const link = { classList: {
    add: name => linkClasses.add(name), remove: name => linkClasses.delete(name),
  } };
  return {
    tagName: 'IMG', naturalWidth: 760, isConnected: true, dataset: {}, decode,
    classList: { contains: name => classes.has(name), add: name => classes.add(name) },
    closest: selector => { assert.equal(selector, '.product-image-link'); return link; },
    remove() { this.isConnected = false; },
    ready: () => linkClasses.has('has-alternate'),
  };
}
const settle = async () => { await Promise.resolve(); await Promise.resolve(); };
const loaded = image();
listeners.load({ target: loaded });
assert.equal(loaded.ready(), false, 'keep primary until decode completes');
await settle();
assert.equal(loaded.ready(), true, 'decoded alternative becomes available');
listeners.error({ target: loaded });
assert.equal(loaded.ready(), false, 'failed alternative restores primary');
assert.equal(loaded.isConnected, false, 'do not substitute a logo over a valid primary');

const rejected = image({ decode: () => Promise.reject(new Error('decode failed')) });
listeners.load({ target: rejected });
await settle();
assert.equal(rejected.ready(), false);
let finishDecode;
const interrupted = image({ decode: () => new Promise(resolve => { finishDecode = resolve; }) });
listeners.load({ target: interrupted });
listeners.error({ target: interrupted });
finishDecode();
await settle();
assert.equal(interrupted.ready(), false, 'late decode cannot revive a removed alternative');
const removed = image();
listeners.load({ target: removed });
removed.remove();
await settle();
assert.equal(removed.ready(), false, 'filter/rerender can remove a card during decode');

const primary = image({ alternate: false });
listeners.error({ target: primary });
assert.equal(primary.src, 'assets/logo-black.svg');
assert.equal(primary.dataset.failed, 'true');
assert.equal(primary.isConnected, true, 'preserve the existing primary-image fallback');
listeners.load({ target: primary });
await settle();
assert.equal(primary.ready(), false);

// Visibility changes are discrete: rapid enter/leave cannot crossfade both views.
assert.match(css, /\.product-image-link \.card-alternate\{position:absolute;inset:0;visibility:hidden\}/);
for (const state of ['hover', 'focus-visible']) {
  assert.ok(css.includes(`.product-image-link.has-alternate:${state}>img:not(.card-alternate){visibility:hidden}`));
  assert.ok(css.includes(`.product-image-link.has-alternate:${state} .card-alternate{visibility:visible}`));
}
assert.match(css, /@media\(hover:hover\) and \(pointer:fine\)\{\s*\.product-image-link:hover img\{[^}]+\}\s*\.product-image-link.has-alternate:hover>img:not\(\.card-alternate\)\{[^}]+\}\s*\.product-image-link.has-alternate:hover \.card-alternate\{[^}]+\}\s*\}/);
assert.doesNotMatch(css, /card-alternate\{[^}]*opacity/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*?transition:none!important/);
console.log('PASS: alternate readiness, decode/error/rerender races, primary fallback, exclusive hover/focus visibility, touch gate and reduced-motion rules. Browser visual QA is separate.');
