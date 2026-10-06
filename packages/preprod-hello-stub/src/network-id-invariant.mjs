/**
 * Source check for contracts/hello-midnight/no-network-id.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official Kernel list: https://docs.midnight.network/compact/reference/ledger-adt
 * Official emit: https://docs.midnight.network/compact/reference/compact-reference
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_NETWORK_ID = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Flag a Compact snippet that reads a network id in-circuit or declares
 * an event type. The published Kernel section has no networkId operation.
 * `event` is reserved. emit takes a standard event type (ShieldedSpend
 * in the Compact reference) and is a static error in a constructor.
 * transientHash is not for deriving ledger state.
 */
export function checkNetworkIdSource(source) {
  const text = stripComments(source);
  const failures = [];

  if (!/pragma language_version >= 0\.23/.test(text)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (/kernel\s*\.\s*networkId\b/.test(text)) {
    failures.push('kernel.networkId is not a documented Kernel operation');
  }
  if (/\bnetworkId\s*\(/.test(text)) {
    failures.push('no documented in-circuit networkId read');
  }
  if (/\bevent\s+[A-Za-z_]/.test(text)) {
    failures.push('event is reserved; emit a CompactStandardLibrary event type instead');
  }
  if (/constructor\s*\([^)]*\)\s*\{[^}]*emit\s*\(/.test(text)) {
    failures.push('emit in a constructor is a documented static error');
  }
  if (/selfBytes\s*=\s*disclose\(\s*kernel\.self\(\)\.bytes\s*\)/.test(text) === false && /export ledger selfBytes/.test(text)) {
    failures.push('contract address bytes come from disclose(kernel.self().bytes), not a network id');
  }
  const noteSpend = text.match(/export circuit noteSpend[\s\S]*?\}/);
  if (noteSpend && !/emit\s*\(\s*ShieldedSpend\b/.test(noteSpend[0])) {
    failures.push('noteSpend must emit ShieldedSpend, the standard event in the Compact reference');
  }
  if (/deserialize\s*<\s*Boolean\s*,\s*1\s*>/.test(text) === false && /export circuit decodeFlag/.test(text)) {
    failures.push('decodeFlag must return deserialize<Boolean, 1>, the documented counterpart of emit serialization');
  }
  if (/transientHash\s*(<[^>]*>)?\s*\(/.test(text) && /=\s*disclose\(\s*transientHash/.test(text)) {
    failures.push('transientHash is not guaranteed across upgrades and must not derive ledger state');
  }

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_NETWORK_ID,
    credit: CREDIT,
  };
}
