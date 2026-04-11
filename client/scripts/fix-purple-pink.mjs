import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const rules = [
  [/hover:from-purple-700 hover:to-purple-800/g, 'hover:from-primary-hover hover:to-primary'],
  [/hover:from-purple-700 hover:to-pink-600/g, 'hover:from-primary-hover hover:to-accent'],
  [/from-primary to-pink-500/g, 'from-primary to-accent'],
  [/from-primary to-purple-500/g, 'from-primary to-secondary'],
  [/hover:from-purple-700 hover:to-purple-600/g, 'hover:from-primary-hover hover:to-secondary'],
  [/from-purple-500 to-purple-600/g, 'from-primary to-primary-hover'],
  [/from-purple-500 to-emerald-600/g, 'from-primary to-secondary'],
  [/from-purple-800 via-purple-600 to-purple-500/g, 'from-primary via-primary-hover to-secondary'],
  [/to-purple-900\/60/g, 'to-primary/60'],
  [/text-purple-100/g, 'text-sidebar-foreground/90'],
  [/text-purple-300/g, 'text-info'],
  [/hover:text-purple-800/g, 'hover:text-primary-hover'],
  [/text-purple-800/g, 'text-primary'],
  [/border-purple-500\/40/g, 'border-primary/40'],
  [/border-purple-500\/25/g, 'border-primary/25'],
  [/border-purple-500\/15/g, 'border-primary/15'],
  [/hover:border-purple-500\/40/g, 'hover:border-primary/40'],
  [/hover:border-purple-500/g, 'hover:border-primary'],
  [/hover:border-purple-400/g, 'hover:border-primary'],
  [/border-purple-500/g, 'border-primary'],
  [/border-purple-400/g, 'border-primary'],
  [/border-purple-100/g, 'border-primary/15'],
  [/ring-2 ring-purple-200/g, 'ring-2 ring-primary/25'],
  [/ring-purple-200/g, 'ring-primary/25'],
  [/focus:ring-purple-200/g, 'focus:ring-primary/30'],
  [/border-purple-500 border-t-transparent/g, 'border-primary border-t-transparent'],
  [/hover:shadow-purple-500\/10/g, 'hover:shadow-primary/10'],
  [/hover:shadow-purple-500\/5/g, 'hover:shadow-primary/5'],
  [/shadow-purple-500\/10/g, 'shadow-primary/10'],
  [/from-purple-500\/5/g, 'from-primary/5'],
  [/from-purple-500\/50/g, 'from-primary/50'],
  [/to-pink-600/g, 'to-accent'],
  [/from-purple-700/g, 'from-primary-hover'],
  [/to-purple-600/g, 'to-primary-hover'],
  [/from-purple-500/g, 'from-primary'],
  [/to-purple-800/g, 'to-primary-hover'],
  [/bg-purple-400/g, 'bg-primary'],
  [/bg-\[#f5f3ff\]/g, 'bg-surface-active/50'],
  [/from-purple-900\/90/g, 'from-sidebar/95'],
  [/from-purple-500 to-purple-600/g, 'from-primary to-primary-hover'],
  [/hover:from-primary hover:to-primary-hover/g, 'hover:from-primary-hover hover:to-primary'],
  [/bg-gradient-to-br from-purple-500 to-purple-600/g, 'bg-gradient-to-br from-primary to-primary-hover'],
  [/from-purple-500 to-purple-600 flex/g, 'from-primary to-primary-hover flex'],
  [/from-purple-500 to-emerald-600/g, 'from-primary to-secondary'],
];

function walk(dir, files = []) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx|ts)$/.test(n) && !n.endsWith('.d.ts')) files.push(p);
  }
  return files;
}

let n = 0;
for (const file of walk(root)) {
  let t = fs.readFileSync(file, 'utf8');
  const o = t;
  for (const [re, rep] of rules) t = t.replace(re, rep);
  if (t !== o) {
    fs.writeFileSync(file, t);
    n++;
    console.log(path.relative(root, file));
  }
}
console.log('files:', n);
