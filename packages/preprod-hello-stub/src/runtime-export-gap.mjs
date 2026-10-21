/**
 * Classify a TypeScript "has no exported member" error for Compact runtime
 * names that exist on 0.20.0 but not on the matrix pin 0.16.0.
 * Does not import the runtime, does not compile Compact, and does not
 * contact a network.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564
 * Official: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1564';
export const OFFICIAL = 'https://docs.midnight.network/relnotes/support-matrix';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

const LEDGER9_ONLY = [
  'jubjubSchnorrSign',
  'jubjubSchnorrVerifyingKey',
  'sampleJubjubSchnorrSk',
];

export function decodeRuntimeExportGap(message) {
  const text = String(message || '');
  const isMissing = /has no exported member/.test(text) && /compact-runtime/.test(text);
  const hit = LEDGER9_ONLY.find((name) => text.includes(name));

  if (!isMissing || !hit) {
    return {
      ok: false,
      kind: 'other',
      hint: 'not a compact-runtime missing-export for a known ledger-9 name',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }

  return {
    ok: true,
    kind: 'runtime-export-gap',
    missing: hit,
    hint: `Stay on @midnight-ntwrk/compact-runtime@0.16.0 (Compact toolchain 0.31.1). ${hit} is on the 0.20.0 reference only. Do not invent the API.`,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const sample = "Module '\"@midnight-ntwrk/compact-runtime\"' has no exported member 'jubjubSchnorrSign'.";
  const result = decodeRuntimeExportGap(sample);
  if (!result.ok || result.missing !== 'jubjubSchnorrSign') {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, missing: result.missing, credit: CREDIT }, null, 2));
}
