/**
 * Flag the non-compiling transfer sample on the Test and debug page.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/getting-started/hello-world
 * Stale sample: https://docs.midnight.network/compact/test-and-debug
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_TRANSFER_BOUNDS =
  'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const STALE_TRANSFER_PAGE = 'https://docs.midnight.network/compact/test-and-debug';
export const OFFICIAL_DISCLOSE = 'https://docs.midnight.network/getting-started/hello-world';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * The published sample fails to compile for three reasons named in
 * midnight-docs#1487: a top-level const, Bytes<32>{}, and a ledger write
 * that needs disclose(). This check only classifies those shapes.
 */
export function checkTransferBounds(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+>=\s*0\.23\s*;/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary');
  }
  if (/^\s*const\s+[A-Za-z_][\w]*\s*:/m.test(code)) {
    failures.push('top-level const is the form midnight-docs#1487 says does not compile; keep bounds inside the circuit');
  }
  if (/Bytes<\d+>\s*\{\s*\}/.test(code)) {
    failures.push('Bytes<N>{} is the empty literal midnight-docs#1487 says does not compile');
  }
  const ledgerWrites = code.match(/\b(?:balance|recipient)\s*=\s*([^;]+);/g) || [];
  for (const write of ledgerWrites) {
    if (!/disclose\s*\(/.test(write)) {
      failures.push('ledger write of a circuit parameter needs disclose() before it crosses the public boundary');
      break;
    }
  }
  if (!/assert\s*\(\s*amount\s*>=\s*1/.test(code)) {
    failures.push('amount lower bound must be an in-circuit assert, not a top-level const');
  }
  if (!/assert\s*\(\s*amount\s*<=\s*1000000/.test(code)) {
    failures.push('amount upper bound must be an in-circuit assert');
  }
  if (!/assert\s*\(\s*balance\s*>=\s*amount/.test(code)) {
    failures.push('balance invariant must be asserted before the transfer');
  }
  if (!/recipient\s*=\s*disclose\s*\(\s*nextRecipient\s*\)/.test(code)) {
    failures.push('recipient ledger write must be disclose(nextRecipient)');
  }
  if (!/balance\s*=\s*disclose\s*\(/.test(code)) {
    failures.push('balance ledger write must disclose the updated amount');
  }

  return {
    ok: failures.length === 0,
    failures,
    language: '>= 0.23',
    compiler: '0.31.1',
    midnightJs: '4.1.1',
    proofServer: '8.1.0',
    upstream: UPSTREAM_TRANSFER_BOUNDS,
    official: OFFICIAL_DISCLOSE,
    stalePage: STALE_TRANSFER_PAGE,
    credit: CREDIT,
  };
}
