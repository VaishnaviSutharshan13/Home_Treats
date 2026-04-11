import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const rules = [
  [/focus:ring-purple-100/g, 'focus:ring-primary/25'],
  [/text-violet-600/g, 'text-secondary'],
  [/bg-violet-50/g, 'bg-secondary/10'],
  [/bg-violet-100/g, 'bg-secondary/15'],
  [/bg-violet-500\/10/g, 'bg-secondary/10'],
  [/bg-violet-500\/20/g, 'bg-secondary/20'],
  [/text-violet-400/g, 'text-secondary'],
  [/iconBg: 'bg-violet-500'/g, "iconBg: 'bg-secondary'"],
  [/from-purple-100 via-purple-50 to-white/g, 'from-surface-active via-background to-card'],
  [/to-purple-300\/10/g, 'to-primary/10'],
  [/border border-purple-600/g, 'border border-primary'],
  [/bg-purple-200/g, 'bg-primary/25'],
  [/hover:bg-pink-600/g, 'hover:bg-secondary'],
];

function walk(dir, files = []) {
  for (const n of fs.readdirSync(dir)) {
    const pth = path.join(dir, n);
    if (fs.statSync(pth).isDirectory()) walk(pth, files);
    else if (/\.(tsx|ts)$/.test(n) && !n.endsWith('.d.ts')) files.push(pth);
  }
  return files;
}

let c = 0;
for (const file of walk(root)) {
  let t = fs.readFileSync(file, 'utf8');
  const o = t;
  for (const [re, rep] of rules) t = t.replace(re, rep);
  if (t !== o) {
    fs.writeFileSync(file, t);
    c++;
    console.log(path.relative(root, file));
  }
}
console.log('files:', c);
