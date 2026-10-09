/**
 * Flag Compact sources that call a standard-library verify circuit and do not
 * assert the Boolean. Official page:
 * https://docs.midnight.network/compact/standard-library/exports
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Does not compile Compact, does not call midnight-js, and does not submit.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_ASSERT_VERIFY = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_EXPORTS = 'https://docs.midnight.network/compact/standard-library/exports';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const VERIFY_CALLS = [
  'ed25519Verify',
  'secp256r1EcdsaVerify',
  'secp256k1EcdsaVerify',
  'jubjubSchnorrVerify',
];

function stripComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function circuits(source) {
  const body = stripComments(source);
  const parts = body.split(/export\s+circuit\s+/);
  return parts.slice(1).map((part) => {
    const name = part.match(/^([A-Za-z_][A-Za-z0-9_]*)/)?.[1] ?? 'unknown';
    return { name, body: part };
  });
}

function asserted(body, call) {
  const callRe = new RegExp(`\\b${call}\\s*(?:<[^>]*>)?\\s*\\(`);
  if (!callRe.test(body)) return true;
  if (new RegExp(`assert\\s*\\(\\s*${call}\\s*(?:<[^>]*>)?\\s*\\(`).test(body)) return true;
  const assigned = body.match(new RegExp(`(?:const|let)\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*${call}\\s*(?:<[^>]*>)?\\s*\\(`));
  if (assigned && new RegExp(`assert\\s*\\(\\s*${assigned[1]}\\b`).test(body)) return true;
  return false;
}

/**
 * @param {string} source Compact source the caller already has
 */
export function scanAssertVerify(source) {
  const found = [];
  for (const circuit of circuits(source)) {
    for (const call of VERIFY_CALLS) {
      if (!new RegExp(`\\b${call}\\s*(?:<[^>]*>)?\\s*\\(`).test(circuit.body)) continue;
      if (!asserted(circuit.body, call)) {
        found.push({ circuit: circuit.name, call });
      }
    }
  }
  const ok = found.length === 0;
  return {
    ok,
    kind: ok ? 'verify-asserted' : 'verify-boolean-not-asserted',
    missing: found,
    upstream: UPSTREAM_ASSERT_VERIFY,
    official: OFFICIAL_EXPORTS,
    pins: { compact: '0.31.1', language: '0.23' },
    message: ok
      ? 'every verify call in an exported circuit is asserted, matching the standard-library note that these circuits return Boolean and do not enforce validity by themselves'
      : `verify returned Boolean without assert: ${found.map((item) => `${item.circuit}:${item.call}`).join(', ')}. Official exports say to assert the result is true. This does not compile Compact.`,
    credit: CREDIT,
  };
}
