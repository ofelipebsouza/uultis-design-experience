import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../dist/assets/catalog.json', import.meta.url), 'utf8'));
const menu = html.slice(html.indexOf('<nav class="desktop-nav"'), html.indexOf('</nav>', html.indexOf('<nav class="desktop-nav"')) + 6);
const mobile = html.slice(html.indexOf('<dialog class="menu-dialog"'), html.indexOf('</dialog>', html.indexOf('<dialog class="menu-dialog"')) + 9);
const categoryValues = [...menu.matchAll(/data-menu-category="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
const catalogCategories = [...new Set(catalog.map(product => product.category))].sort();

assert.deepEqual([...new Set(categoryValues)].sort(), catalogCategories, 'desktop menu categories match the catalog');
assert.match(menu, /id="open-products"[^>]+aria-controls="products-megamenu"/);
assert.match(html, /href="\/stores\/"[^>]*aria-label="Stores and showrooms"/);
assert.match(menu, /href="\/corporate\/"/);
assert.match(mobile, /href="\/contact\/"/);
assert.doesNotMatch(mobile.match(/<nav aria-label="Menu">[\s\S]*?<\/nav>/)?.[0] || '', />Designers</i);
assert.match(mobile, /Trade \/ Dealers/);
assert.match(mobile, /Stores &amp; showrooms/);
assert.match(app, /pendingMenuCategory/);
assert.match(app, /event\.key === 'Escape'.*productsMegaMenu/s);
assert.match(app, /pointer: coarse/);
assert.doesNotMatch(`${html}\n${app}`, /Milton|login|checkout|inventory|stock available/i);
console.log(`PASS: Products megamenu covers ${catalogCategories.length} real catalog categories; Stores, Trade / Dealers, mobile and keyboard contracts are present.`);
