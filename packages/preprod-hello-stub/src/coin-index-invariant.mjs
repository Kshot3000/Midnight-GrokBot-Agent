/**
 * Compact invariant for the shielded Merkle-index gap.
 * Does not call the compiler and does not invent a writeCoin overload.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/213
 * Official: https://docs.midnight.network/compact/data-types/ledger-adt
 * Official: https://docs.midnight.network/compact/standard-library/exports
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_COIN_INDEX = 'https://github.com/midnightntwrk/servicedesk/issues/213';
export const OFFICIAL_LEDGER_ADT = 'https://docs.midnight.network/compact/data-types/ledger-adt';
export const OFFICIAL_STDLIB = 'https://docs.midnight.network/compact/standard-library/exports';

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
 * Flag a Compact source that would persist a full qualified coin to capture
 * mtIndex. Official writeCoin targets QualifiedShieldedCoinInfo, whose fields
 * include value. receiveShielded does not return the allocated index.
 */
export function checkCoinIndexGap(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (/export\s+ledger\s+\w+\s*:\s*QualifiedShieldedCoinInfo/.test(code)) {
    failures.push('QualifiedShieldedCoinInfo ledger cell persists value along with mtIndex');
  }
  if (/\.writeCoin\s*\(/.test(code) || /\.insertCoin\s*\(/.test(code)) {
    failures.push('writeCoin/insertCoin fill a QualifiedShieldedCoinInfo cell, including value');
  }
  if (/writeCoin[^\n]{0,80}only\s+mtIndex/i.test(raw) || /writeCoin[^\n]{0,80}Uint\s*</.test(code)) {
    failures.push('docs do not define writeCoin targeting a bare Uint; do not invent that overload');
  }
  if (!/persistentCommit\s*</.test(code)) {
    failures.push('receipt path should use persistentCommit so the coin value is not the ledger cell');
  }
  if (!/disclose\s*\(/.test(code)) {
    failures.push('a commitment written to the ledger still needs disclose()');
  }
  if (/pragma\s+language_version\s+0\.2[0-2]\b/.test(code)) {
    failures.push('language pin must be 0.23');
  }

  return {
    ok: failures.length === 0,
    failures,
    stores: 'persistentCommit of nonce, color, and hashed value — not QualifiedShieldedCoinInfo',
    missingApi: 'no official writeCoin/receiveShielded return of mtIndex alone',
    upstream: UPSTREAM_COIN_INDEX,
    official: OFFICIAL_LEDGER_ADT,
    stdlib: OFFICIAL_STDLIB,
    credit: CREDIT,
  };
}
