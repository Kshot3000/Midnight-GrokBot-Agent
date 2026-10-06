/**
 * Count exported circuits. Do not invent a protocol maximum.
 * Official: https://docs.midnight.network/compact/reference/compact-reference
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_CIRCUIT_COUNT = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_COMPACT_REFERENCE = 'https://docs.midnight.network/compact/reference/compact-reference';

function stripComments(source) {
  return String(source || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

export function checkCircuitCountSource(source) {
  const raw = String(source || '');
  const text = stripComments(raw);
  const failures = [];
  if (!/pragma language_version >= 0\.23/.test(text)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  const constructors = text.match(/\bconstructor\s*\(/g) || [];
  if (constructors.length > 1) {
    failures.push('Compact reference allows at most one constructor');
  }
  const exported = text.match(/\bexport\s+circuit\s+[A-Za-z_][A-Za-z0-9_]*/g) || [];
  if (exported.length < 1) {
    failures.push('sample must declare at least one export circuit so the count is observable');
  }
  if (/protocol maximum|max circuits\s*[:=]\s*\d+/i.test(raw)) {
    failures.push('do not invent a numeric protocol maximum; the Compact reference publishes none');
  }
  if (!/hits\.increment\(1\)/.test(text)) {
    failures.push('ledger-touching circuits must write the documented Counter.increment(1)');
  }
  return {
    ok: failures.length === 0,
    failures,
    exportedCircuits: exported.length,
    constructors: constructors.length,
    protocolMaximum: null,
    upstream: UPSTREAM_CIRCUIT_COUNT,
    official: OFFICIAL_COMPACT_REFERENCE,
  };
}
