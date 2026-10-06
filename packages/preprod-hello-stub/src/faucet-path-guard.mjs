/**
 * Refuse a Preprod faucet request whose path is bare `/api`.
 * Does not call the faucet and does not invent a drip API.
 * Official faucet UI: https://docs.midnight.network/relnotes/network
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/193
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_FAUCET_BARE_API = 'https://github.com/midnightntwrk/servicedesk/issues/193';
export const OFFICIAL_FAUCET_DOCS = 'https://docs.midnight.network/relnotes/network';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function pathnameOf(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  try {
    if (/^https?:\/\//i.test(raw)) return new URL(raw).pathname || '/';
  } catch {
    return raw;
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}

/**
 * Issue #193: the Preprod faucet router crashes on a bare `/api` request
 * because a regex match is used without a null check (router.ts:75).
 * This lab refuses that path before any fetch. The documented funding
 * path is the faucet UI, not a bare `/api` URL.
 */
export function checkFaucetRequestPath(input) {
  const pathname = pathnameOf(input).replace(/\/+$/, '') || '/';
  const failures = [];
  if (pathname === '/api') {
    failures.push(
      'bare /api crashes the Preprod faucet (unguarded null regex, servicedesk#193); do not request it',
    );
  }
  return {
    ok: failures.length === 0,
    pathname,
    failures,
    upstream: UPSTREAM_FAUCET_BARE_API,
    official: OFFICIAL_FAUCET_DOCS,
    credit: CREDIT,
  };
}
