import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(projectRoot, 'dist');
const output = join(projectRoot, 'public');
const required = ['close-study/study.js', 'close-study/study.css', 'assets/vendor/gsap-3.15.0.min.js', 'assets/vendor/ScrollTrigger-3.15.0.min.js', ...['01','02','03','04'].flatMap(n => ['wide','small'].map(size => `assets/close-study/igriega-${n}-${size}.webp`)), 'index.html', 'styles.css', 'app.js', 'blog/index.html', 'blog/a-room-in-proportion/index.html', 'blog/materials-in-conversation/index.html', 'blog/reading-a-technical-sheet/index.html', 'biolink/index.html', 'branding/index.html', 'style-guide/index.html', 'assets/catalog.js', 'room-studio/index.html', 'room-studio/studio.js', 'room-studio/studio.css', 'room-studio/products.js', 'room-studio/resources.js', 'room-studio/state.js', 'room-studio/renderer.js', 'room-studio/textures.js', 'explore/pages.css', 'explore/pages.js', 'explore/documents.js', 'technical-sheets/index.html', 'about/index.html', 'materials/index.html', 'sustainability/index.html', 'corporate/index.html', 'stores/index.html', 'contact/index.html', 'privacy/index.html', 'designers/index.html', 'gallery/index.html', 'room-studio/room.js', 'assets/vendor/RoomEnvironment.js', 'assets/vendor/RoundedBoxGeometry.js', 'assets/vendor/three.module.js', 'assets/vendor/three.core.js', 'assets/vendor/OrbitControls.js'];

for (const path of required) {
  if (!existsSync(join(source, path))) throw new Error(`Required file missing: dist/${path}`);
}

// Only the generated publication directory is replaced; dist remains the source.
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

function collectPageRoutes(directory, route = '') {
  const routes = [];
  if (existsSync(join(directory, 'index.html'))) routes.push(route || '/');
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) routes.push(...collectPageRoutes(join(directory, entry.name), `${route}/${entry.name}`));
  }
  return routes;
}

const sitemapRoutes = [...new Set(collectPageRoutes(output))].sort();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map(route => `  <url><loc>https://uultis.vercel.app${route === '/' ? '/' : `${route}/`}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(join(output, 'sitemap.xml'), sitemap);
writeFileSync(join(output, 'robots.txt'), 'User-agent: *\nDisallow:\nSitemap: https://uultis.vercel.app/sitemap.xml\n');

function countFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) =>
    total + (entry.isDirectory() ? countFiles(join(directory, entry.name)) : 1), 0);
}

console.log(`Publication prepared: ${countFiles(output)} files in public/.`);
