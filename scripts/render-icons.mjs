/* Rasterize the brand SVGs in resources/ into Android launcher icon PNGs.
   Needs a Chromium-family browser (Chrome or Edge). Run: node scripts/render-icons.mjs */
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const DENSTIES = [
  ['mdpi', 1],
  ['hdpi', 1.5],
  ['xhdpi', 2],
  ['xxhdpi', 3],
  ['xxxhdpi', 4],
];

const TARGETS = [
  { svg: 'icon.svg', file: 'ic_launcher.png', base: 48 },
  { svg: 'icon-round.svg', file: 'ic_launcher_round.png', base: 48 },
  { svg: 'icon-foreground.svg', file: 'ic_launcher_foreground.png', base: 108 },
];

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      /* keep looking */
    }
  }
  throw new Error('No Chrome/Edge found. Set CHROME_PATH to a Chromium binary.');
}

function innerSvg(markup) {
  const open = markup.indexOf('>');
  const close = markup.lastIndexOf('</svg>');
  return { inner: markup.slice(open + 1, close), viewBox: markup.match(/viewBox="([^"]+)"/)[1] };
}

function html(viewBox, inner, size) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}
svg{display:block;width:${size}px;height:${size}px}
</style></head><body><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg></body></html>`;
}

function shot(chrome, chromeDir, page, out, size) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-device-scale-factor=1',
      '--default-background-color=00000000',
      `--window-size=${size},${size}`,
      `--user-data-dir=${chromeDir}`,
      `--screenshot=${out}`,
      `file:///${page.replace(/\\/g, '/')}`,
    ], { stdio: 'ignore' });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`chrome exited ${code}`))));
  });
}

const chrome = await findChrome();
const tmp = await mkdtemp(path.join(os.tmpdir(), 'flare-icons-'));

for (const target of TARGETS) {
  const markup = await readFile(path.join(root, 'resources', target.svg), 'utf8');
  const { inner, viewBox } = innerSvg(markup);

  for (const [density, scale] of DENSTIES) {
    const size = Math.round(target.base * scale);
    const dir = path.join(resDir, `mipmap-${density}`);
    await mkdir(dir, { recursive: true });
    const page = path.join(tmp, `${target.file}-${size}.html`);
    await writeFile(page, html(viewBox, inner, size));
    await shot(chrome, path.join(tmp, `profile-${size}`), page, path.join(dir, target.file), size);
    console.log(`mipmap-${density}/${target.file} ${size}x${size}`);
  }
}

await rm(tmp, { recursive: true, force: true });
console.log('Launcher icons rendered.');
