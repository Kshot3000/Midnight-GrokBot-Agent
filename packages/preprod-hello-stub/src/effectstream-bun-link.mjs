// effectstream-bun-link.mjs
// Classifies the published Bun setup path from EffectStream guides.
// Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1245
// Official: https://docs.midnight.network/how-to/bun-runtime-midnight
// Does not fetch pages, does not invent APIs, LOCAL-TRUE.
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
//
// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

export const OFFICIAL_BUN_PATH = '/how-to/bun-runtime-midnight';
export const STALE_RELATIVE = './install-bun-runtime-midnight';

/**
 * Classify a link string from the EffectStream guides.
 * @param {string} href
 * @returns {{ kind: 'official' | 'stale-relative' | 'unknown', path: string }}
 */
export function classifyBunLink(href) {
  if (typeof href !== 'string') {
    return { kind: 'unknown', path: '' };
  }
  const trimmed = href.trim();
  if (trimmed === OFFICIAL_BUN_PATH || trimmed.endsWith(OFFICIAL_BUN_PATH)) {
    return { kind: 'official', path: OFFICIAL_BUN_PATH };
  }
  if (trimmed === STALE_RELATIVE || trimmed.includes('install-bun-runtime-midnight')) {
    return { kind: 'stale-relative', path: STALE_RELATIVE };
  }
  return { kind: 'unknown', path: trimmed };
}

export function isOfficialBunLink(href) {
  return classifyBunLink(href).kind === 'official';
}
