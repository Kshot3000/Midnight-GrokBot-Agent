/**
 * Classify a node submission rejection that surfaces as 1010 Custom error 170.
 * Does not submit a transaction, does not call a node or proof server, and does
 * not claim to fix the public indexer or node.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/252
 * Observed message: 1010: Invalid Transaction: Custom error: 170
 * Reported as InvalidDustSpendProof on Stagenet when proved by proof-server 9.0.0-rc.9
 * (same shape proved by 9.0.0-rc.5 finalizes).
 *
 * Lab pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 * Official matrix: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/252';
export const MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} message
 */
export function decodeDustSpendProof170(message) {
  const text = typeof message === 'string' ? message : '';
  const is1010 = /\b1010\b/.test(text);
  const is170 = /Custom error:\s*170/.test(text) || /\berror\s*170\b/.test(text);
  const mentionsDust = /InvalidDustSpendProof|DUST-spend|dust.?spend/i.test(text);

  if (!text.trim()) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'empty submission message',
      hint: 'Pass the node rejection text. This helper does not submit.',
      upstream: UPSTREAM,
      credit: CREDIT,
    };
  }

  if (is1010 && is170) {
    return {
      ok: true,
      classification: 'dust-spend-proof-rejected',
      title: '1010 Custom error 170 (InvalidDustSpendProof surface)',
      hint:
        'Matches the reported Stagenet rejection of DUST-spend proofs produced by proof-server 9.0.0-rc.9 against node 2.0.0. The same transaction proved by 9.0.0-rc.5 was accepted. This lab does not fix the public node or proof server; check the support matrix and stay on a tested proof-server tag (lab pin 8.1.0).',
      upstream: UPSTREAM,
      docs: MATRIX,
      mentionsDust,
      claim: 'classification only — not a node, indexer, or proof-server fix',
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    title: 'not the recorded 1010/170 DUST-spend surface',
    hint: 'Look for 1010 and Custom error: 170 from the node rejection.',
    upstream: UPSTREAM,
    credit: CREDIT,
  };
}

export const dustSpendProof170Credit = CREDIT;
