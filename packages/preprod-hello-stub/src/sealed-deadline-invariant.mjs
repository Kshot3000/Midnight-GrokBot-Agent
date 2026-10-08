/**
 * Source check for the sealed deadline sample.
 *
 * Does not compile Compact, call the proof server, or claim a deploy.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/guides/security-best-practices
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function sliceBlock(text, keyword) {
  const start = text.search(new RegExp(`(?:export\\s+)?${keyword}\\b`));
  if (start < 0) return '';
  const brace = text.indexOf('{', start);
  if (brace < 0) return '';
  let depth = 0;
  for (let i = brace; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(brace + 1, i);
    }
  }
  return '';
}

function circuitBodies(text) {
  const bodies = [];
  const re = /export\s+circuit\s+[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)\s*(?::\s*\[[^\]]*\]\s*)?\{/g;
  let match;
  while ((match = re.exec(text))) {
    const brace = match.index + match[0].length - 1;
    let depth = 0;
    for (let i = brace; i < text.length; i += 1) {
      if (text[i] === '{') depth += 1;
      else if (text[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          bodies.push(text.slice(brace + 1, i));
          break;
        }
      }
    }
  }
  return bodies;
}

/**
 * Security guide: sealed deadline is set once; claim asserts blockTimeLt.
 * There is no raw block-time accessor.
 */
export function checkSealedDeadlineSource(source) {
  const text = stripComments(source);
  const failures = [];
  if (!/pragma\s+language_version\s+0\.23\b/.test(text)) {
    failures.push('language pin is not 0.23');
  }
  if (!/export\s+sealed\s+ledger\s+deadline\s*:\s*Uint\s*<\s*64\s*>/.test(text)) {
    failures.push('deadline must be export sealed ledger Uint<64>');
  }
  if (!/export\s+ledger\s+claimed\s*:\s*Boolean/.test(text)) {
    failures.push('claimed must be an unsealed Boolean ledger field');
  }
  if (/export\s+sealed\s+ledger\s+claimed\b/.test(text)) {
    failures.push('claimed must stay unsealed so claim can set it');
  }
  const constructorBody = sliceBlock(text, 'constructor');
  if (!constructorBody) failures.push('missing constructor');
  if (constructorBody && !/\bdeadline\s*=\s*disclose\s*\(/.test(constructorBody)) {
    failures.push('constructor must disclose deadlineTime into deadline');
  }
  if (constructorBody && !/\bclaimed\s*=\s*false\b/.test(constructorBody)) {
    failures.push('constructor must set claimed = false');
  }
  const circuits = circuitBodies(text);
  const claim = circuits.find((body) => /blockTimeLt\s*\(\s*deadline\s*\)/.test(body)) || '';
  if (!claim) failures.push('claim must assert blockTimeLt(deadline)');
  if (claim && !/assert\s*\(\s*blockTimeLt\s*\(\s*deadline\s*\)\s*,\s*"expired"\s*\)/.test(claim)) {
    failures.push('assert message must be "expired" as in the security guide');
  }
  if (claim && !/\bclaimed\s*=\s*true\b/.test(claim)) {
    failures.push('claim must set claimed = true after the time gate');
  }
  if (/\bblockTime\s*\(/.test(text)) {
    failures.push('no raw block-time accessor; use blockTimeLt');
  }
  for (const body of circuits) {
    if (/\bdeadline\s*=(?!=)/.test(body)) {
      failures.push('sealed deadline is assigned outside the constructor');
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const source = readFileSync(
    new URL('../../../contracts/hello-midnight/sealed-deadline.compact', import.meta.url),
    'utf8',
  );
  const result = checkSealedDeadlineSource(source);
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}

export const builderCredit = CREDIT;
