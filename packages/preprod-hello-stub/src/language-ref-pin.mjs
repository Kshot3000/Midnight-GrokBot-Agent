/**
 * Classify a pasted Compact language version against the public-network pin.
 * Does not call a compiler, proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564
 * Official language reference (reviewed for 0.27.0):
 *   https://docs.midnight.network/compact/reference/compact-reference
 * Official support matrix (toolchain 0.31.1 / language ~0.23 / runtime 0.16.0):
 *   https://docs.midnight.network/relnotes/support-matrix
 * Official toolchain 0.31.0 notes (language version 0.23.0):
 *   https://docs.midnight.network/relnotes/compact/toolchain-0.31.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_LANGUAGE_REF = 'https://github.com/midnightntwrk/midnight-docs/issues/1564';
export const OFFICIAL_LANGUAGE_REF = 'https://docs.midnight.network/compact/reference/compact-reference';
export const OFFICIAL_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_TOOLCHAIN_031 = 'https://docs.midnight.network/relnotes/compact/toolchain-0.31.0';

export const PIN_LANGUAGE = '0.23';
export const REF_REVIEWED_LANGUAGE = '0.27.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {unknown} raw
 */
export function classifyLanguageVersion(raw) {
  const text = String(raw ?? '').trim();
  const match = text.match(/0\.(?:23|27)(?:\.\d+)?/);
  const version = match ? match[0] : null;

  if (!version) {
    return {
      kind: 'unrecognized',
      ok: false,
      version: null,
      hint: `no language version. Public networks pin ~${PIN_LANGUAGE} (toolchain 0.31.1). The Compact reference is reviewed for ${REF_REVIEWED_LANGUAGE}.`,
      upstream: UPSTREAM_LANGUAGE_REF,
      official: OFFICIAL_MATRIX,
      credit: CREDIT,
    };
  }

  if (version.startsWith('0.23')) {
    return {
      kind: 'public-network-pin',
      ok: true,
      version,
      hint: `matches the public-network floor used by Compact toolchain 0.31.1. The language reference is reviewed for ${REF_REVIEWED_LANGUAGE}; do not copy ledger-9-only constructs into a 0.23 contract.`,
      upstream: UPSTREAM_LANGUAGE_REF,
      official: OFFICIAL_TOOLCHAIN_031,
      credit: CREDIT,
    };
  }

  if (version.startsWith('0.27')) {
    return {
      kind: 'reference-ahead-of-matrix',
      ok: false,
      version,
      hint: `Compact reference is reviewed for ${REF_REVIEWED_LANGUAGE}. Public networks (Preview / Preprod / Mainnet) pin toolchain 0.31.1 / language ~${PIN_LANGUAGE} / runtime 0.16.0. A 0.27 contract targets the ledger 9 line and will not deploy to those networks.`,
      upstream: UPSTREAM_LANGUAGE_REF,
      official: OFFICIAL_LANGUAGE_REF,
      credit: CREDIT,
    };
  }

  return {
    kind: 'other',
    ok: false,
    version,
    hint: `unlisted version. Stay on the matrix pin ~${PIN_LANGUAGE}.`,
    upstream: UPSTREAM_LANGUAGE_REF,
    official: OFFICIAL_MATRIX,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const pin = classifyLanguageVersion('pragma language_version 0.23;');
  const ahead = classifyLanguageVersion('Reviewed 25 September 2026 for compatibility with Compact language version 0.27.0.');
  const ok = pin.ok && pin.kind === 'public-network-pin' && !ahead.ok && ahead.kind === 'reference-ahead-of-matrix';
  if (!ok) {
    console.error(JSON.stringify({ pin, ahead }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, pin: pin.version, ahead: ahead.version, credit: CREDIT }, null, 2));
}
