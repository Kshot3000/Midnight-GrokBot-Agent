/**
 * Source check for contracts/hello-midnight/witness-branch-disclose.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/266';
export const OFFICIAL = 'https://docs.midnight.network/compact/reference/explicit-disclosure';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Confirm the sample discloses a witness before a conditional that writes the ledger.
 * Flags the rejected form that branches directly on a witness call.
 */
export function checkWitnessBranchDisclose(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+>=\s*0\.23\s*;/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary');
  }
  if (!/export\s+ledger\s+val:\s*Uint<64>\s*;/.test(code)) {
    failures.push('ledger val: Uint<64> required for the note');
  }
  if (!/witness\s+secretNum\s*\(\s*\)\s*:\s*Uint<64>\s*;/.test(code)) {
    failures.push('witness secretNum(): Uint<64> required');
  }
  // Accepted pattern: disclose(secretNum()) assigned, then if on that name
  const hasDiscloseAssign = /const\s+\w+\s*=\s*disclose\s*\(\s*secretNum\s*\(\s*\)\s*\)\s*;/.test(code);
  const hasIfOnDisclosed = /if\s*\(\s*\w+\s*>\s*5\s*\)/.test(code) && hasDiscloseAssign;
  const hasLedgerWrites = /val\s*=\s*1\s*;/.test(code) && /val\s*=\s*2\s*;/.test(code);

  if (!hasDiscloseAssign) {
    failures.push('must assign disclose(secretNum()) before the branch');
  }
  if (!hasIfOnDisclosed) {
    failures.push('branch must be on a disclosed quantity (not raw secretNum())');
  }
  if (!hasLedgerWrites) {
    failures.push('both arms must write the ledger (val = 1 / val = 2)');
  }
  // Reject the bare form
  if (/if\s*\(\s*secretNum\s*\(\s*\)\s*>\s*5\s*\)/.test(code)) {
    failures.push('direct branch on secretNum() without disclose is the rejected form from #266');
  }

  const ok = failures.length === 0;
  return {
    ok,
    kind: ok ? 'witness-branch-disclosed' : 'witness-branch-needs-disclose',
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL,
    message: ok
      ? 'sample discloses the witness before the ledger-writing branch'
      : failures.join('; '),
    credit: CREDIT,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const samplePath = path.join(
    process.cwd(),
    '../../contracts/hello-midnight/witness-branch-disclose.compact',
  );
  const src = fs.readFileSync(samplePath, 'utf8');
  const result = checkWitnessBranchDisclose(src);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
