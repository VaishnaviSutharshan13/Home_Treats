/**
 * Maps legacy purple/sky/indigo/violet utility classes to theme tokens from globals.css.
 * Run: node scripts/apply-theme-colors.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

const rules = [
  [/from-purple-600 to-purple-700/g, 'from-primary to-primary-hover'],
  [/from-purple-600/g, 'from-primary'],
  [/to-purple-700/g, 'to-primary-hover'],
  [/from-indigo-600 to-purple-600/g, 'from-primary to-secondary'],
  [/from-sky-600 via-sky-700 to-cyan-800/g, 'from-primary via-primary-hover to-secondary'],
  [/from-sky-500\/40 to-teal-500\/25/g, 'from-primary/40 to-secondary/25'],
  [/from-sky-600 via-violet-700 to-indigo-900/g, 'from-primary via-primary-hover to-sidebar'],
  [/text-sky-800/g, 'text-primary'],
  [/text-sky-700/g, 'text-primary'],
  [/text-sky-600/g, 'text-primary'],
  [/text-sky-500/g, 'text-primary'],
  [/text-sky-300/g, 'text-info'],
  [/text-sky-200/g, 'text-info'],
  [/text-sky-100/g, 'text-primary-foreground/90'],
  [/bg-sky-600/g, 'bg-primary'],
  [/bg-sky-500/g, 'bg-primary'],
  [/bg-sky-100/g, 'bg-surface-active'],
  [/hover:bg-sky-400/g, 'hover:bg-primary-hover'],
  [/hover:bg-sky-50/g, 'hover:bg-surface-hover'],
  [/hover:border-sky-200/g, 'hover:border-primary/30'],
  [/hover:border-sky-300/g, 'hover:border-primary/40'],
  [/border-sky-300/g, 'border-primary/40'],
  [/ring-sky-500\/20/g, 'ring-primary/20'],
  [/ring-sky-500/g, 'ring-primary'],
  [/text-purple-700/g, 'text-primary'],
  [/text-purple-600/g, 'text-primary'],
  [/text-purple-500/g, 'text-primary'],
  [/text-purple-400/g, 'text-primary'],
  [/bg-purple-700/g, 'bg-primary-hover'],
  [/bg-purple-600/g, 'bg-primary'],
  [/bg-purple-50/g, 'bg-surface-active'],
  [/bg-purple-100/g, 'bg-surface-active'],
  [/border-purple-200/g, 'border-primary/25'],
  [/border-purple-300/g, 'border-primary/30'],
  [/hover:bg-purple-50/g, 'hover:bg-surface-hover'],
  [/hover:bg-purple-700/g, 'hover:bg-primary-hover'],
  [/hover:bg-purple-600/g, 'hover:bg-primary-hover'],
  [/hover:text-purple-700/g, 'hover:text-primary'],
  [/hover:text-purple-600/g, 'hover:text-primary'],
  [/hover:border-purple-300/g, 'hover:border-primary/35'],
  [/hover:border-purple-200/g, 'hover:border-primary/25'],
  [/hover:shadow-purple-200/g, 'hover:shadow-primary/20'],
  [/shadow-purple-200/g, 'shadow-primary/15'],
  [/shadow-purple-500\/20/g, 'shadow-primary/20'],
  [/shadow-purple-500\/30/g, 'shadow-primary/30'],
  [/shadow-purple-100/g, 'shadow-primary/10'],
  [/shadow-sky-950\/40/g, 'shadow-primary/40'],
  [/from-violet-600/g, 'from-secondary'],
  [/to-fuchsia-600/g, 'to-accent'],
  [/text-violet-700/g, 'text-primary'],
  [/text-indigo-600/g, 'text-primary'],
  [/text-indigo-700/g, 'text-primary'],
  [/bg-indigo-600/g, 'bg-primary'],
  [/bg-indigo-50/g, 'bg-surface-active'],
  [/border-indigo-200/g, 'border-primary/25'],
  [/hover:border-indigo-200/g, 'hover:border-primary/25'],
  [/text-cyan-600/g, 'text-secondary'],
  [/focus:border-purple-500/g, 'focus:border-primary'],
  [/focus:ring-purple-500/g, 'focus:ring-primary'],
  [/focus:ring-purple-400/g, 'focus:ring-primary'],
  [/border-purple-500\/50/g, 'border-primary/50'],
  [/border-purple-500\/30/g, 'border-primary/30'],
  [/border-purple-500\/10/g, 'border-primary/10'],
  [/border-purple-500\/20/g, 'border-primary/20'],
  [/placeholder-gray-400/g, 'placeholder-subtle'],
  [/text-emerald-500/g, 'text-success'],
  [/text-yellow-400/g, 'text-warning'],
  [/bg-yellow-500\/20/g, 'bg-warning/20'],
  [/border-yellow-500\/30/g, 'border-warning/30'],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue;
      walk(p, files);
    } else if (/\.(tsx|ts|jsx|js)$/.test(name) && !name.endsWith('.d.ts')) {
      files.push(p);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(srcDir)) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  for (const [re, rep] of rules) {
    text = text.replace(re, rep);
  }
  if (text !== orig) {
    fs.writeFileSync(file, text);
    changed++;
    console.log('updated', path.relative(srcDir, file));
  }
}
console.log('files changed:', changed);
