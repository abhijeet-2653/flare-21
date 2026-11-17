/* Assemble the static app into www/ for Capacitor.
   Root stays the web source of truth; www/ is generated and git-ignored. */
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'www');

const files = ['index.html', 'favicon.svg'];
const dirs = ['css', 'js', 'assets'];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const file of files) {
  await cp(path.join(root, file), path.join(out, file));
}

for (const dir of dirs) {
  const src = path.join(root, dir);
  try {
    await stat(src);
  } catch {
    continue;
  }
  await cp(src, path.join(out, dir), { recursive: true });
}

console.log('Built www/ from root static assets.');
