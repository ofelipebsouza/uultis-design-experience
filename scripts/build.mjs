import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(projectRoot, 'dist');
const output = join(projectRoot, 'public');
const required = ['index.html', 'styles.css', 'app.js', 'branding/index.html', 'guia-de-estilo/index.html', 'assets/catalog.js'];

for (const path of required) {
  if (!existsSync(join(source, path))) throw new Error(`Arquivo obrigatório ausente: dist/${path}`);
}

// Only the generated publication directory is replaced; dist remains the source.
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

function countFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) =>
    total + (entry.isDirectory() ? countFiles(join(directory, entry.name)) : 1), 0);
}

console.log(`Publicação preparada: ${countFiles(output)} arquivos em public/.`);
