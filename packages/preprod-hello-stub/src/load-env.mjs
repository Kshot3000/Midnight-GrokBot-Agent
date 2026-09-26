import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

/** Load .env.preprod from repo root or package dir if present. Never invent keys. */
export function loadPreprodEnv() {
  const candidates = [
    path.join(repoRoot, '.env.preprod'),
    path.join(here, '../.env.preprod'),
    path.join(process.cwd(), '.env.preprod'),
  ];
  const loaded = [];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p, override: false });
      loaded.push(p);
    }
  }
  return { repoRoot, loaded };
}

export { repoRoot };
