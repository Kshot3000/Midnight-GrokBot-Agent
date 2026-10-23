/**
 * Source check for the disclosure-site forms reported in servicedesk#266.
 * Does not compile Compact, does not call proof-server 8.1.0, does not claim
 * a Preprod deploy or a fix of the public indexer or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 * Official: https://docs.midnight.network/guides/security-best-practices
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/266';
export const OFFICIAL = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export function checkDisclosureSitesSource(src) {
  const required = [
    'return disclose(secretValue())',
    'return x;',
    'assert(secretNum() > 5',
    'disclose(secretNum() > 5)',
    'm.member(disclose(k))',
    'stored = disclose(x)',
  ];
  const missing = required.filter((s) => !src.includes(s));
  return {
    ok: missing.length === 0,
    missing,
    credit: CREDIT,
    upstream: UPSTREAM,
    official: OFFICIAL,
  };
}
