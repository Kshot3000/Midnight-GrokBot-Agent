/**
 * Local link-index check for docs/lab-llms.txt.
 * Does not fetch docs.midnight.network and does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1386
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_LINKS = [
  'https://docs.midnight.network/llms.txt',
  'https://docs.midnight.network/guides/security-best-practices',
  'https://docs.midnight.network/compact/smart-contract-security',
  'https://docs.midnight.network/relnotes/support-matrix',
  'https://docs.midnight.network/ai-integration/kapa-mcp-server',
];

export function checkAeoLlmsIndex(source) {
  const text = String(source || '');
  const failures = [];
  const links = [...text.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]);
  if (links.length === 0) {
    failures.push('map has zero markdown links; #1386 named this as the llms.txt failure mode');
  }
  for (const required of REQUIRED_LINKS) {
    if (!links.includes(required)) {
      failures.push(`missing official link ${required}`);
    }
  }
  if (!/midnight-js 4\.1\.1/.test(text) || !/proof-server 8\.1\.0/.test(text)) {
    failures.push('lab pins midnight-js 4.1.1 and proof-server 8.1.0 must be named');
  }
  if (!/Compact ~0\.31\.1/.test(text) || !/language ~0\.23/.test(text)) {
    failures.push('Compact ~0.31.1 / language ~0.23 pin must be named');
  }
  if (/(?<!not claim the )public indexer was fixed|(?<!or )node was fixed/i.test(text)) {
    failures.push('must not claim the public indexer or node was fixed');
  }
  return {
    ok: failures.length === 0,
    failures,
    linkCount: links.length,
    upstream: 'midnightntwrk/midnight-docs#1386',
  };
}

export function checkLabAeoLlmsIndex() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../docs/lab-llms.txt'), 'utf8');
  return checkAeoLlmsIndex(source);
}
