// Wires evlog.mjs into the e2e test fixture of whichever checkout this runs in.
import {copyFileSync, readFileSync, writeFileSync} from 'node:fs';

const utils = 'packages/lexical-playground/__tests__/utils/index.mjs';
copyFileSync(
  new URL('./evlog.mjs', import.meta.url),
  'packages/lexical-playground/__tests__/utils/evlog.mjs',
);
const src = readFileSync(utils, 'utf8');
const marker = 'export const test = base.extend({';
if (!src.includes(marker)) {
  throw new Error('fixture marker not found');
}
writeFileSync(
  utils,
  `import {evlogPage} from './evlog.mjs';\n` +
    src.replace(marker, `${marker}\n  page: evlogPage,`),
);
console.log('evlog wired into', utils);
