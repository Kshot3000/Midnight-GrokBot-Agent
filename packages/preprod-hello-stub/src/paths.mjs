import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
/** Repo-root contracts/hello-midnight/out (gitignored — regenerate with npm run compact:hello) */
export const HELLO_OUT = path.resolve(here, '../../../contracts/hello-midnight/out');
export const HELLO_CONTRACT = path.join(HELLO_OUT, 'contract', 'index.js');
export const HELLO_KEYS = path.join(HELLO_OUT, 'keys');
export const HELLO_ZKIR = path.join(HELLO_OUT, 'zkir');
