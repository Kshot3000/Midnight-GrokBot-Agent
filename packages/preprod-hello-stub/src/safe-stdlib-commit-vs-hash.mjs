/**
 * Classify Compact source against the safe-stdlib disclosure rule.
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure#safe-compact-standard-library-routines
 *
 * Commit functions (transientCommit, persistentCommit) disguise witness data.
 * Hash functions (transientHash, persistentHash, keccak256, sha512) do not.
 * This classifier only labels text the caller already has. It does not compile,
 * does not call a proof server, and does not claim a public indexer or node fix.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const OFFICIAL_EXPLICIT_DISCLOSURE =
  'https://docs.midnight.network/compact/reference/explicit-disclosure#safe-compact-standard-library-routines';

export const COMMIT_FNS = Object.freeze(['transientCommit', 'persistentCommit']);
export const HASH_FNS = Object.freeze(['transientHash', 'persistentHash', 'keccak256', 'sha512']);

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} source
 */
export function classifySafeStdlibDisclosure(source) {
  const text = String(source || '');
  const notes = [];
  const failures = [];

  const hasCommit = COMMIT_FNS.some((fn) => text.includes(fn));
  const hasHash = HASH_FNS.some((fn) => text.includes(fn));

  if (hasCommit) {
    notes.push(
      'commit function present: official docs say transientCommit/persistentCommit disguise witness data when rand is random, so disclose is not required on the result.',
    );
  }
  if (hasHash) {
    const disclosed = /disclose\s*\(\s*(?:transientHash|persistentHash|keccak256|sha512)/.test(text);
    if (disclosed) {
      notes.push(
        'hash function is wrapped in disclose(): official docs say hash results carry the witness data of their inputs.',
      );
    } else {
      failures.push(
        'hash function (transientHash/persistentHash/keccak256/sha512) used without disclose. Official docs treat the result as still containing the witness data.',
      );
    }
  }
  if (!hasCommit && !hasHash) {
    failures.push('no commit or hash function named. Expected one of the official safe-stdlib routines.');
  }

  return {
    ok: failures.length === 0,
    hasCommit,
    hasHash,
    notes,
    failures,
    official: OFFICIAL_EXPLICIT_DISCLOSURE,
    credit: CREDIT,
  };
}
