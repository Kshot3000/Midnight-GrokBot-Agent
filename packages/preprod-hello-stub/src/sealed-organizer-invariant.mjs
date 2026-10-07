/**
 * Source check for sealed ledger fields and ownPublicKey caller checks.
 *
 * Does not compile Compact, call the proof server, or claim a deploy.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/902
 * Election sample: https://docs.midnight.network/examples/contracts/election
 * Security: https://docs.midnight.network/compact/smart-contract-security
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/902';
export const ELECTION = 'https://docs.midnight.network/examples/contracts/election';
export const SECURITY = 'https://docs.midnight.network/compact/smart-contract-security';

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

function sealedNames(text) {
  const names = [];
  const re = /export\s+sealed\s+ledger\s+([A-Za-z_][A-Za-z0-9_]*)\s*:/g;
  let match;
  while ((match = re.exec(text))) names.push(match[1]);
  return names;
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
 * Election comment: sealed ledger values cannot be changed after constructor
 * execution. Security page: do not use ownPublicKey() to verify the caller.
 */
export function checkSealedOrganizerSource(source) {
  const text = stripComments(source);
  const failures = [];
  const sealed = sealedNames(text);
  if (sealed.length === 0) {
    failures.push('missing export sealed ledger field');
  }
  if (!/pragma\s+language_version\s+>=?\s*0\.23/.test(text) && !/pragma\s+language_version\s+0\.23/.test(text)) {
    failures.push('language pin is not 0.23');
  }
  const constructorBody = sliceBlock(text, 'constructor');
  if (!constructorBody) {
    failures.push('missing constructor; sealed fields are set only there in the election sample');
  }
  for (const name of sealed) {
    const assign = new RegExp(`\\b${name}\\s*=(?!=)`);
    if (constructorBody && !assign.test(constructorBody)) {
      failures.push(`sealed field ${name} is not assigned in the constructor`);
    }
    if (constructorBody && assign.test(constructorBody) && !/disclose\s*\(/.test(constructorBody)) {
      failures.push(`constructor write of ${name} does not disclose the witness-derived value`);
    }
    for (const body of circuitBodies(text)) {
      if (assign.test(body)) {
        failures.push(`sealed field ${name} is assigned outside the constructor`);
      }
    }
  }
  if (/ownPublicKey\s*\(/.test(text)) {
    failures.push('ownPublicKey() is not a caller check; docs say it is a witness');
  }
  const circuits = circuitBodies(text).join('\n');
  if (sealed.length && circuits && !sealed.some((name) => new RegExp(`\\b${name}\\s*==`).test(circuits))) {
    failures.push('exported circuit does not assert sealed organizer equality');
  }
  return {
    ok: failures.length === 0,
    failures,
    sealed,
    upstream: UPSTREAM,
    docs: ELECTION,
    security: SECURITY,
    credit: CREDIT,
  };
}

export const builderCredit = CREDIT;
