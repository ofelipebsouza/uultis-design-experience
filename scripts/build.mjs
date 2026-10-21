import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(projectRoot, 'dist');
const output = join(projectRoot, 'public');
const required = ['index.html', 'styles.css', 'app.js', 'blog/index.html', 'blog/a-room-in-proportion/index.html', 'blog/materials-in-conversation/index.html', 'blog/reading-a-technical-sheet/index.html', 'biolink/index.html', 'branding/index.html', 'style-guide/index.html', 'assets/catalog.js', 'room-studio/index.html', 'room-studio/studio.js', 'room-studio/studio.css', 'room-studio/products.js', 'room-studio/resources.js', 'room-studio/state.js', 'room-studio/renderer.js', 'room-studio/textures.js', 'explore/pages.css', 'explore/pages.js', 'explore/documents.js', 'technical-sheets/index.html', 'about/index.html', 'materials/index.html', 'sustainability/index.html', 'corporate/index.html', 'stores/index.html', 'contact/index.html', 'privacy/index.html', 'designers/index.html', 'gallery/index.html', 'room-studio/room.js', 'assets/vendor/RoomEnvironment.js', 'assets/vendor/RoundedBoxGeometry.js', 'assets/vendor/three.module.js', 'assets/vendor/three.core.js', 'assets/vendor/OrbitControls.js'];

for (const path of required) {
  if (!existsSync(join(source, path))) throw new Error(`Required file missing: dist/${path}`);
}

// Only the generated publication directory is replaced; dist remains the source.
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

function countFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) =>
    total + (entry.isDirectory() ? countFiles(join(directory, entry.name)) : 1), 0);
}

console.log(`Publication prepared: ${countFiles(output)} files in public/.`);
