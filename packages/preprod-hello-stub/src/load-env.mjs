import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { assertNoRetiredTestnet } from './retired-testnet.mjs';

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
  assertNoRetiredTestnet(process.env);
  return { repoRoot, loaded };
}

export { repoRoot };

/*
Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
*/
