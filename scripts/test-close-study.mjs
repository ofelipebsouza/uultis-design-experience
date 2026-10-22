import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const source = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const html = source('index.html');
const js = source('close-study/study.js');
const css = source('close-study/study.css');
const section = html.slice(html.indexOf('<section class="close-study"'), html.indexOf('<section class="room-studio-feature'));
assert.equal((section.match(/data-study-frame=/g) || []).length, 4);
assert.equal((section.match(/data-study-step=/g) || []).length, 4);
assert.equal((section.match(/<figcaption>/g) || []).length, 4);
assert.equal((section.match(/AI-generated/g) || []).length, 5);
assert.match(section, /Not official product photographs/);
assert.match(section, /href="#product\/274"/);
assert.match(section, /href="#close-study-end"/);
assert.match(section, /id="study-motion-toggle"[^>]+hidden/);
assert.match(js, /prefers-reduced-motion: no-preference/);
assert.match(js, /media\.addEventListener\('change', sync\)/);
assert.match(js, /context\?\.revert\(\)/);
assert.match(js, /attributeFilter: \['hidden'\]/);
assert.match(js, /request !== serial/);
assert.match(js, /await Promise\.all\(images/);
assert.match(css, /\.study-frames\{display:grid/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.doesNotMatch(js, /preventDefault|normalizeScroll|ScrollSmoother|pin:\s*true|addEventListener\(['"](?:wheel|touchmove)/);
let totalImages = 0;
for (let n = 1; n <= 4; n++) for (const size of ['wide', 'small']) {
  const path = new URL(`../dist/assets/close-study/igriega-${String(n).padStart(2,'0')}-${size}.webp`, import.meta.url);
  const buffer = readFileSync(path);
  assert.equal(buffer.subarray(0,4).toString(), 'RIFF');
  assert.equal(buffer.subarray(8,12).toString(), 'WEBP');
  assert.ok(buffer.length < (size === 'wide' ? 450000 : 180000), `${path}: asset budget exceeded`);
  if (size === 'wide') totalImages += statSync(path).size;
}
let vendorGzip = 0;
for (const path of ['assets/vendor/gsap-3.15.0.min.js','assets/vendor/ScrollTrigger-3.15.0.min.js']) {
  const content = source(path);
  assert.match(content, /3\.15\.0/);
  assert.match(content, /@license/);
  vendorGzip += gzipSync(content).length;
}
assert.ok(vendorGzip < 65000, 'Motion libraries exceed 65 KB gzip budget');
console.log(`PASS: 4 semantic frames, responsive WebP integrity/budgets (${Math.round(totalImages/1024)} KB desktop set), self-hosted GSAP (${Math.round(vendorGzip/1024)} KB gzip), reduced-motion/static fallback/cleanup contracts. Visual/runtime QA is separate.`);
